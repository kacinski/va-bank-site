// This file demonstrates a simple query to Vercel Postgres (Neon)
import { sql } from '@vercel/postgres';

export async function getSampleData() {
  // Пример простого запроса
  const result = await sql`SELECT NOW()`;
  return result.rows[0];
}

// Пример использования в API route или серверном компоненте:
// import { getSampleData } from '../../lib/db';
// export default async function Page() {
//   const data = await getSampleData();
//   return <pre>{JSON.stringify(data, null, 2)}</pre>;
// }
