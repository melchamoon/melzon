import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const imageField = z
  .union([
    z.string().startsWith('/products/'),
    z.array(z.string().startsWith('/products/')).min(1),
  ])
  .transform((v) => (Array.isArray(v) ? v : [v]));

const productSchema = z
  .object({
    id: z.string().regex(/^p_\d{3}$/),
    name: z.string().min(1),
    price: z.number().int().min(1).max(1_000_000),
    image: imageField,
    description: z.string(),
    reviews: z.array(z.string()).min(1).max(3),
    featured: z.boolean().optional(),
    category: z.string().optional(),
  })
  .transform(({ image, ...rest }) => ({ ...rest, images: image }));

const file = join(root, 'src/data/products.yaml');
const raw = readFileSync(file, 'utf-8');
const parsed = yaml.load(raw);
const products = z.array(productSchema).parse(parsed);

const out = `// AUTO-GENERATED — do not edit manually. Run: node scripts/gen-products.mjs
import type { Product } from '@/types/product';

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

writeFileSync(join(root, 'src/data/products.generated.ts'), out, 'utf-8');
console.log(`gen-products: ${products.length} products written.`);
