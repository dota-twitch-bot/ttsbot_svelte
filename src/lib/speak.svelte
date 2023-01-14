<script>
	import { messageQueue } from '../stores/messageQueue.js';
	import { onDestroy } from 'svelte';
	import {debug} from './debug.js';
	import { config } from '../stores/config.js';
	import { favoriteVoice } from '../stores/favoriteVoice.js';
	var synth = window.speechSynthesis;
	let voices = synth.getVoices();

	console.log('Voices loaded.');
	console.log("Selected voice: " + $favoriteVoice);

	speechSynthesis.onvoiceschanged = (() => {
		console.log("Voices changed."); 
		voices = synth.getVoices().sort((a, b) => {
			// if (navigator.languages.includes(a.lang)) return -1;
			if (a.lang === navigator.language) return -1;
			else return 1;
		});
		if (!$favoriteVoice) $favoriteVoice = voices.findIndex((voice) => voice.lang === navigator.language);
		if ($favoriteVoice == -1) favoriteVoice.set(voices.findIndex((voice) => voice.lang === navigator.language));
		else document.querySelector("#currentVoice").selectedIndex = $favoriteVoice;
	});

	const unsubscribe = messageQueue.subscribe(value => {
		if ($messageQueue.length < 1) return;
		let utterance = new SpeechSynthesisUtterance();
		let volume = Object.hasOwn($config, 'volume') ? $config.volume : 100;
		utterance.voice = voices[$favoriteVoice];
		utterance.text = $messageQueue.shift();
		utterance.volume = volume / 100;
		debug("Mensagem retirada da fila: " + utterance.text);
		utterance.onstart = ((ev) => {
			debug("Começou a ler mensagem: " + utterance.text);
		});
		utterance.onend = ((ev) => {
			debug("Terminou de ler mensagem: " + utterance.text);
		});
		synth.speak(utterance);		
	});
	onDestroy(unsubscribe);

	setInterval(() => {
		synth.resume();
	}, 1000);

	const updateLanguageInterval = setInterval(() => {
		try {
			document.querySelector("#currentVoice").selectedIndex = $favoriteVoice;
			clearInterval(updateLanguageInterval);
		} catch (e) {
			// Not yet
		}
	}, 100);
	
</script>

<div class="m-4">
	<span>Voz: </span>
	<select id="currentVoice" bind:value={$favoriteVoice}>
		{#each voices as voice, i}
			<option value={i}>{voice.name} - {voice.lang}</option>
		{/each}
	</select>
</div>
