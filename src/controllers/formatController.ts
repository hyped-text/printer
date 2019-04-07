import { Context } from 'koa';
import fetch from 'node-fetch';
import formatter from '../lib/formatter';

const format = async (res: Response | any): Promise<string> => {
  const contentType = res.headers.get('Content-type');

  switch(contentType) {
    case 'text/html':
    case 'text/html; charset=utf-8':
      return formatter.html(res);
    case 'text/plain; charset=ISO-8859-1':
    case 'text/plain; charset=utf-8':
      return formatter.txt(res);
    case 'application/epub+zip':
      return formatter.epub(res);
    default:
      return res.text();
  }
}

export const formatController = () => ({
  async format(ctx: Context) {
    if (ctx.query.source) {
      const source: string = await fetch(ctx.query.source).then(format);

      ctx.res.setHeader('Content-type', 'text/html');

      ctx.body = source;
    }
  },
});
