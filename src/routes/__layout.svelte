<script>
	import '../app.css';
	import { version } from '../current_version.js';
</script>

<div class="grid place-items-center">
	<slot />
	<div id="footer" class="fixed bottom-0 border-gray-400 border-t-2 w-full text-center" style="background-color: white">
		<p><span class="font-bold">Versão:</span>
			{#if version}
				{version}
			{:else }
				Indefinida
			{/if}
		</p>
		<p><span class="font-bold">Discord para suporte:</span> bl00dshooter#4006</p>
	</div>
</div>
