import Web3 from 'web3'

export class EthereumTxChecker {
  constructor(network, infuraProjectId, devPort, account) {
    if (!PRODUCTION) { /* environment variable set in Webpack config */
      this.web3ws = new Web3(new Web3.providers.WebsocketProvider(`ws://localhost:${devPort}`))
      this.web3 = new Web3(new Web3.providers.HttpProvider(`http://localhost:${devPort}`))
    } else {
      this.web3ws = new Web3(new Web3.providers.WebsocketProvider(`wss://${network}/${infuraProjectId}`))
      this.web3 = new Web3(new Web3.providers.HttpProvider(`https://${network}/${infuraProjectId}`))
    }

    this.account = account.toLowerCase()
  }

  subscribe(topic) {
    this.subscription = this.web3ws.eth.subscribe(topic, (err) => {
      if (err) { console.error(err) }
    })
  }

  watchTransactions(txCallback) {
    console.log('Watching all pending transactions...')
    const self = this

    this.subscription.on('data', (txHash) => {
      setTimeout(async () => {
        try {
          const tx = await self.web3.eth.getTransactionReceipt(txHash)
          if (tx != null) {
            if (tx.from.toLowerCase() === self.account) {
              if (tx.status === true) {
                if (txCallback) { txCallback(tx.transactionHash, tx.status) }
              }
            }
          }
        } catch (err) {
          console.error(err)
        }
      }, 60000)
    })
  }
}
