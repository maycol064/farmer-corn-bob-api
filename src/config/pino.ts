import pino from 'pino';
import { env } from './env.js';

const isDev = env.nodeEnv !== 'production' && process.stdout.isTTY;

let destination: any = undefined;
if (isDev) {
  try {
    destination = pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'HH:MM:ss.l',
      },
    });
  } catch {
    destination = undefined;
  }
}

export const logger = destination
  ? pino({ level: isDev ? 'debug' : 'info' }, destination)
  : pino({ level: isDev ? 'debug' : 'info' });
