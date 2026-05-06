/**
 * dev-watch.mjs — `make run-dev` で起動するローカル開発用ビルド監視スクリプト
 *
 * ## なぜ `next dev`（HMR）を使わないのか
 * Tailwind v4 + webpack/Turbopack の組み合わせで CSS が壊れる既知の問題があるため、
 * 本番と同じ `next build` → `next start` のサイクルで動作確認する必要がある。
 * `next dev` への差し替えは CSS 崩壊を引き起こすので行わないこと。
 *
 * ## 設計上の主な判断
 *
 * ### ビルド中の変更は `pendingRestart` でキューイング
 * ビルド実行中に新たなファイル変更を検知した場合、即座に中断せず `pendingRestart = true`
 * にセットしてビルド完了後に再ビルドする。中途半端な `.next` 成果物を残さないため。
 *
 * ### 再ビルド前にサーバーを完全停止してから `next build` を開始する
 * `next start` と `next build` が同時に `.next/` を読み書きすると成果物が壊れるため、
 * `stopServer()` の Promise 解決を待ってから `startBuild()` を呼ぶ。
 *
 * ### 通常の再ビルドでは `.next` を削除しない
 * `next build` は内部で `cleanDistDir`（`.next/cache/` 以外を削除）を実行するため、
 * 通常はそれに委ねる。`.next` を外部から削除すると `cleanDistDir` との二重削除になり
 * 逆に競合を生む可能性がある。
 *
 * ### `pendingRestart` 経由の再ビルドのみ `.next` を全削除する
 * ビルドが中断されると `.next/` が中途半端な状態になるため、次のビルド前に全削除して
 * クリーンな状態を保証する。
 *
 * ### ビルド失敗時の自動リトライ（MAX_BUILD_RETRIES 回）
 * `next build` の `cleanDistDir` はビルド開始直後にマニフェストファイルを削除するが、
 * 内部ワーカーがそのファイルを読もうとするタイミング次第で ENOENT が発生することがある。
 * Next.js 内部の競合であり外部から制御できないため、失敗時に `.next` を全削除して
 * リトライすることで回避する。リトライは 1 回で十分（それ以上は根本原因が別にある）。
 *
 * ### BUILD_SETTLE_DELAY_MS の待機
 * 再ビルド直前に短い待機を挟み、OS のファイルシステムキャッシュが落ち着くのを待つ。
 */
import { rm } from 'node:fs/promises';
import { spawn } from 'child_process';
import chokidar from 'chokidar';

const WATCH_PATHS = ['src/', 'public/', 'next.config.ts', 'postcss.config.mjs'];
const WATCH_EXTENSIONS = /\.(mjs|ts|tsx|js|jsx|css|json|yaml|yml|svg|png|jpg|ico)$/;
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /tmp\//,
  /coverage\//,
  /dist\//,
  /test-results\//,
  /tsconfig\.tsbuildinfo/,
];
const DEBOUNCE_MS = 1500;
const PORT = 3967;
const PROCESS_EXIT_TIMEOUT_MS = 5000;
const BUILD_SETTLE_DELAY_MS = 500;
const MAX_BUILD_RETRIES = 1;

let buildProcess = null;
let serverProcess = null;
let pendingRestart = false;
let isBuilding = false;
let buildRetryCount = 0;
let isStoppingServer = false;
let stoppingPromise = null;
let isCleaningUp = false;
let debounceTimer = null;

function log(msg) {
  console.log(`[dev-watch] ${msg}`);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function cleanNextDir() {
  log('.next ディレクトリを削除します...');
  await rm('.next', { recursive: true, force: true });
}

function terminateProcess(childProcess, processName) {
  return new Promise((resolve) => {
    let forceKillTimer = null;
    let fallbackTimer = null;

    const finish = () => {
      clearTimeout(forceKillTimer);
      clearTimeout(fallbackTimer);
      resolve();
    };

    childProcess.once('exit', finish);

    try {
      const didSendSignal = childProcess.kill('SIGTERM');
      if (!didSendSignal) {
        console.error('[terminateProcess] SIGTERM の送信に失敗しました:', {
          processName,
          pid: childProcess.pid,
        });
        finish();
        return;
      }
    } catch (error) {
      console.error('[terminateProcess] プロセス停止に失敗しました:', {
        processName,
        pid: childProcess.pid,
        error,
      });
      finish();
      return;
    }

    forceKillTimer = setTimeout(() => {
      if (childProcess.exitCode !== null || childProcess.signalCode !== null) {
        return;
      }

      console.error('[terminateProcess] 停止がタイムアウトしたため SIGKILL を送信します:', {
        processName,
        pid: childProcess.pid,
      });

      try {
        childProcess.kill('SIGKILL');
      } catch (error) {
        console.error('[terminateProcess] SIGKILL の送信に失敗しました:', {
          processName,
          pid: childProcess.pid,
          error,
        });
        finish();
        return;
      }

      fallbackTimer = setTimeout(() => {
        if (childProcess.exitCode === null && childProcess.signalCode === null) {
          console.error('[terminateProcess] 強制終了後もプロセスが残存しています:', {
            processName,
            pid: childProcess.pid,
          });
        }
        finish();
      }, 1000);
    }, PROCESS_EXIT_TIMEOUT_MS);
  });
}

async function stopServer() {
  if (stoppingPromise) {
    await stoppingPromise;
    return;
  }

  if (!serverProcess) {
    return;
  }

  const currentServerProcess = serverProcess;
  serverProcess = null;
  isStoppingServer = true;
  log('サーバーを停止します...');

  stoppingPromise = terminateProcess(currentServerProcess, 'サーバー').finally(() => {
    isStoppingServer = false;
    stoppingPromise = null;
  });

  await stoppingPromise;
}

function startServer() {
  log('サーバーを起動します...');
  const nextServerProcess = spawn('node_modules/.bin/next', ['start', '-p', String(PORT)], {
    stdio: 'inherit',
    env: { ...process.env, BROWSER: 'none' },
  });

  serverProcess = nextServerProcess;

  nextServerProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[dev-watch] サーバーが異常終了しました (code: ${code})`);
    }
    if (serverProcess === nextServerProcess) {
      serverProcess = null;
    }
  });
}

function startBuild() {
  isBuilding = true;
  pendingRestart = false;
  log('ビルドを開始します...');

  const nextBuildProcess = spawn('node_modules/.bin/next', ['build'], {
    stdio: 'inherit',
  });

  buildProcess = nextBuildProcess;

  nextBuildProcess.on('exit', async (code) => {
    if (buildProcess === nextBuildProcess) {
      buildProcess = null;
    }

    if (isCleaningUp) {
      isBuilding = false;
      return;
    }

    if (code === 0) {
      buildRetryCount = 0;
      log('ビルド成功');
      if (pendingRestart) {
        log('変更を検知したため再ビルドします');
        await sleep(BUILD_SETTLE_DELAY_MS);
        if (isCleaningUp) {
          isBuilding = false;
          return;
        }
        await cleanNextDir();
        startBuild();
      } else {
        isBuilding = false;
        startServer();
      }
    } else {
      console.error(`[dev-watch] ビルド失敗 (code: ${code})`);
      if (pendingRestart) {
        log('変更を検知したため再ビルドします');
        await sleep(BUILD_SETTLE_DELAY_MS);
        if (isCleaningUp) {
          isBuilding = false;
          return;
        }
        await cleanNextDir();
        startBuild();
      } else if (buildRetryCount < MAX_BUILD_RETRIES) {
        buildRetryCount++;
        log(`ビルドを自動リトライします (${buildRetryCount}/${MAX_BUILD_RETRIES})...`);
        await sleep(BUILD_SETTLE_DELAY_MS);
        if (isCleaningUp) {
          isBuilding = false;
          return;
        }
        await cleanNextDir();
        startBuild();
      } else {
        buildRetryCount = 0;
        isBuilding = false;
        log('ファイル変更を待機中...');
      }
    }
  });
}

async function rebuildAfterChange(filePath) {
  log(`変更検知: ${filePath}`);
  buildRetryCount = 0;
  await stopServer();
  isBuilding = true;
  startBuild();
}

function onFileChange(filePath) {
  if (!WATCH_EXTENSIONS.test(filePath)) return;

  if (isBuilding) {
    log(`変更検知 (ビルド中): ${filePath} → ビルド完了後に再ビルドします`);
    pendingRestart = true;
    return;
  }

  if (isStoppingServer) {
    log(`変更検知 (サーバー停止中): ${filePath} → 次のビルドに含めます`);
    pendingRestart = true;
    return;
  }

  // デバウンス処理
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void rebuildAfterChange(filePath);
  }, DEBOUNCE_MS);
}

// 起動
log('起動します...');
startBuild();

// ファイル監視
const watcher = chokidar.watch(WATCH_PATHS, {
  ignoreInitial: true,
  ignored: IGNORE_PATTERNS,
  persistent: true,
});

watcher.on('change', onFileChange);
watcher.on('add', onFileChange);
watcher.on('unlink', onFileChange);

// プロセス終了ハンドリング
async function cleanup() {
  if (isCleaningUp) {
    return;
  }

  isCleaningUp = true;
  log('終了処理を実行します...');
  watcher.close();

  clearTimeout(debounceTimer);
  await stopServer();

  if (buildProcess) {
    const currentBuildProcess = buildProcess;
    buildProcess = null;
    await terminateProcess(currentBuildProcess, 'ビルドプロセス');
  }

  process.exit(0);
}

process.on('SIGINT', () => {
  void cleanup();
});
process.on('SIGTERM', () => {
  void cleanup();
});
