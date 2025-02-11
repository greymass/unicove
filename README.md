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
