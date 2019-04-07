import fs from 'fs';
import { resolve } from 'path';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import mkdirp from 'mkdirp';
import uuid from 'uuid/v4';
import http, { IncomingMessage } from 'http';
import EpubParser from '../lib/parsers/EpubParser';
import { Upload as UploadInterface, StoredFile } from '../types';
const { GraphQLUpload } = require('graphql-upload');

const UPLOAD_DIR = './static/uploads';

// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR);

// Seed an empty DB
const db = lowdb(new FileSync(resolve(UPLOAD_DIR, 'db.json')));


const storeFS = ({ stream, filename }: any): Promise<StoredFile> => {
  const id = uuid();
  const path = `${UPLOAD_DIR}/${id}-${filename}`;
  return new Promise((resolve, reject) =>
    stream
      .on('error', (error: Error) => {
        if (stream.truncated) {
          // Delete the truncated file.
          fs.unlinkSync(path);
        }
        reject(error);
      })
      .pipe(fs.createWriteStream(path))
      .on('error', reject)
      .on('finish', () => resolve({ id, path }))
  );
};

export const download = (url: string, path: string): Promise<StoredFile> => {
  const file = fs.createWriteStream(path);

  return new Promise((resolve: any, reject: any) => {
    http
      .get(url, async (response: IncomingMessage) => {
        if (response.statusCode == 302) {
          response.destroy();
          await download(response.headers.location!, path);
          return resolve({ path, id: response.headers.location! });
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(); // close() is async, call cb after close completes.
          resolve({ path, id: url });
        });
      })
      .on('error', (err: Error) => {
        // Handle errors
        fs.unlink(path, () => reject(err)); // Delete the file async. (But we don't check the result)
      });
  });
};

const storeDB = (file: UploadInterface) =>
  db
    .get('uploads')
    .push(file)
    .last()
    .write();

const processUpload = async (upload: Promise<UploadInterface>): Promise<UploadInterface> => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const { id, path } = await storeFS({ stream, filename });
  await storeDB({ id, filename, mimetype, path, createReadStream });
  return { id, filename, mimetype, path, createReadStream };
};

const processDownload = async (url: string): Promise<any> => {
  const id = uuid();
  const path = resolve(UPLOAD_DIR, id);
  await download(url, path);
  return { id, path };
};

export default {
  Upload: GraphQLUpload,
  Element: {
    __resolveType(obj: object | any) {
      if (obj.contents) {
        return 'TableOfContents';
      }

      return null;
    },
  },
  Query: {
    async print(_: any, { file, url }: any) {
      const { path } = file ? await processUpload(file) : await processDownload(url);

      return EpubParser().parse(path);
    },
  },
};
