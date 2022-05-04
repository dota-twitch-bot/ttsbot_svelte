import { writable } from 'svelte/store';

let loadedMap = new Map(Object.entries(JSON.parse(localStorage.users || "{}")));
loadedMap.forEach((v) => {
    delete v.timedout;
    delete v.timerID;
});
export const users = writable(loadedMap);
users.subscribe((value) => {
    localStorage.users = JSON.stringify(Object.fromEntries(value));
});