import Router from 'koa-router';
import { formatController } from '../controllers';

const router = new Router().get('/format', formatController().format);

export const routes = () => router.routes();

export const allowedMethods = () => router.allowedMethods();