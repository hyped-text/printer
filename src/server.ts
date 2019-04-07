import Koa from 'koa';
import http, { Server } from 'http';
import config from './config';
import createLogger from 'hyped-logger';

const logger = createLogger();

const port = config.get('port');

export default async (app: Koa) => {
  const server: Server = http.createServer(app.callback()).listen(port, () => {
    const address: any = server.address();

    logger.info(`printer listens ${address.port}`);

    if (process.send) {
      process.send('ready');
    }

    process.on('message', (msg: string) => {
      if (msg === 'shutdown') {
        logger.info('Closing all connections...');

        process.nextTick(() => {
          logger.info('Finished closing connections');
          process.exit(0);
        }, 1500);
      }
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received.');

      server.close(
        (): void => {
          process.exit();
        }
      );
    });
  });
};
