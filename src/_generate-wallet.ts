import { createWallets } from './utils/create-wallet'
import {resolve} from 'path'

const walletPath = resolve(__dirname, '../..', 'wallets', 'wallets.json')
createWallets(3, walletPath)
  .then(() => console.log('Wallets generated!'))
  .catch(e => console.log(e))