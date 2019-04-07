import { Parser } from '../../types';
import uuid from 'uuid/v4';
const EPub = require('epub');

export class EpubParser implements Parser {
  async parse(path: string) {
    const epub = new EPub(path);

    epub.parse();

    return new Promise(resolve => epub.on('end', () => {
      console.log(Object.keys(epub));
      const tocElements = epub.toc.map(({ id, title }: any) => ({ id, title }));

      const toc = {
        id: uuid(),
        type: 'TABLE_OF_CONTENTS',
        index: 0,
        text: '',
        title: null,
        parent: null,
        contents: tocElements
      };

      resolve({
        elements: [toc]
      })
    }));
  }
}

export default () => new EpubParser();
