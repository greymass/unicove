# Unicove 2.0

![inspiration](https://i.ibb.co/2nbtvms/image-1.png)

## Development

Running Unicove in development mode leverages `make` and `bun`. To setup a local development environment, clone this repository and perform the following actions.

#### Install dependencies

Run `make install` to install the same version of the dependencies used in production builds (or `bun install --frozen-lockfile`).

#### Run Unicove

Run `make dev` to start a local development environment running at:

http://localhost:5173

#### Formatting + Linting

The `make check` command will run through Svelte checks, eslint, and prettier. All PRs submitted against the repository will also automatically run these checks to ensure functionality and consistent code formatting.

#### Local Configuration

The `.env` file contains the minimal configuration required for Unicove to operate and is included in the root of this repository. This file shouldn't be modified for local changes, and instead a `.env.development` file should be created to selectively override the defaults in the `.env`.

To override the more complex JSON stored in `PUBLIC_CHAINS` and `PRIVATE_BACKENDS`, a specific build process has been setup to generate an `.env.local` automatically based on the contents of the JSON files in `scripts/env/local`. These files can be created and updated using the steps below.

1. If this is the first time altering these values, run `make config` to generate `backends.json` and `chains.json` in `./scripts/env/local`.
2. Edit the `chains.json` file to alter which chains are supported along with their features/endpoints.
3. Edit the `backends.json` file to alter how the SSR backend retrieves data about each chain defined in `chains.json`.
4. Run `make config` to write a copy of your modified config files into `.env.local`.

Anytime changes are made to either `scripts/env/local/backends.json` or `scripts/env/local/chains.json`, run `make config` again to regenerate the `.env.local` file and update the values.

With Unicove running, the current configuration can be viewed in the Debug State section:

http://localhost:5173/debug/state/config
