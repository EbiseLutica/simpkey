import { Note } from './Note';

export interface User {
    alwaysMarkNsfw: boolean;
    autoAcceptFollowed: boolean;
    avatarUrl: string;
    bannerUrl: string;
    birthday: string;
    carefulBot: boolean;
    createdAt: string;
    description: string | null;
    clientData?: { reactions: string[] };
    fields: { name: string, value: string }[];
    followersCount: number;
    followingCount: number;
    hasPendingReceivedFollowRequest: boolean;
    hasUnreadAnnouncement: boolean;
    hasUnreadAntenna: boolean;
    hasUnreadMentions: boolean;
    hasUnreadMessagingMessage: boolean;
    hasUnreadNotification: boolean;
    hasUnreadSpecifiedNotes: boolean;
    host: string | null;
    id: string;
    injectFeaturedNote: boolean;
    isAdmin: boolean;
    isBot: boolean;
    isCat: boolean;
    isLocked: boolean;
    isModerator: boolean;
    isSilenced: boolean;
    isSuspended: boolean;
    location: string | null;
    name: string | null;
    notesCount: number;
    pinnedNotes: Note[];
    // pinnedPage: Page;
    token?: string;
    twoFactorEnabled: boolean;
    updatedAt: string;
    url: string | null;
    usePasswordLessLogin: boolean;
    username: string;
}