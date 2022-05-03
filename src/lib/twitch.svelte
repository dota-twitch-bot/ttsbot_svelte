<script>
	import tmi from 'tmi.js';
	import { users } from '../stores/users.js';
	export let speak;
	let timeoutduration;
	// export const test = function(k) {
	// 		users.update((m) => m.set(k, { ...m.get(k), timedout: true }));
	// };
	function setBan(username, banned) {
		users.update((m) => m.set(username, { ...m.get(username), banned: banned }));
	}
	function setTimedout(username, timedout) {
		users.update((m) => m.set(username, { ...m.get(username), timedout: timedout }));
	}
	function connect() {
		const client = new tmi.Client({
			channels: ['bl00dshoot']
		});
		client.connect();

		client.on('chat', (channel, tags, message, self) => {
			if (self || !message.startsWith('!')) return;
			const args = message.slice(1).split(' ');
			const command = args.shift().toLowerCase();

			if (command === 'voz') {
				if ($users.get(tags.username)?.banned || $users.get(tags.username)?.timedout) return;
				speak(args.join(' '));
			}
			// Mod commands below
			if (!(tags.mod || tags.username === channel.slice(1))) return;

			if (command === 'voz_ban') {
				setBan(args[0], true);
			} else if (command === 'voz_unban') {
				setBan(args[0], false);
			} else if (command === 'voz_timeout') {
				setTimedout(args[0], true);
				setTimeout(() => {
					setTimedout(args[0], false);
				}, args[1] * 1000);
			}
		});
	}
	// $users = $users.concat(['u4']);
	// $: console.log($users);
</script>

<button on:click={connect}>Conectar</button>
<dialog id="timeoutLength">
	<form method="dialog">
		<section>
			<p>Timeout em minutos:</p>
			<input type="number" bind:value={timeoutduration}>
		</section>
		<menu>
			<button id="cancel" type="reset" on:click={() => document.querySelector('#timeoutLength').close()}>Cancelar</button>
			<button type="submit" on:click={() => {console.log(timeoutduration)}}>Confirmar</button>
		</menu>
	</form>
</dialog>
<table>
	<thead>
		<tr>
			<th> Usuário </th>
			<th> Banido </th>
			<th> Timed out </th>
		</tr>
	</thead>
	<tbody>
		<!-- {@debug $users} -->
		{#each [...$users].filter(([k, v]) => v.banned == true || v.timedout == true) as [k, v]}
			<tr>
				<td>{k}</td>
				<!-- {users.update((m) => {
					console.log(m);
					m.set('bl00dshoot', { ...m.get('bl00dshoot'), timedout: true });
				})} -->
				<!-- {test(k)}; -->
				<td><input type="checkbox" checked={v.banned || false} on:click={setBan(k, !v.banned)} /></td>
				<td><input type="checkbox" checked={v.timedout || false} on:change={(e) => {console.log(e.currentTarget.checked)}} /></td>
			</tr>
		{/each}
	</tbody>
</table> 

<button on:click={() => {document.querySelector('#timeoutLength').showModal()}}>Dialog</button>