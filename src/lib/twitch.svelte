<script>
	import tmi from 'tmi.js';
	import { users } from '../stores/users.js';
	import { config } from '../stores/config.js';
	export let speak;
	let timeoutduration = 0;
	let currentUser;
	let closeTimeoutModal;
	let connectionStatus = "disconnected";
	let searchQuery = "";
	let m = new Map();

	const client = new tmi.Client({
			channels: [$config.channel]
		});

	function setBan(username, banned) {
		users.update((m) => m.set(username, { ...m.get(username), banned: banned }));
	}
	function setTimedout(username, timedout, duration) {
		users.update((m) => m.set(username, { ...m.get(username), timedout: timedout }));
		if (timedout) {
			clearTimeout($users.get(username)?.timerID);
			const timerID = setTimeout(() => {
			users.update((m) => m.set(username, { ...m.get(username), timedout: false }));
			}, duration * 1000 * 60);
			users.update((m) => m.set(username, { ...m.get(username), timerID:  timerID}));
		}
		timeoutduration = 0;
	}
	function setMinuteLimit(username, limit) {
		users.update((m) => m.set(username, { ...m.get(username), minuteLimit: limit}));
	}
	function setHourLimit(username, limit) {
		users.update((m) => m.set(username, { ...m.get(username), hourLimit: limit}));
	}

	function connect() {
		
		
		client.on("connecting", (addr, port) => {
			console.log("Conectando à Twitch");
			connectionStatus = "connecting";
		});

		client.on("connected", (addr, port) => {
			console.log("Conectado à Twitch");
			connectionStatus = "connected";
		});

		client.on("disconnected", (reason) => {
			console.log("Disconectado da Twitch");
			connectionStatus = "disconnected";
		});

		client.connect();

		client.on('chat', (channel, tags, message, self) => {
			if (self || !message.startsWith('!')) return;
			const args = message.slice(1).split(' ');
			const command = args.shift().toLowerCase();

			if (command === 'voz') {
				if (!m.has(tags.username)) m.set(tags.username, new Set());
				if ($users.get(tags.username)?.banned || $users.get(tags.username)?.timedout) return;
				let minuteLimit = $users.get(tags.username).minuteLimit ? $users.get(tags.username).minuteLimit : $config.minuteLimit;
				let hourLimit = $users.get(tags.username).hourLimit ? $users.get(tags.username).hourLimit : $config.hourLimit;
				if ([...m.get(tags.username)].filter(e => (Date.now() - e) < (60 * 1000)).length >= minuteLimit) return;
				if ([...m.get(tags.username)].filter(e => (Date.now() - e) < (60 * 60 * 1000)).length >= hourLimit) return;
				m.get(tags.username).add(Date.now());
				console.log(m);
				speak(args.join(' '));
			}
			// Mod commands below
			if (!(tags.mod || tags.username === channel.slice(1))) return;

			if (command === 'voz_ban') {
				setBan(args[0], true);
			} else if (command === 'voz_unban') {
				setBan(args[0], false);
			} else if (command === 'voz_timeout') {
				setTimedout(args[0], true, args[1]);
			} else if (command === 'voz_remove_timeout') {
				setTimedout(args[0], false);
			}
			 else if (command === 'voz_limite_minuto') {
				setMinuteLimit(args[0], args[1]);
			} else if (command === 'voz_limite_hora') {
				setHourLimit(args[0], args[1]);
			}
		});
	}

	function disconnect() {
		client.disconnect();
	}
</script>

{#if connectionStatus === 'disconnected'}
	<div><button on:click={connect} class="rounded-md bg-blue-500 m-2 border-8 border-blue-500">Conectar</button></div>
	<div><p class="rounded-md bg-red-500 m-2 border-8 border-red-500 w-fit">Status: Desconectado da Twitch</p></div>
{:else if connectionStatus === 'connecting'}
	<div><span>&nbsp;</span></div>
	<div><p class="rounded-md bg-orange-500 m-2 border-8 border-orange-500 w-fit">Status: Conectando à Twitch</p></div>
{:else if connectionStatus === 'connected'}
	<div><button on:click={disconnect} class="rounded-md bg-red-500 m-2 border-8 border-red-500">Desconectar</button></div>
	<div><p class="rounded-md bg-green-500 m-2 border-8 border-green-500 w-fit">Status: Conectado à Twitch</p></div>
{/if}

<dialog id="timeoutLength" class="rounded-2xl">
	<form method="dialog">
		<section>
			<p>Timeout em minutos:</p>
			<input type="number" bind:value={timeoutduration}>
		</section>
		<menu>
			<button id="cancel" class="rounded-md bg-red-500 m-2 border-8 border-red-500" type="reset" on:click={closeTimeoutModal}>Cancelar</button>
			<button type="submit" class="rounded-md bg-green-500 m-2 border-8 border-green-500" on:click={() => setTimedout(currentUser, true, timeoutduration)}>Confirmar</button>
		</menu>
	</form>
</dialog>
<div class="grid place-items-center">
	<input type="text" placeholder="Buscar..." bind:value={searchQuery} class="text-center justify-center">
	<table class="border-collapse border border-slate-400">
		<thead>
			<tr>
				<th class="border border-slate-300">Usuário </th>
				<th class="border border-slate-300 px-5">Banido </th>
				<th class="border border-slate-300 px-5">Timed out </th>
				<th class="border border-slate-300 px-5">Mensagens/minuto</th>
				<th class="border border-slate-300 px-5">Mensagens/hora</th>
			</tr>
		</thead>
		<tbody>
			{#each [...$users].filter(([k, v]) => k.includes(searchQuery)).filter(([k, v]) => v.banned == true || v.timedout == true || 
				(v.minuteLimit && v.minuteLimit != $config.minuteLimit) || (v.hourLimit && v.hourLimit != $config.hourLimit)) as [k, v]}
				<tr>
					<td class="border border-slate-300 text-center px-10">{k}</td>
					<td class="border border-slate-300 text-center"><input type="checkbox" checked={v.banned || false} on:click={setBan(k, !v.banned)} /></td>
					<td class="border border-slate-300 text-center"><input type="checkbox" checked={v.timedout || false} on:change={(e) => {
						if (e.currentTarget.checked) {
							currentUser = k;
							let currentTarget = e.currentTarget;
							closeTimeoutModal = function() {
								document.querySelector('#timeoutLength').close();
								currentTarget.checked = false;
								timeoutduration = 0;
							}
							document.querySelector('#timeoutLength').showModal();
						} else {
							setTimedout(k, false);
						}
						}} /></td>
						<td class="border border-slate-300 text-center"><input type=number bind:value={v.minuteLimit} on:change={(e) => setMinuteLimit(k, e.target.value)}></td>
						<td class="border border-slate-300 text-center"><input type=number bind:value={v.hourLimit} on:change={(e) => setHourLimit(k, e.target.value)}></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<style>
	input:invalid {
  border:1px solid red;
}
</style>