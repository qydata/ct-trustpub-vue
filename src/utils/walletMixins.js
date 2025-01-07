/*
 * Contributors: Aciel Ochoa
 *
 * Description: This mixin file contains methods for handling
 *   various actions relating to wallets
 */
const ethUtil = require('ethereumjs-util')

export default {
  methods: {
    publicKeyToAddress(publicKey) {
      if (publicKey !== undefined) return ethUtil.addHexPrefix(ethUtil.publicToAddress(new Buffer(ethUtil.stripHexPrefix(publicKey), 'hex')).toString('hex'))
      return undefined
    },
    tickerWithAddress(wallet) {
      // returns string with coinTicker prepended to the wallet address
      const walletAddr = this.publicKeyToAddress(wallet.p1)
      return `${walletAddr}`
    },
    traverseWallets(wallets, callback) {
      // accepts wallets OBJECT ex: { btc: [...wallets], eth: [...wallets] }
      // callback is executed on each wallet found
      for (const coinTicker in wallets) {
        wallets[coinTicker].forEach((wallet) => {
          callback(wallet)
        })
      }
    },
    formatDropdownWallet(wallet) {
      const coinTicker = wallet.coinTicker
      const walletName = wallet.nickname || this.tickerWithAddress(wallet)
      const balanceFormatted = this.formatNum(wallet.balance, 6)
      const value = this.currencyToGlobalValue(wallet.balance, coinTicker)
      const valueFormatted = this.formatCurrencyWithSettings(value, 3)

      return `${walletName} (${balanceFormatted} ${coinTicker.toUpperCase()} | ${valueFormatted})`
    }
  }
}
