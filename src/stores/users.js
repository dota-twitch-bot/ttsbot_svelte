import { writable } from 'svelte/store';

export const users = writable(new Map());