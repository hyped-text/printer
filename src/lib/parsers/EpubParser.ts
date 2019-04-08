import EPub from 'epub';
import uuid from 'uuid/v4';
import { promisify } from 'util';
import { Parser, Element, ElementType, TableOfContents } from '../../types';

interface TocElement {
  level: number;
  order: number;
  title: string;
  id: string;
  href?: string;
}

interface FlowElement {
  id: string;
  title: string;
}

export class EpubParser implements Parser {
  async parse(path: string) {
    const epub = new EPub(path);

    epub.parse();

    return new Promise(resolve =>
      epub.on('end', async () => {
        const tocElements = epub.toc.map(({ id, title }: TocElement) => ({ id, title }));

        const toc: TableOfContents = {
          id: uuid(),
          type: ElementType.TABLE_OF_CONTENTS,
          index: 0,
          text: '',
          contents: tocElements,
        };

        const flow: FlowElement[] = epub.flow as FlowElement[];

        const chapters: Element[] = await Promise.all(
          flow.map(
            async ({ id, title }: FlowElement, index: number): Promise<Element> => ({
              id,
              title,
              index,
              type: ElementType.CHAPTER,
              text: await promisify(epub.getChapterRaw.bind(epub))(id),
            })
          )
        );

        const elements: Element[] = [toc].concat(chapters);

        resolve({
          elements,
        });
      })
    );
  }
}

export default () => new EpubParser();
