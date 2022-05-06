<script>
    import Twitch from '../lib/twitch.svelte';
    import Speak from '../lib/speak.svelte';
    import {config} from '../stores/config.js';
    import { fade } from 'svelte/transition';
    let speak;
    let commandsVisible = false;
</script>

<Speak bind:speak={speak}/>
<div class="m-4">
    <div>
        <span>Canal: </span>
        <input bind:value={$config.channel} type=text class="border-blue-500 border-2 rounded w-32">
    </div>
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
<Twitch speak={speak}/>