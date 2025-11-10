import { env } from './config/env.js';
import { buildApp } from './app.js';
import { redis } from './infrastructure/redis/client.js';

async function main() {
  // check Redis antes de levantar el server
  await redis.ping();

  const app = buildApp();
  app.listen(env.port, () => {
    console.log(`Bob's Corn API listening on :${env.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
