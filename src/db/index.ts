import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Gunakan DATABASE_URL dari .env (pastikan pgbouncer=true jika pakai Supabase Pooler)
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch untuk kompatibilitas dengan PGBouncer/Supabase Pooler
const client = postgres(connectionString, { 
  prepare: false,
  ssl: 'require' 
});
export const db = drizzle(client, { schema });
