<script>
	import '../app.css';
	import { version } from '../current_version.js';
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
