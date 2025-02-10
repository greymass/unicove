const configs = {
	chains: {
		default: Bun.file('./scripts/env/default/chains.json'),
		custom: Bun.file('./scripts/env/custom/chains.json')
	},
	backends: {
		default: Bun.file('./scripts/env/default/backends.json'),
		custom: Bun.file('./scripts/env/custom/backends.json')
	}
};

const output = {
	ORIGIN: 'http://localhost:5173',
	PUBLIC_ENVIRONMENT: 'development',
	PUBLIC_CHAIN_NAME: 'Jungle4',
	PUBLIC_LOCAL_SIGNER: '',
	PUBLIC_CANONICAL_ORIGIN: 'http://localhost:5173'
};

let contents = '';

Object.entries(output).map(([key, value]) => {
	contents += `${key}=${value}\n`;
});

if (await configs.chains.custom.exists()) {
	contents += `PUBLIC_CHAINS='${JSON.stringify(await configs.chains.custom.json())}'\n`;
} else {
	contents += `PUBLIC_CHAINS='${JSON.stringify(await configs.chains.default.json())}'\n`;
}

if (await configs.backends.custom.exists()) {
	contents += `PRIVATE_BACKENDS='${JSON.stringify(await configs.backends.custom.json())}'\n`;
} else {
	contents += `PRIVATE_BACKENDS='${JSON.stringify(await configs.backends.default.json())}'\n`;
}

const env = Bun.file('./.env.local');
if (await env.exists()) {
	await env.delete();
}

await Bun.write('./.env.local', contents);
