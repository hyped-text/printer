import Koa from 'koa';
import createLogger from 'hyped-logger';
import middlewares from './middlewares';

const logger = createLogger();

const app = new Koa();

for (const middleware of middlewares) {
  app.use(middleware);
}

app.on('error', (err: Error) => {
  console.error(err);
});

export default app;
