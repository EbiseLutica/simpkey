import { Context, DefaultState } from 'koa';
import views from 'koa-views';
import Router from 'koa-router';
import config from './config';
import { signIn, api, i } from './misskey';
import { Note } from './models/Note';
import { User } from './models/User';

export const die = (ctx: Context, error: string): Promise<void> => {
	ctx.status = 400;
	return ctx.render('error', { error });
};

export const render = views(__dirname + '/views', {
	extension: 'pug', options: {
		...config,
		getAcct: (user: User) =>  user.host ? `@${user.username}@${user.host}` : `@${user.username}`,
		getUserName: (user: User) => user.name || user.username,
	}
});

export const router = new Router<DefaultState, Context>();

const staticRouting = [
	[ 'about', 'Simpkey について' ],
	[ 'terms', '利用規約' ],
	[ 'privacy-policy', 'プライバシーポリシー' ],
];

for (const [ name, title ] of staticRouting) {
	router.get('/' + name, async (ctx, next) => {
		await ctx.render(name, { title });
		await next();
	});
}

async function timeline(ctx: Context, host: string, endpoint: string, timelineName: string, token: string) {
	const user = await i(host, token);

	const timeline = await api<Note[]>(host, endpoint, { i: token });
	await ctx.render('timeline', {
		title: timelineName + ' - Simpkey',
		user, timeline, timelineName
	});
}

router.get('/ltl', async (ctx, next) => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
	} else {
		const meta = await api<any>(host, 'meta', { i: token });
		if (meta.disableLocalTimeline) {
			await die(ctx, 'ローカルタイムラインは無効化されています');
		} else {
			await timeline(ctx, host, 'notes/local-timeline', 'ローカルタイムライン', token);
		}
	}
	await next();
});

router.get('/', async (ctx, next) => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		console.log('no session so show top page');
		await ctx.render('index', { 
			title: 'Simpkey'
		});
	} else {
		console.log('show timeline with the session');
		await timeline(ctx, host, 'notes/timeline', 'ホームタイムライン', token);
	}
	await next();
});

router.post('/', async (ctx) => {
	const { 
		host,
		username,
		password,
		token
	} = ctx.request.body;
	if (!host || !username || !password) {
		await die(ctx, 'パラメータが足りません');
		return;
	}
	try {
		const { id, i } = await signIn(host, username, password, token);
		ctx.cookies.set('id', id);
		ctx.cookies.set('host', host);
		ctx.cookies.set('i', i);
		console.log('login as ' + username);
		ctx.redirect('/');
	} catch (err) {
		await die(ctx, err.message);
		console.error(err);
	}
});