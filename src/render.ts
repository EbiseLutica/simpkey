import views from 'koa-views';
import { parse, toHtml } from 'mfmf';
import { parsePlain } from 'mfmf/dist/script/mfm/parse';


import constant from './const';
import { User } from './models/User';
import { Note } from './models/Note';

export const render = views(__dirname + '/views', {
	extension: 'pug', options: {
		...constant,
		mfmToHtml: (text: string, plain = false) => {
			return toHtml(plain ? parsePlain(text) : parse(text), [], {
				url: '',
			});
		},
		getAcct: (user: User) =>  user.host ? `@${user.username}@${user.host}` : `@${user.username}`,
		getUserName: (user: User) => user.name || user.username,
		getVisibility: (note: Note) => {
			let icon: string;
			switch (note.visibility) {
			case 'public':
				icon = '🌐';
				break;
			case 'home':
				icon = '🏠';
				break;
			case 'followers':
				icon = '🔒';
				break;
			case 'specified':
				icon = '✉️';
				break;
			default:
				icon = '❓';
				break;	
			}
			if (note.localOnly) icon += '☣';
			return icon;
		}
	}
});