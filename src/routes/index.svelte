<script>
	import Twitch from '../lib/twitch.svelte';
	import Speak from '../lib/speak.svelte';
	import Websocket from '../lib/websocket.svelte';
	import { config } from '../stores/config.js';
	import { access_token, refresh_token } from '../stores/tokens.js';
	import { fade } from 'svelte/transition';
	let commandsVisible = false;
	// const url = new URL(window.location.href);
	// if (url.searchParams.get("access_token") && url.searchParams.get("refresh_token")) {
	//     $access_token = url.searchParams.get("access_token");
	//     $refresh_token = url.searchParams.get("refresh_token");
	//     (async () => {
	//         await fetch('https://id.twitch.tv/oauth2/validate', {
	//             method: 'GET',
	//             headers: {
	//                 'Authorization': 'OAuth ' + $access_token
	//             }
	//         }).then(response => {
	//             if (response.status != 200) return {};
	//             return response.json();
	//         }).then((data) => {
	//             if (data.login) {
	//                 $config.username = data.login;
	//                 $config.channel = data.login;
	//                 window.location.replace('/');
	//             }
	//         });
	//     })();
	// }
</script>

<!-- <Websocket/> -->

{#if true}
	<Speak />
	<div class="m-4">
		{#if true}
			<div>
				<span>Canal: </span>
				<input
					bind:value={$config.channel}
					type="text"
					class="border-blue-500 border-2 rounded w-32"
				/>
			</div>
		{/if}
		<div class="my-2">
			<span>Mensagens por minuto (padrão): </span>
			<input
				bind:value={$config.minuteLimit}
				type="number"
				class="border-blue-500 border-2 rounded w-16"
			/>
		</div>
		<div class="my-2">
			<span>Mensagens por hora (padrão): </span>
			<input
				bind:value={$config.hourLimit}
				type="number"
				class="border-blue-500 border-2 rounded w-16"
			/>
		</div>
	</div>
	<div class="flex justify-center">
		<div>
			<div class="form-check">
				<input
					class="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
					type="checkbox"
					value=""
					id="autoConnectCheckbox"
                    bind:checked={$config.autoConnect}
				/>
				<label class="form-check-label inline-block text-gray-800" for="autoConnectCheckbox">
					Reconectar automaticamente
				</label>
			</div>
			<div class="form-check">
				<input
					class="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
					type="checkbox"
					value=""
					id="subModeCheckbox"
                    bind:checked={$config.subMode}
				/>
				<label class="form-check-label inline-block text-gray-800" for="subModeCheckbox">
					Modo exclusivo para subs
				</label>
			</div>
			<div class="form-check">
				<input
					class="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
					type="checkbox"
					value=""
					id="readUsernameCheckbox"
                    bind:checked={$config.readUsernames}
				/>
				<label class="form-check-label inline-block text-gray-800" for="readUsernameCheckbox">
					Ler nome de usuário com a mensagem
				</label>
			</div>
			<div />
			<div>
				<div class="form-check">
					<input
						class="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
						type="radio"
						name="workingmode"
						id="useCommandRadio"
                        bind:group={$config.workingMode}
                        value="commandOnly"
					/>
					<label class="form-check-label inline-block text-gray-800" for="useCommandRadio">
						Ler apenas mensagens com comando !voz
					</label>
				</div>
				<div class="form-check">
					<input
						class="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
						type="radio"
						name="workingmode"
						id="readAllMessagesRadio"
                        bind:group={$config.workingMode}
                        value="allMessages"
					/>
					<label class="form-check-label inline-block text-gray-800" for="flexRadioDefault2">
						Ler todas as mensagens
					</label>
				</div>
			</div>
		</div>
	</div>
	<div
		class="m-2 rounded-md bg-yellow-500 m-2 border-8 border-yellow-500 w-fit"
		on:mouseenter={() => {
			commandsVisible = true;
		}}
		on:mouseleave={() => {
			commandsVisible = false;
		}}
	>
		<h1 class="text-center font-bold">Lista de comandos</h1>
		{#if true}
			<div transition:fade={{ duration: 500 }}>
				<p><span class="font-semibold">!voz</span> [mensagem]</p>
				<p><span class="font-semibold">!voz_ban</span> [usuario]</p>
				<p><span class="font-semibold">!voz_unban</span> [usuario]</p>
				<p><span class="font-semibold">!voz_timeout</span> [usuario] [duração em minutos]</p>
				<p>
					<span class="font-semibold">!voz_limite_minuto</span> [usuario] [limite de mensagens por minuto]
				</p>
				<p>
					<span class="font-semibold">!voz_limite_hora</span> [usuario] [limite de mensagens por hora]
				</p>
				<p>
					<span class="font-semibold">!voz_limite</span> [usuario] [limite de mensagens por minuto e
					por hora ]
				</p>
			</div>
		{/if}
	</div>
	<Twitch />
{:else}
	<div class="flex h-screen items-center">
		<a
			class="text-2xl hover:underline text-blue-600"
			href="https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=u34qlogqginndqmxdtjks02ioj048a&redirect_uri=http://localhost:3000/authorize&scope=channel:read:redemptions&state=c3ab8aa609ea11e793ae92361f002671"
			>Fazer login com a Twitch.</a
		>
	</div>
{/if}
