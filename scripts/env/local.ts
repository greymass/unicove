const configs = {
	chains: Bun.file('./scripts/env/local/chains.json'),
	backends: Bun.file('./scripts/env/local/backends.json')
};

let contents = '';

if (await configs.chains.exists()) {
	contents += `PUBLIC_CHAINS='${JSON.stringify(await configs.chains.json())}'\n`;
}

if (await configs.backends.exists()) {
	contents += `PRIVATE_BACKENDS='${JSON.stringify(await configs.backends.json())}'\n`;
}

const env = Bun.file('./.env.local');
if (await env.exists()) {
	await env.delete();
}

await Bun.write('./.env.local', contents);
