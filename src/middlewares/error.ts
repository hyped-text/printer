import { Context, Middleware } from 'koa';

export default () => async (ctx: Context, next: Middleware) => {
  try {
      await (next as any)(ctx);
  } catch (err) {
      ctx.status = err.statusCode || err.status || 500;

      ctx.body = {
          message: err.message
      };
  }
}