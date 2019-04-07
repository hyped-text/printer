import { Context, Middleware } from 'koa';

// catch 404 and forward to error handler
export default () => (ctx: Context) => {
  ctx.status = 404;
};
