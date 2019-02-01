[![TypeScript version][ts-badge]][typescript-32]
[![Node.js version][nodejs-badge]][nodejs]

# BCH Transaction generator

## Quick start

This project is intended to be used with the latest Active LTS release of [Node.js][nodejs]. To start, just install and run with following commands:

```sh
npm install
node build/src/start.js
```

## Available arguments

+ `receiveAddr` - receive cash address. default: `bchtest:qqahjy0x9zus2qypf0tfd7mykpvxqtc6rqfft0sgjy`

You can set parameter with env var or command line arguments. 
e.g. `node build/src/start.js --receiveAddr=xxxx`

## Description

### TPS
Due to limit of [Bitbox API](https://developer.bitcoin.com/bitbox/), maximum TPS is 1.
We can't generate more than 60 transactions per a minute.

### Wallets

This script is generating transactions from 3 wallets pre-stored in [`wallets/wallets.json`](./wallets/wallets.json)

Every wallet has approx 0.1 tBCH. Its enough to run the scripts for a while since every operation send between 500~1000 satoshis randomly.

You can generate your own wallet by following command 

```sh
node build/src/_generate-wallet.ts
```

But becareful, it will overwrite existing wallets file, eventually will lose all tBCHs.

### Reports

Every generated transaction ids will be stored in `/reports` directory