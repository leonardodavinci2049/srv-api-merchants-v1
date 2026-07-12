import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const parseEnvFile = (content: string) => {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let val = match[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
};

const loadEnv = () => {
  try {
    process.loadEnvFile();
  } catch {
    // Ignore error and fall back to manual loading
  }

  const paths = [
    join(process.cwd(), '.env'),
    join(process.cwd(), '..', '.env'),
    join(__dirname, '..', '..', '..', '.env'),
  ];

  for (const path of paths) {
    try {
      const content = readFileSync(path, 'utf8');
      parseEnvFile(content);
      break;
    } catch {
      // Try next path
    }
  }
};

loadEnv();

const envsSchema = z.object({
  APP_API_URL: z.string().min(1),
  APP_JWT_SECRET: z.string().min(1),
  APP_PORT: z.coerce.number().positive(),
  API_KEY: z.string().min(1),
  DB_MYSQL_HOST: z.string().min(1),
  DB_MYSQL_PORT: z.coerce.number().positive(),
  DB_MYSQL_USER: z.string().min(1),
  DB_MYSQL_PASSWORD: z.string().min(1),
  DB_MYSQL_DATABASE: z.string().min(1),
  SHOPEE_API_ENDPOINT: z.url(),
  SHOPEE_API_TIMEOUT_MS: z.coerce.number().int().positive(),
  SHOPEE_AFFILIATE_SUBIDS: z.string().min(1),
  SHOPEE_APP_ID: z.coerce.number().int().positive(),
  SHOPEE_FLAG_CLICK: z.coerce.number().int().min(0),
  SHOPEE_CURRENCY: z.string().min(1),
  SHOPEE_LOCATION: z.string().min(1),
});

const envData = {
  ...process.env,
  DB_MYSQL_HOST: process.env.DB_MYSQL_HOST ?? process.env.DATABASE_HOST,
  DB_MYSQL_PORT: process.env.DB_MYSQL_PORT ?? process.env.DATABASE_PORT,
  DB_MYSQL_USER: process.env.DB_MYSQL_USER ?? process.env.DATABASE_USER,
  DB_MYSQL_PASSWORD:
    process.env.DB_MYSQL_PASSWORD ?? process.env.DATABASE_PASSWORD,
  DB_MYSQL_DATABASE: process.env.DB_MYSQL_DATABASE ?? process.env.DATABASE_NAME,
};

const result = envsSchema.safeParse(envData);

if (!result.success) {
  const formatted = result.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`❌ Invalid environment variables:\n${formatted}`);
}

const envVars = result.data;

export const envs = {
  APP_JWT_SECRET: envVars.APP_JWT_SECRET,
  APP_PORT: envVars.APP_PORT,
  API_KEY: envVars.API_KEY,
  DB_MYSQL_HOST: envVars.DB_MYSQL_HOST,
  DB_MYSQL_PORT: envVars.DB_MYSQL_PORT,
  APP_API_URL: envVars.APP_API_URL,
  DB_MYSQL_USER: envVars.DB_MYSQL_USER,
  DB_MYSQL_PASSWORD: envVars.DB_MYSQL_PASSWORD,
  DB_MYSQL_DATABASE: envVars.DB_MYSQL_DATABASE,
  SHOPEE_API_ENDPOINT: envVars.SHOPEE_API_ENDPOINT,
  SHOPEE_API_TIMEOUT_MS: envVars.SHOPEE_API_TIMEOUT_MS,
  SHOPEE_AFFILIATE_SUBIDS: envVars.SHOPEE_AFFILIATE_SUBIDS,
  SHOPEE_APP_ID: envVars.SHOPEE_APP_ID,
  SHOPEE_FLAG_CLICK: envVars.SHOPEE_FLAG_CLICK,
  SHOPEE_CURRENCY: envVars.SHOPEE_CURRENCY,
  SHOPEE_LOCATION: envVars.SHOPEE_LOCATION,
};
