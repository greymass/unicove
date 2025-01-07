# Unicove 2.0

![inspiration](https://i.ibb.co/2nbtvms/image-1.png)

## Development

Clone this repo and run `bun install` to install the dependencies.

Add a `.env` file to the root of the project with the following content:

```
# Specify environment Unicove is operating in
PUBLIC_ENVIRONMENT="development"

# Optional Private Key of testnet account for use with the WalletPluginPrivateKey
PUBLIC_LOCAL_SIGNER=""

# APIs for supported networks
API_EOS_HISTORY=https://eos.greymass.com
API_EOS_CHAIN=https://eos.greymass.com
API_EOS_LIGHTAPI=https://eos.light-api.net
API_JUNGLE4_HISTORY=https://jungle4.greymass.com
API_JUNGLE4_CHAIN=https://jungle4.greymass.com
API_KYLIN_HISTORY=https://kylintestnet.greymass.com
API_KYLIN_CHAIN=https://kylintestnet.greymass.com

# EOS Wallet for MetaMask
PUBLIC_METAMASK_SNAP_ORIGIN=npm:@greymass/eos-wallet
PUBLIC_METAMASK_SERVICE_URL=https://dev.account-creation-portal.pages.dev/buy
```

Run `bun dev` to start the development server then visit `http://localhost:5173`
