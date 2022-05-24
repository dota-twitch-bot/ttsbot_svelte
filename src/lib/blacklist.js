var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');
headers.append('cache-control', 'no-store');

export let blacklist = new Array();
(async () => {
    blacklist = (JSON.parse(await fetch('https://ebpimenta.xyz/static/blacklist.json', {
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