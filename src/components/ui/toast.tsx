'use client';

import * as React from 'react';

type ToastContextValue = {
  toast: (title: string) => void;
};

const ToastContext = React.createContext<ToastContextValue>({ toast: () => {} });

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<{ id: number; title: string }[]>([]);
  const idRef = React.useRef(0);

  const toast = React.useCallback((title: string) => {
    const id = ++idRef.current;
    setMessages((prev) => [...prev, { id, title }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-ink-900 border border-gold-700 text-gold-200 rounded-lg p-4 shadow-lg pointer-events-auto"
          >
            <p className="font-semibold text-gold-400">{m.title}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
