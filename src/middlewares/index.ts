import { errorHandler, execute } from 'graphql-api-koa';
import loggerWinston from 'koa-logger-winston';
import bodyParser from 'koa-bodyparser';
import createLogger from 'hyped-logger';
import upload from './upload';
import error from './error';
import notFound from './notFound';
import { schema } from '../schema';

export default [
  errorHandler(),
  loggerWinston(createLogger()),
  bodyParser(),
  upload(),
  execute({ schema }),
  error(),
  notFound(),
];
