import { writable } from 'svelte/store';

export const favoriteVoice = writable(JSON.parse(localStorage.favoriteVoice || -1));
favoriteVoice.subscribe((value) => {
    localStorage.favoriteVoice = JSON.stringify(value);
});