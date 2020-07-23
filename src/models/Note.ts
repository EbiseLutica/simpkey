import { User } from './User';

export type NoteVisibility = 'public' | 'home' | 'followers' | 'specified';

export interface Note {
    createdAt: string;
    cw: string | null;
    // emojis: Emoji[];
    fileIds: string[];
    // files: DriveFile[];
    id: string;
    reactions: Record<string, number>;
    renoteCount: 0;
    renoteId: string | null;
    renote?: Note;
    repliesCount: 0;
    replyId: string | null;
    reply?: Note;
    text: string | null;
    uri: string | null;
    url: string | null;
    user: User,
    userId: string;
    visibility: NoteVisibility;
    localOnly: boolean;
    viaMobile: boolean;
}