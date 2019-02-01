/*
  Send xxx satoshis to RECV_ADDR.
*/

// Instantiate BITBOX.
import BITBOXSDK from 'bitbox-sdk/lib/bitbox-sdk'
import { getBCHBalance } from './check-balance'

const BITBOX = new BITBOXSDK({ restURL: "https://trest.bitcoin.com/v1/" })

// Replace the address below with the address you want to send the BCH to.
// const RECV_ADDR = `bchtest:qzx0ne7v8uj6mrj6cvae9xzgsyp74g00wgu03zakz2`
// const RECV_ADDR = `bchtest:qpytyr39fsr80emqh2ukftkpdqvdddcnfg9s6wjtfa`

type SEND_ADDR_TYPE = {
  cashAddress: string,
  mnemonic: string
}

export async function sendBch(srcAddr: SEND_ADDR_TYPE, dstCashAddr: string, satoshisToSend: number, verbose: boolean = false) {
  // Get the balance of the sending address.
  const balance = await getBCHBalance(srcAddr.cashAddress, verbose)
  if (verbose) {
    console.log(`balance: ${JSON.stringify(balance, null, 2)}`)
    console.log(`Balance of sending address ${srcAddr.cashAddress} is ${balance} BCH.`)
  }

  // Exit if the balance is zero.
  if (balance <= 0.0) {
    throw new Error(`Balance of sending address(${srcAddr.cashAddress}) is zero. Exiting.`)
  }

  const SEND_ADDR_LEGACY = BITBOX.Address.toLegacyAddress(srcAddr.cashAddress)
  const RECV_ADDR_LEGACY = BITBOX.Address.toLegacyAddress(dstCashAddr)
  if (verbose) {
    console.log(`Sender Legacy Address: ${SEND_ADDR_LEGACY}`)
    console.log(`Receiver Legacy Address: ${RECV_ADDR_LEGACY}`)
  }

  // const balance2 = await getBCHBalance(dstCashAddr, verbose)
  // if (verbose) {
  //   console.log(`Balance of recieving address ${dstCashAddr} is ${balance2} BCH.`)
  // }

  const [utxo] = await BITBOX.Address.utxo([srcAddr.cashAddress])
  if (verbose) {
    console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`)
  }
  
  // instance of transaction builder
  const transactionBuilder = new BITBOX.TransactionBuilder("testnet")

  const originalAmount = utxo[0].satoshis
  const vout = utxo[0].vout
  const txid = utxo[0].txid

  // add input with txid and index of vout
  transactionBuilder.addInput(txid, vout)

  // get byte count to calculate fee. paying 1.2 sat/byte
  const byteCount = BITBOX.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 2 })
  if (verbose) {
    console.log(`byteCount: ${byteCount}`)
  }
  
  const satoshisPerByte = 1.2
  const txFee = Math.floor(satoshisPerByte * byteCount)
  if (verbose) {
    console.log(`txFee: ${txFee}`)
  }

  // amount to send back to the sending address.
  // It's the original amount - 1 sat/byte for tx size
  const remainder = originalAmount - satoshisToSend - txFee

  // add output w/ address and amount to send
  transactionBuilder.addOutput(dstCashAddr, satoshisToSend)
  transactionBuilder.addOutput(srcAddr.cashAddress, remainder)

  // Generate a change address from a Mnemonic of a private key.
  const change = changeAddrFromMnemonic(srcAddr.mnemonic)

  // Generate a keypair from the change address.
  const keyPair = BITBOX.HDNode.toKeyPair(change)

  // Sign the transaction with the HD node.
  let redeemScript = undefined
  
  transactionBuilder.sign(
    0,
    keyPair,
    redeemScript,
    transactionBuilder.hashTypes.SIGHASH_ALL,
    originalAmount
  )

  // build tx
  const tx = transactionBuilder.build()
  // output rawhex
  const hex = tx.toHex()

  // Broadcast transation to the network
  const broadcast = await BITBOX.RawTransactions.sendRawTransaction(hex)
  
  if (verbose) {
    console.log(`Transaction ID: ${broadcast}`)
  }

  return broadcast
}


// Generate a change address from a Mnemonic of a private key.
function changeAddrFromMnemonic(mnemonic) {
  // root seed buffer
  const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic)

  // master HDNode
  const masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet")

  // HDNode of BIP44 account
  const account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")

  // derive the first external change address HDNode which is going to spend utxo
  const change = BITBOX.HDNode.derivePath(account, "0/0")

  return change
}