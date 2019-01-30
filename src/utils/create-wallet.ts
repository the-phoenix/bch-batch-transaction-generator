import { writeFile } from 'fs'
import BITBOXSDK from 'bitbox-sdk/lib/bitbox-sdk'

const bitbox = new BITBOXSDK({ restURL: "https://trest.bitcoin.com/v1/" })
const lang = "english"

export function generateSingleWallet(countSeedAddress = 10) {
  // create 256 bit BIP39 mnemonic
  const mnemonic = bitbox.Mnemonic.generate(
    256,
    bitbox.Mnemonic.wordLists()[lang]
  )  
  
  // root seed buffer
  const rootSeed = bitbox.Mnemonic.toSeed(mnemonic)

  // master HDNode
  const masterHDNode = bitbox.HDNode.fromSeed(rootSeed, "testnet")
  
  // HDNode of BIP44 account
  // Generate the first 10 seed addresses.
  const addresses = Array.from({length: countSeedAddress}, (_, idx) => {
    const childNode = masterHDNode.derivePath(`m/44'/145'/0'/0/${idx}`)

    const cashAddress = bitbox.HDNode.toCashAddress(childNode)
    const legacyAddress = bitbox.HDNode.toLegacyAddress(childNode)

    return { cashAddress, legacyAddress }
  })

  return {
    mnemonic, addresses
  }
}

export async function createWallets(countWallets: number, filePath: string) {
  const wallets = Array.from({length: countWallets}, () => generateSingleWallet()); 

  return new Promise((resolve, reject) =>
    writeFile(filePath, JSON.stringify(wallets, null, 2), (err) => {
      if (err) { reject(err) }
      resolve()
    })
  )
}