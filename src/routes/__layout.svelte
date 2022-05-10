<script>
	import '../app.css';
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
</div>
