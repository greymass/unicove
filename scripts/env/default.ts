const configs = {
	chains: Bun.file('./scripts/env/default/chains.json'),
	backends: Bun.file('./scripts/env/default/backends.json')
};

let contents = ` # GENERATED FILE - DO NOT EDIT - SEE README

# The nodeos API that will be used by Wharf during the build process to generate contract code
CONTRACTS_API=https://jungle4.greymass.com

# The root domain passed to the nodejs-adapter (when used)
ORIGIN=http://localhost:5173

# Mode that Unicove will run in (production, development)
PUBLIC_ENVIRONMENT=development

# The default chain that will be loaded upon visiting the root domain
PUBLIC_DEFAULT_CHAIN=jungle4

# The root domain used for canonical link generation
PUBLIC_CANONICAL_ORIGIN=http://localhost:5173

# An optional private key that can be specified for testing specific accounts
PUBLIC_LOCAL_SIGNER=

`;

if (await configs.chains.exists()) {
	contents += '# The chain configurations that are supported by this instance of Unicove\n';
	contents += `PUBLIC_CHAINS='${JSON.stringify(await configs.chains.json())}'\n\n`;
}

if (await configs.backends.exists()) {
	contents += '# API backend services the SvelteKit APIs will use internally to access data\n';
	contents += `PRIVATE_BACKENDS='${JSON.stringify(await configs.backends.json())}'\n\n`;
}

const env = Bun.file('./.env');
if (await env.exists()) {
	await env.delete();
}

await Bun.write('./.env', contents);
