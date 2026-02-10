// resources/js/types.ts
import { Config } from 'ziggy-js';

export type FlashMessages = {
    success?: string | [string, string];
    error?: string | [string, string];
};
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
}

// Add this interface for flash messages
export interface FlashMessages {
    message?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: FlashMessages; // optional flash messages
    ziggy: Config & { location: string };
};
