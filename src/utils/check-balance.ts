/*
  Check the balance of the root address of an HD node wallet generated
  with the create-wallet example.
*/

// Instantiate BITBOX.
import BITBOXSDK from 'bitbox-sdk/lib/bitbox-sdk'
const BITBOX = new BITBOXSDK({ restURL: "https://trest.bitcoin.com/v1/" })

// Get the balance of the wallet.
export async function getBCHBalance(cashAddress: string, verbose: boolean = false) {
  return BITBOX.Address.details([cashAddress])
    .then(result => {
      if (verbose) {
        console.log(result)
      }

      const bchBalance = result[0]

      return bchBalance.balance
    })
}
