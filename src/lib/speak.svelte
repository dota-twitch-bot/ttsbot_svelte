<script>
	import EasySpeech from 'easy-speech';
	import { messageQueue } from '../stores/messageQueue.js';
	let voices = [];
	let selectedVoice;
	EasySpeech.init({ maxTimeout: 5000, interval: 250 })
		.then(() => {
			console.log('EasySpeech load complete.');
			voices = EasySpeech.voices();
			selectedVoice = voices.findIndex((voice) => voice.lang === 'pt-BR');
			setInterval(async () => {
				// console.log(EasySpeech.status());
				if (
					$messageQueue.length == 0 ||
					EasySpeech.status().status === 'init speak' ||
					EasySpeech.status().status === 'pausing' ||
					EasySpeech.status().status === 'resuming'
				)
					return;
				await EasySpeech.speak({
					text: $messageQueue.shift(),
					voice: voices[selectedVoice],
					pitch: 1,
					rate: 1,
					volume: 1
				});
			}, 250);
			window.addEventListener('pause_speech', () => {
				if (EasySpeech.status().status === 'pausing') {
					EasySpeech.resume();
				} else {
					EasySpeech.pause();
				}
			});
			window.addEventListener('cancel_speech', () => {
				$messageQueue = [];
				window.speechSynthesis.cancel();
			});
			window.addEventListener('skip_message', () => {
				EasySpeech.cancel();
			});
		})
		.catch((e) => console.error(e));
</script>

<div class="m-4">
	<span>Voz: </span>
	<select bind:value={selectedVoice}>
		{#each voices as voice, i}
			<option value={i}>{voice.name} - {voice.lang}</option>
		{/each}
	</select>
</div>
