const configs = {
	chains: Bun.file('./scripts/env/default/chains.json'),
	backends: Bun.file('./scripts/env/default/backends.json')
};

let contents = '';

if (await configs.chains.exists()) {
	contents += `PUBLIC_CHAINS='${JSON.stringify(await configs.chains.json())}'\n`;
}

if (await configs.backends.exists()) {
	contents += `PRIVATE_BACKENDS='${JSON.stringify(await configs.backends.json())}'\n`;
}

const env = Bun.file('./.env');
if (await env.exists()) {
	await env.delete();
}

await Bun.write('./.env', contents);
