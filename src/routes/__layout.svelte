<script>
	import '../app.css';
	import { version } from '../current_version.js';
	// var port = chrome.runtime.connect("mjnfalinkaablgiaknbjjiiophgeiape");

	// window.addEventListener(
	// 	'message',
	// 	(event) => {
	// 		// We only accept messages from ourselves
	// 		if (event.source != window) {
	// 			return;
	// 		}

	// 		if (event.data.type && event.data.type == 'FROM_PAGE') {
	// 			console.log('Content script received: ' + event.data.text);
	// 			port.postMessage(event.data.text);
	// 		}
	// 	},
	// 	false
	// );
</script>

<div class="grid place-items-center">
	<slot />
	<div id="footer" class="fixed bottom-0 border-gray-400 border-t-2 w-full text-center">
		<p><span class="font-bold">Versão:</span>
			{#if version}
				{version}
			{:else }
				Indefinida
			{/if}
		</p>
		<p><span class="font-bold">Discord para suporte:</span> <a href="https://discord.gg/qM2nZ2jMM2" class="text-blue-500">https://discord.gg/qM2nZ2jMM2</a></p>
	</div>
</div>
