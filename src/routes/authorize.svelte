<script>
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
        (async () => {
            await fetch("http://localhost:3001/authorize?code=" + code, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
            }).then(response => response.json()).then((data) => {
                console.log(data);
                window.location.replace('/?access_token=' + data.access_token + '&refresh_token=' + data.refresh_token);
            });
            // console.log(res.json());
            
        })();
    }
</script>
<h1>Nothing to see here.</h1> 