import axios from 'axios';
import { User } from './models/User';
import { Note } from './models/Note';

export async function api<T>(host: string, endpoint: string, opts: { [_: string]: string }): Promise<T> {
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