import { writable } from 'svelte/store';

export const config = writable(JSON.parse(localStorage.config || "{}"));
config.subscribe((value) => {
    localStorage.config = JSON.stringify(value);
});