<script>
    import Twitch from '../lib/twitch.svelte';
    import Speak from '../lib/speak.svelte';
    let speak;
</script>

<Speak bind:speak={speak}/>
<Twitch speak={speak}/>