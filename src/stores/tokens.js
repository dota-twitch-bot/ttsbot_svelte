import { writable } from 'svelte/store';


export const access_token = writable(JSON.parse(localStorage.access_token || "{}"));
export const refresh_token = writable(JSON.parse(localStorage.refresh_token || "{}"));

access_token.subscribe((value) => {
    if (value === "") return;
    localStorage.access_token = JSON.stringify(value);
});

refresh_token.subscribe((value) => {
    if (value === "") return;
    localStorage.refresh_token = JSON.stringify(value);
});