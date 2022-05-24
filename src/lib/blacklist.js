var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');
headers.append('cache-control', 'no-store');

let data;
await (async () => {
    data = (JSON.parse(await fetch('https://ebpimenta.xyz/static/blacklist.jsona', {
        method: 'GET',
    }).then(response => {
        return response.text();
    }).then(text => {
        return text;
    }).catch(e => {
        return JSON.stringify(new Object({
            users: []
        }))
    }
    )).users);
})();

export const blacklist = data;