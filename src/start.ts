import * as nconf from 'nconf'
import { resolve } from 'path'
import { timer, range, from } from 'rxjs'
import { flatMap, concatMap, tap, map } from 'rxjs/operators'

import { generateRandom, appendFileObs } from './utils'

import { sendBch } from './utils/send-bch'

nconf.argv().env().defaults({
  receiveAddr: 'bchtest:qqahjy0x9zus2qypf0tfd7mykpvxqtc6rqfft0sgjy',
})

const tps = 1 // Limit by bitbox api

const walletPath = resolve(__dirname, '../..', 'wallets', 'wallets.json')

let wallets
try {
  wallets = require(walletPath)
} catch {
  throw new Error(`Can not find wallets file path: ${walletPath}`)
}

const receiveAddr = nconf.get('receiveAddr') 
const filePath = resolve(__dirname, '../../reports', `transactions_${(new Date()).getTime()}.log`)
const walletsCount = wallets.length

console.log('sendAddr: will be picked randomly for every tx from wallets.json')
console.log('receiveAddr:', receiveAddr)

const singleReq = () => {
  const randIdx = generateRandom(0, walletsCount - 1)
  const wallet = wallets[randIdx]
  const stashi = generateRandom(500, 2000)

  const sendBchPromise = sendBch(wallet, receiveAddr, stashi, false)

  return from(sendBchPromise)
    .pipe(
      flatMap(txid => 
        appendFileObs(filePath, `${txid}\n`).pipe(map(() => txid))
      ),
      tap((txid) => console.log(`Tranasction ID: ${txid}`))
    )
}

const multiReq = (n: number) => range(1, n)
  .pipe(
    flatMap(() => singleReq()),
  );

const generateTransactions = () => timer(0, 1000)
  .pipe(
    concatMap(() => multiReq(tps))
  );

generateTransactions().subscribe({
  error: e => console.log(e)
})