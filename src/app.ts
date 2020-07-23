import Koa from 'koa';
import { router } from './router';
import config from './config';
import bodyParser from 'koa-bodyparser';
import { render } from './render';


const app = new Koa();

console.log('Simpkey v' + config.version);

app.use(bodyParser());
app.use(render);
app.use(router.routes());

console.log('App launched!');

app.listen(3000);