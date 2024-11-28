# 2 Unicove 2 Furious

![inspiration](https://i.ibb.co/2nbtvms/image-1.png)

## Development

Clone this repo and run `bun install` to install the dependencies.

Add a `.env` file to the root of the project with the following content:

```
PUBLIC_LOCAL_SIGNER=""
API_EOS_HISTORY=https://eos.greymass.com
API_EOS_CHAIN=https://eos.greymass.com
API_EOS_LIGHTAPI=https://eos.light-api.net
API_JUNGLE4_HISTORY=https://jungle4.greymass.com
API_JUNGLE4_CHAIN=https://jungle4.greymass.com
API_KYLIN_HISTORY=https://kylintestnet.greymass.com
API_KYLIN_CHAIN=https://kylintestnet.greymass.com
```

Add your private key in there if you want to enable the local Private Key Signer instead of using Anchor for each test transaction.

Run `bun dev` to start the development server then visit `http://localhost:5173`
