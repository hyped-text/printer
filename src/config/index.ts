// tslint:disable-next-line
require('dotenv').config();
import nconf from 'nconf';
import path from 'path';

const config = nconf
  .env()
  .argv()
  .file({ file: path.join(__dirname, './config.json') });

export default config;
