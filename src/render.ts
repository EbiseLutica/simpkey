import config from './config';
import views from 'koa-views';
import { User } from './models/User';
import { Note } from './models/Note';

export const render = views(__dirname + '/views', {
	extension: 'pug', options: {
		...config,
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