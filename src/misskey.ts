import axios from 'axios';
import { User } from './models/User';
import { Note } from './models/Note';

axios.defaults.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

export async function api<T>(host: string, endpoint: string, opts: Record<string, string>): Promise<T> {
	const res = await axios.post<T>(`https://${host}/api/${endpoint}`, opts);
	return res.data;
}

type SignInResult = { id: string, i: string };

export function signIn(host: string, username: string, password: string, token?: string): Promise<SignInResult> {
	return api<SignInResult>(host, 'signin', {
		username, password, ...( token ? { token } : { } )
	});
}

export function i(host: string, i: string): Promise<User> {
	return api<User>(host, 'i', { i });
}

export function usersShow(host: string, userId: string): Promise<User> {
	return api<User>(host, 'users/show', { userId });
}

export function usersShowByName(host: string, username: string, userHost?: string): Promise<User> {
	const opts: Record<string, string> = {};
	opts.username = username;
	if (userHost) {
		opts.host = userHost;
	}
	return api<User>(host, 'users/show', opts);
}

export function notesShow(host: string, noteId: string): Promise<Note> {
	return api<Note>(host, 'notes/show', { noteId });
}