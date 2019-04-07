import cheerio from 'cheerio';
import { promisify } from 'util';
import { writeFile } from 'fs';
import { EpubParser } from '@ridi/epub-parser';
import isRelativeUrl from 'is-relative-url';
import isAbsoluteUrl from 'is-absolute-url';

const getLastUrlFragment = (url: string) => url.substr(url.lastIndexOf('/') + 1);

const toAbsoluteUrl = (url: string, base: string) => base.slice(0, base.indexOf(getLastUrlFragment(base))) + url;

const trimGutenbergHead = (text: string) => {
  const start = text.match(/(\*{3,})+ START OF THIS PROJECT GUTENBERG EBOOK .+?(\*{3,})+(.*)/);

  const end = text.match(/(\*{3,})+ END OF THIS PROJECT GUTENBERG EBOOK .+?(\*{3,})+(.*)/);

  return start && end ? text.slice(start.index! + start[0].length, end.index).trim() : text.trim();
};

const processHtml = (text: string, url: string) => {
  const isGutenbergsText = url.indexOf('gutenberg.org') !== -1;

  if (isGutenbergsText) {
    text = trimGutenbergHead(text);
  }

  const $ = cheerio.load(text, {
    decodeEntities: false,
  });

  const tagsToRemove = ['pre', 'link', 'script'];

  for (const tag of tagsToRemove) {
    $.root()
      .find(tag)
      .remove();
  }

  if (isGutenbergsText) {
    $.root()
      .find('p')
      .filter((_: number, el: CheerioElement) => {
        const html = cheerio(el).html();

        return !!html && (!!html.match(/produced by.+?/gi) || !!html.match(/end of the project gutenberg ebook/gi));
      })
      .remove();
  }

  $.root()
    .find('img')
    .each((_: number, el: CheerioElement) => {
      const src = cheerio(el).attr('src');

      if (isRelativeUrl(src) && !isAbsoluteUrl(src)) {
        cheerio(el).attr('src', toAbsoluteUrl(src, url));
      }
    });

  const html = $.html();

  return html && html.toString();
};

export default {
  async txt(res: Response): Promise<string> {
    const text = await res.text();

    if (res.url.indexOf('gutenberg.org') !== -1) {
      return trimGutenbergHead(text);
    }

    return text.trim();
  },
  async html(res: Response): Promise<string> {
    const text = await res.text();

    return processHtml(text, res.url);
  },
  async epub(res: Response): Promise<string> {
    const doc = await res.arrayBuffer();

    let buffer = Buffer.from(doc);

    await promisify(writeFile)('temp.epub', buffer);

    const parser = new EpubParser('temp.epub');

    const book = await parser.parse();

    const chapters = await parser.readItems(book.spines);

    const text = chapters.join('');

    return processHtml(text, res.url);
  },
};
