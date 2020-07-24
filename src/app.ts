import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import { router } from './router';
import constant from './const';
import { render } from './render';
import fs from 'fs';

const conf = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf-8'));

const app = new Koa();

console.log('Simpkey v' + constant.version);

app.use(bodyParser());
app.use(render);
app.use(router.routes());

console.log(`listening port ${conf.port}...`);

console.log('App launched!');

app.listen(conf.port || 3000);