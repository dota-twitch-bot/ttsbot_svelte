<script>
	import { messageQueue } from '../stores/messageQueue.js';
	var synth = window.speechSynthesis;
	let voices = synth.getVoices();
	let selectedVoice = voices.findIndex((voice) => voice.lang === 'pt-BR');
	console.log('Voices loaded.');

	speechSynthesis.onvoiceschanged = (() => {
		console.log("voices changed");
		voices = synth.getVoices();
		selectedVoice = voices.findIndex((voice) => voice.lang === 'pt-BR');
	});

	setInterval(() => {
		if ($messageQueue.length > 0) {
			let utterance = new SpeechSynthesisUtterance();
			utterance.voice = voices[selectedVoice];
			utterance.text = $messageQueue.shift();
			synth.speak(utterance);		
		}
	}, 250);

	setInterval(() => {
		synth.resume();
	}, 1000);
	// let selectedVoice;
	// selectedVoice = voices.findIndex((voice) => voice.lang === 'pt-BR');
	// window.addEventListener('pause_speech', () => {
	// 	if (EasySpeech.status().status === 'pausing') {
	// 		EasySpeech.resume();
	// 	} else {
	// 		EasySpeech.pause();
	// 	}
	// });
	// window.addEventListener('cancel_speech', () => {
	// 	$messageQueue = [];
	// 	window.speechSynthesis.cancel();
	// });
	// window.addEventListener('skip_message', () => {
	// 	EasySpeech.cancel();
	// });
</script>

<div class="m-4">
	<span>Voz: </span>
	<select bind:value={selectedVoice}>
		{#each voices as voice, i}
			<option value={i}>{voice.name} - {voice.lang}</option>
		{/each}
	</select>
</div>
