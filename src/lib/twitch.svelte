<script>
	import tmi from 'tmi.js';
	import chunk from 'chunk-text';
	import UAParser from 'ua-parser-js';
	import { users } from '../stores/users.js';
	import { config } from '../stores/config.js';
	import { messageQueue } from '../stores/messageQueue.js';
	import { debug } from './debug.js';
	import { blacklist } from './blacklist.js';
	import sha256 from 'crypto-js/sha256';
	let timeoutduration = 0;
	let currentUser;
	let closeTimeoutModal;
	let speak;
	let connectionStatus = 'disconnected';
	let searchQuery = '';
	let m = new Map();
	let parser = new UAParser();
	const browser = parser.getResult().browser.name.toLowerCase();

	const client = new tmi.Client({
		channels: [],
		options: { debug: true, messagesLogLevel: 'info' },
		connection: {
			reconnect: true,
			secure: true
		}
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
			users.update((m) => m.set(username, { ...m.get(username), timerID: timerID }));
		}
		timeoutduration = 0;
	}
	function setMinuteLimit(username, limit) {
		users.update((m) => m.set(username, { ...m.get(username), minuteLimit: limit }));
	}
	function setHourLimit(username, limit) {
		users.update((m) => m.set(username, { ...m.get(username), hourLimit: limit }));
	}

	function normalize_username(username) {
		const leet_alphabet = {
			'4': 'a',
			'8': 'b',
			'3': 'e',
			'6': 'g',
			'1': 'i',
			'0': 'o',
			'5': 's',
			'7': 't',
			'2': 'z'
		};
		const usernameRegex = username.match(/^(?<start>[a-zA-Z0-9]*)(?<end>(?<=[a-zA-Z])[0-9]*)$/);
		if (usernameRegex == null) {
			return username;
		} else {
			const [start, end] = Object.values(usernameRegex.groups);
			const readableStart = start.replace(/[483610572]/g, (c) => leet_alphabet[c]);
			return readableStart + end;
		}
	}

	function part() {
		client.getChannels().forEach((ch) => client.part(ch));
		connectionStatus = 'connected';
	}

	function join() {
		part();
		connectionStatus = 'joiningChannel';
		if ($config.channel === 'bizarellidota') {
			console.log('Conectando a kick');
			const BASE_URL = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679';
			const urlParams = new URLSearchParams({
				protocol: '7',
				client: 'js',
				version: '7.4.0',
				flash: 'false'
			});
			const url = `${BASE_URL}?${urlParams.toString()}`;

			const socket = new WebSocket(url);

			socket.onopen = () => {
				//TODO: funcionar para outros canais
				socket.send(
					JSON.stringify({
						event: 'pusher:subscribe',
						data: { auth: '', channel: `chatrooms.63834295.v2` }
					})
				);
				connectionStatus = 'connected';
			};

			socket.onmessage = function messageHandle(event) {
				// console.log("received: %s", event.data);
				const data = JSON.parse(event.data);
				// console.log(data);
				if (data.event === 'App\\Events\\ChatMessageEvent') {
					const msg = JSON.parse(data.data);
					console.log('Recebeu msg Kick: ' + msg.content);
					const message = msg.content;
					console.log('Here 1: ' + message);
					const exp =
						(self || (!message.startsWith('!') && $config.workingMode === 'commandOnly')) === true;
					if (exp) return;
					console.log(exp);
					console.log('Here 2: ' + message);
					const args = message.slice(1).split(' ');
					const command = args.shift().toLowerCase();
					const username = msg.sender.username.toLowerCase();
					const readableUsername = normalize_username(username);
					if (
						command === 'voz' ||
						($config.workingMode === 'allMessages' && !message.startsWith('!'))
					) {
						if (!m.has(username)) m.set(username, new Set());
						// Remover emotes da mensagem
						let lastPosition = 0;
						let userMessage = message;
						m.get(username).add(Date.now());
						// Processamentos finais
						userMessage = userMessage.replace('!voz', '');
						// remove URLs
						userMessage = userMessage.replaceAll(
							/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
							''
						);
						userMessage = userMessage.replaceAll(
							/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
							''
						);
						// remove risadas
						userMessage = userMessage.replaceAll(/[kK]{3,}/g, '');
						if ($config.readUsernames) userMessage = readableUsername + ' disse: ' + userMessage;
						// Fragmentar a mensagem é necessário para impedir o Chrome de engasgar com mensagens longas
						const chunkSize = browser.includes('chrom') ? 150 : 15000;
						console.log('Final msg: ' + userMessage);
						chunk(userMessage, chunkSize).forEach((messageChunk) => {
							messageQueue.update((arr) => [...arr, messageChunk]);
							debug('Mensagem adicionada à fila: ' + messageChunk);
						});
					}
					// Mod commands below
				}
			};
			return;
		}
		client
			.join($config.channel)
			.then((data) => {
				console.log('Conectando ao canal ' + $config.channel);
				connectionStatus = 'channelJoined';
			})
			.catch((err) => {
				connectionStatus = 'connected';
				console.log(err);
			});
	}

	(() => {
		if (blacklist?.includes(sha256($config.channel).toString())) return;
		if (connectionStatus != 'disconnected') return;
		connectionStatus = 'initiatingConnection';
		client.on('connecting', (addr, port) => {
			console.log('Conectando à Twitch');
			connectionStatus = 'connecting';
		});

		client.on('connected', (addr, port) => {
			connectionStatus = 'connected';
		});

		client.on('disconnected', (reason) => {
			console.log('Disconectado da Twitch');
			connectionStatus = 'disconnected';
		});

		client.connect().catch((e) => {
			console.error(e);
			connectionStatus = 'disconnected';
		});

		client.on('chat', (channel, tags, message, self) => {
			if (self || (!message.startsWith('!') && $config.workingMode === 'commandOnly')) return;
			const args = message.slice(1).split(' ');
			const command = args.shift().toLowerCase();
			const username = tags.username.toLowerCase();
			const readableUsername = normalize_username(username);
			if (
				command === 'voz' ||
				($config.workingMode === 'allMessages' && !message.startsWith('!'))
			) {
				if (!m.has(username)) m.set(username, new Set());
				if (username !== 'bl00dshoot') {
					if ($users.get(username)?.banned || $users.get(username)?.timedout) return;
					if (blacklist?.includes(sha256(username).toString())) return;
					let minuteLimit = $users.get(username)?.minuteLimit
						? $users.get(username).minuteLimit
						: $config.minuteLimit;
					let hourLimit = $users.get(username)?.hourLimit
						? $users.get(username).hourLimit
						: $config.hourLimit;
					console.log('Limite minuto: ' + minuteLimit + '. Padrão: ' + $config.minuteLimit);
					console.log('Limite hora: ' + hourLimit + '. Padrão: ' + $config.hourLimit);
					if (
						minuteLimit === $config.minuteLimit &&
						hourLimit === $config.hourLimit &&
						$config.subMode &&
						!tags.subscriber
					) {
						minuteLimit = 0;
						console.log('Não é sub');
					}
					if (isNaN(parseInt(minuteLimit))) minuteLimit = Number.MAX_SAFE_INTEGER;
					if (isNaN(parseInt(hourLimit))) hourLimit = Number.MAX_SAFE_INTEGER;
					if ([...m.get(username)].filter((e) => Date.now() - e < 60 * 1000).length >= minuteLimit)
						return;
					if (
						[...m.get(username)].filter((e) => Date.now() - e < 60 * 60 * 1000).length >= hourLimit
					)
						return;
				}
				// Remover emotes da mensagem
				let lastPosition = 0;
				let userMessage = '';
				m.get(username).add(Date.now());
				if ('emotes' in tags && tags['emotes'] !== null) {
					Object.values(tags['emotes'])
						.flat()
						.sort()
						.forEach((emotePosition) => {
							const start = parseInt(emotePosition.split('-')[0]);
							const end = parseInt(emotePosition.split('-')[1]);
							userMessage = userMessage + message.slice(lastPosition, start);
							lastPosition = end + 1;
						});
					userMessage = userMessage + message.slice(lastPosition);
				} else {
					userMessage = message;
				}
				// Processamentos finais
				userMessage = userMessage.replace('!voz', '');
				// remove URLs
				userMessage = userMessage.replaceAll(
					/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
					''
				);
				userMessage = userMessage.replaceAll(
					/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
					''
				);
				// remove risadas
				userMessage = userMessage.replaceAll(/[kK]{3,}/g, '');
				if ($config.readUsernames) userMessage = readableUsername + ' disse: ' + userMessage;
				// Fragmentar a mensagem é necessário para impedir o Chrome de engasgar com mensagens longas
				const chunkSize = browser.includes('chrom') ? 150 : 15000;
				chunk(userMessage, chunkSize).forEach((messageChunk) => {
					messageQueue.update((arr) => [...arr, messageChunk]);
					debug('Mensagem adicionada à fila: ' + messageChunk);
				});
			}
			// Mod commands below
			if (
				!(
					tags.mod ||
					tags.username === channel.slice(1).toLowerCase() ||
					tags.username === 'bl00dshoot'
				)
			)
				return;

			if (command === 'voz_ban') {
				setBan(args[0].toLowerCase(), true);
			} else if (command === 'voz_unban') {
				setBan(args[0].toLowerCase(), false);
			} else if (command === 'voz_timeout') {
				setTimedout(args[0].toLowerCase(), true, args[1]);
			} else if (command === 'voz_remove_timeout') {
				setTimedout(args[0].toLowerCase(), false);
			} else if (command === 'voz_limite_minuto') {
				setMinuteLimit(args[0].toLowerCase(), args[1]);
			} else if (command === 'voz_limite_hora') {
				setHourLimit(args[0].toLowerCase(), args[1]);
			} else if (command === 'voz_limite') {
				setMinuteLimit(args[0].toLowerCase(), args[1]);
				setHourLimit(args[0].toLowerCase(), args[1]);
			}
		});
	})();
</script>

{#if connectionStatus === 'channelJoined'}
	<div>
		<button on:click={part} class="rounded-md bg-red-500 m-2 border-8 border-red-500"
			>Desconectar</button
		>
	</div>
	<div>
		<p class="rounded-md bg-green-500 m-2 border-8 border-green-500 w-fit">
			Status: Conectado ao canal
		</p>
	</div>
{:else if connectionStatus === 'joiningChannel'}
	<div>
		<p class="rounded-md bg-orange-500 m-2 border-8 border-orange-500 w-fit">
			Status: Conectando ao canal
		</p>
	</div>
{:else if connectionStatus === 'disconnected'}
	<div>
		<p class="rounded-md bg-red-500 m-2 border-8 border-red-500 w-fit">
			Status: Desconectado da Twitch
		</p>
	</div>
{:else if connectionStatus === 'connecting'}
	<div><span>&nbsp;</span></div>
	<div>
		<p class="rounded-md bg-orange-500 m-2 border-8 border-orange-500 w-fit">
			Status: Conectando à Twitch
		</p>
	</div>
{:else if connectionStatus === 'connected'}
	<div>
		<button on:click={join} class="rounded-md bg-blue-500 m-2 border-8 border-blue-500"
			>Conectar</button
		>
	</div>
	<div>
		<p class="rounded-md bg-orange-500 m-2 border-8 border-orange-500 w-fit">
			Status: Aguardando conexão ao canal
		</p>
	</div>
{/if}

<dialog id="timeoutLength" class="rounded-2xl">
	<form method="dialog">
		<section>
			<p>Timeout em minutos:</p>
			<input type="number" bind:value={timeoutduration} />
		</section>
		<menu>
			<button
				id="cancel"
				class="rounded-md bg-red-500 m-2 border-8 border-red-500"
				type="reset"
				on:click={closeTimeoutModal}>Cancelar</button
			>
			<button
				type="submit"
				class="rounded-md bg-green-500 m-2 border-8 border-green-500"
				on:click={() => setTimedout(currentUser, true, timeoutduration)}>Confirmar</button
			>
		</menu>
	</form>
</dialog>
<div class="grid place-items-center">
	<input
		type="text"
		placeholder="Buscar..."
		bind:value={searchQuery}
		class="text-center justify-center"
	/>
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
			{#each [...$users]
				.filter(([k, v]) => k.includes(searchQuery))
				.filter(([k, v]) => v.banned == true || v.timedout == true || (v.minuteLimit && v.minuteLimit != $config.minuteLimit) || (v.hourLimit && v.hourLimit != $config.hourLimit)) as [k, v]}
				<tr>
					<td class="border border-slate-300 text-center px-10">{k}</td>
					<td class="border border-slate-300 text-center"
						><input
							type="checkbox"
							checked={v.banned || false}
							on:click={setBan(k, !v.banned)}
						/></td
					>
					<td class="border border-slate-300 text-center"
						><input
							type="checkbox"
							checked={v.timedout || false}
							on:change={(e) => {
								if (e.currentTarget.checked) {
									currentUser = k;
									let currentTarget = e.currentTarget;
									closeTimeoutModal = function () {
										document.querySelector('#timeoutLength').close();
										currentTarget.checked = false;
										timeoutduration = 0;
									};
									document.querySelector('#timeoutLength').showModal();
								} else {
									setTimedout(k, false);
								}
							}}
						/></td
					>
					<td class="border border-slate-300 text-center"
						><input
							type="number"
							bind:value={v.minuteLimit}
							on:change={(e) => setMinuteLimit(k, e.target.value)}
						/></td
					>
					<td class="border border-slate-300 text-center"
						><input
							type="number"
							bind:value={v.hourLimit}
							on:change={(e) => setHourLimit(k, e.target.value)}
						/></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	input:invalid {
		border: 1px solid red;
	}
</style>
