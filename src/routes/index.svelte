<script>
    import Twitch from '../lib/twitch.svelte';
    import Speak from '../lib/speak.svelte';
    import Websocket from '../lib/websocket.svelte';
    import {config} from '../stores/config.js';
    import {access_token, refresh_token} from '../stores/tokens.js';
    import { fade } from 'svelte/transition';
    let commandsVisible = false;
    // const url = new URL(window.location.href);
    // if (url.searchParams.get("access_token") && url.searchParams.get("refresh_token")) {
    //     $access_token = url.searchParams.get("access_token");
    //     $refresh_token = url.searchParams.get("refresh_token");
    //     (async () => {
    //         await fetch('https://id.twitch.tv/oauth2/validate', {
    //             method: 'GET',
    //             headers: {
    //                 'Authorization': 'OAuth ' + $access_token
    //             }
    //         }).then(response => {
    //             if (response.status != 200) return {};
    //             return response.json();
    //         }).then((data) => {
    //             if (data.login) {
    //                 $config.username = data.login;
    //                 $config.channel = data.login;
    //                 window.location.replace('/');
    //             }
    //         });
    //     })();
    // }
</script>

<!-- <Websocket/> -->


{#if true}
    <Speak/>
    <div class="m-4">
        {#if true}
            <div>
                <span>Canal: </span>
                <input bind:value={$config.channel} type=text class="border-blue-500 border-2 rounded w-32">
            </div>
        {/if}
        <div class="my-2">
            <span>Mensagens por minuto (padrão): </span>
            <input bind:value={$config.minuteLimit} type=number class="border-blue-500 border-2 rounded w-16">
        </div>
        <div class="my-2">
            <span>Mensagens por hora (padrão): </span>
            <input bind:value={$config.hourLimit} type=number class="border-blue-500 border-2 rounded w-16">
        </div>
    </div>
    <div class="m-2 rounded-md bg-yellow-500 m-2 border-8 border-yellow-500 w-fit" on:mouseenter={() => {commandsVisible = true}} on:mouseleave={() => {commandsVisible = false}}>
        <h1 class="text-center font-bold">Lista de comandos</h1>
        {#if true}
            <div transition:fade={{duration: 500}}>
                <p><span class="font-semibold">!voz</span> [mensagem]</p>
                <p><span class="font-semibold">!voz_ban</span> [usuario]</p>
                <p><span class="font-semibold">!voz_unban</span> [usuario]</p>
                <p><span class="font-semibold">!voz_timeout</span> [usuario] [duração em minutos]</p>
                <p><span class="font-semibold">!voz_limite_minuto</span> [usuario] [limite de mensagens por minuto]</p>
                <p><span class="font-semibold">!voz_limite_hora</span> [usuario] [limite de mensagens por hora]</p>
                <p><span class="font-semibold">!voz_limite</span> [usuario] [limite de mensagens por minuto e por hora  ]</p>
            </div>
        {/if}
    </div>
    <Twitch/>
{:else}
    <div class="flex h-screen items-center">
        <a class="text-2xl hover:underline text-blue-600" href="https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=u34qlogqginndqmxdtjks02ioj048a&redirect_uri=http://localhost:3000/authorize&scope=channel:read:redemptions&state=c3ab8aa609ea11e793ae92361f002671">Fazer login com a Twitch.</a>
    </div>
{/if}