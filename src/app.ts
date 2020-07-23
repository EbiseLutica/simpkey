import Koa from 'koa';
import { router, render } from '.';
import config from './config';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';


const app = new Koa();

console.log('Simpkey v' + config.version);

app.use(bodyParser());
app.use(render);
app.use(router.routes());
app.use(router.allowedMethods());

console.log('App launched!');

app.listen(3000);