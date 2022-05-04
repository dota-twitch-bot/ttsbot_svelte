<script>
	let synth = window.speechSynthesis;
	let voices = synth.getVoices();
	let selectedVoice;
	synth.addEventListener('voiceschanged', (e) => {
		voices = synth.getVoices();
        selectedVoice = voices.findIndex(voice => voice.lang === 'pt-BR');
	});

	export const speak = function(message) {
		let utterance = new SpeechSynthesisUtterance(message);
		utterance.voice = voices[selectedVoice];
		synth.speak(utterance);
	};
</script>
<div class="m-4">
    <span>Voz: </span>
    <select bind:value={selectedVoice}>
        {#each voices as voice, i}
            <option value={i}>{voice.name} - {voice.lang}</option>
        {/each}
    </select>
</div>