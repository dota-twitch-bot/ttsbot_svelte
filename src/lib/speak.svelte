<script>
	import { messageQueue } from '../stores/messageQueue.js';
	import { onDestroy } from 'svelte';
	import {debug} from './debug.js';
	var synth = window.speechSynthesis;
	let voices = synth.getVoices();
	let selectedVoice = voices.findIndex((voice) => voice.lang === 'pt-BR');
	let previousMessages = new Set();
	console.log('Voices loaded.');

	speechSynthesis.onvoiceschanged = (() => {
		console.log("voices changed");
		voices = synth.getVoices();
		selectedVoice = voices.findIndex((voice) => voice.lang === 'pt-BR');
	});

	const unsubscribe = messageQueue.subscribe(value => {
		if ($messageQueue.length < 1) return;
		let utterance = new SpeechSynthesisUtterance();
		utterance.voice = voices[selectedVoice];
		utterance.text = $messageQueue.shift();
		if (previousMessages.has(utterance.text)) {
			debug("Mensagem repetida detectada: " + utterance.text);
			return;
		}
		debug("Mensagem retirada da fila: " + utterance.text);
		utterance.onstart = ((ev) => {
			debug("Começou a ler mensagem: " + utterance.text);
		});
		utterance.onend = ((ev) => {
			debug("Termiou de ler mensagem: " + utterance.text);
		});
		previousMessages.add(utterance.text);
		synth.speak(utterance);		
	});

	setInterval(() => {
		synth.resume();
	}, 1000);
	setInterval(() => {
		previousMessages.clear();
	}, 5000);
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
	onDestroy(unsubscribe);
</script>

<div class="m-4">
	<span>Voz: </span>
	<select bind:value={selectedVoice}>
		{#each voices as voice, i}
			<option value={i}>{voice.name} - {voice.lang}</option>
		{/each}
	</select>
</div>
