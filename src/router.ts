import { Context, DefaultState } from 'koa';
import Router from 'koa-router';
import { signIn, api, i, notesShow } from './misskey';
import { Note } from './models/Note';
import { die } from './die';

export const router = new Router<DefaultState, Context>();

const staticRouting = [
	[ 'about', 'Simpkey について' ],
	[ 'terms', '利用規約' ],
	[ 'privacy-policy', 'プライバシーポリシー' ],
	[ 'settings', '設定' ],
];

for (const [ name, title ] of staticRouting) {
	router.get('/' + name, async ctx => {
		await ctx.render(name, { title });
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

router.get('/', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		console.log('no session so show top page');
		await ctx.render('index', { 
			title: 'Simpkey'
		});
		return;
	}

	await timeline(ctx, host, 'notes/timeline', 'ホームタイムライン', token);
});

router.get('/ltl', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}
	const meta = await api<any>(host, 'meta', { i: token });
	if (meta.disableLocalTimeline) {
		await die(ctx, 'ローカルタイムラインは無効化されています');
	} else {
		await timeline(ctx, host, 'notes/local-timeline', 'ローカルタイムライン', token);
	}
});

router.get('/stl', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}
	const meta = await api<any>(host, 'meta', { i: token });
	if (meta.disableLocalTimeline) {
		await die(ctx, 'ソーシャルタイムラインは無効化されています');
	} else {
		await timeline(ctx, host, 'notes/hybrid-timeline', 'ソーシャルタイムライン', token);
	}
});

router.get('/gtl', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}

	const meta = await api<any>(host, 'meta', { i: token });
	if (meta.disableGlobalTimeline) {
		await die(ctx, 'グローバルタイムラインは無効化されています');
	} else {
		await timeline(ctx, host, 'notes/global-timeline', 'グローバルタイムライン', token);
	}
});

router.get('/notifications', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}

	const notifications = await api<any>(host, 'i/notifications', { i: token });
	await ctx.render('notifications', { notifications });

});

router.get('/renote', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}

	if (!ctx.query.noteId) {
		await die(ctx, 'noteId required');
		return;
	}

	try {
		const note = await notesShow(host, ctx.query.noteId);
		await ctx.render('renote', { note });
	} catch(e) {
		await die(ctx, e.message);
	}
});

router.get('/reply', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}

	if (!ctx.query.noteId) {
		await die(ctx, 'noteId required');
		return;
	}

	try {
		const note = await notesShow(host, ctx.query.noteId);
		await ctx.render('reply', { note });
	} catch(e) {
		await die(ctx, e.message);
	}
});

router.get('/react', async ctx => {
	const token = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!token || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}

	if (!ctx.query.noteId) {
		await die(ctx, 'noteId required');
		return;
	}

	try {
		const note = await notesShow(host, ctx.query.noteId);
		const myself = await i(host, token);
		await ctx.render('react', { note, reactions: myself.clientData?.reactions });
	} catch(e) {
		await die(ctx, e.message);
	}
});

router.post('/', async ctx => {
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

router.post('/action/:action', async ctx => {
	const i = ctx.cookies.get('i');
	const host = ctx.cookies.get('host');
	if (!i || !host) {
		await die(ctx, 'ログインしてください');
		return;
	}

	const action = ctx.params.action as string;
	try {
		switch (action) {
		case 'create-note': {
			const { text, renoteId, replyId } = ctx.request.body;
			const opts = { i } as Record<string, string>;
			if (text) opts.text = text;
			if (renoteId) opts.renoteId = renoteId;
			if (replyId) opts.replyId = replyId;
			await api(host, 'notes/create', opts);
			break;
		}
		case 'react': {
			const { noteId, reaction, customReaction } = ctx.request.body;
			if (!noteId) throw new Error('noteId required');
			if (!reaction) throw new Error('絵文字が指定されていません');
			await api(host, 'notes/reactions/create', { i, noteId, reaction: reaction === 'custom' ? customReaction : reaction });
			break;
		}
		case 'unreact': {
			const { noteId } = ctx.request.body;
			if (!noteId) throw new Error('noteId required');
			await api(host, 'notes/reactions/delete', { i, noteId });
			break;
		}
		}
	} catch (e) {
		await die(ctx, e.message);
		return;
	}
	ctx.redirect('/');
});

router.post('/logout', ctx => {
	ctx.cookies.set('id');
	ctx.cookies.set('host');
	ctx.cookies.set('i');
	ctx.redirect('/');
});

// Return 404 for other pages
router.all('(.*)', async ctx => {
	ctx.status = 404;
	await die(ctx, 'ページが見つかりませんでした');
});