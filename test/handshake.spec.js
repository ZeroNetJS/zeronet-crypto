/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */

'use strict'

const cryptoData = {
  secio: require('../src').secio,
  'tls-rsa': require('../src').tls_rsa
  // 'tls-ecc': require('../src').tls_ecc
}

const cryptos = Object.keys(cryptoData).map(c => {
  return {
    name: c,
    fnc: cryptoData[c]
  }
})

// const ZeroNet = require('zeronet')

const ZeroNet = null

const multiaddr = require('multiaddr')

let node

describe.skip('handshake', () => {
  cryptos.forEach(crypto => {
    it('should handshake with ' + crypto.name, (cb) => {
      node = ZeroNet({
        id: global.id,
        swarm: {
          zero: {
            listen: [
              '/ip4/127.0.0.1/tcp/25335'
            ],
            crypto: crypto.fnc
          }
        }
      })
      node.start(err => {
        if (err) return cb(err)

        node.swarm.dial(multiaddr('/ip4/127.0.0.1/tcp/25335'), (e, c) => {
          if (e) return cb(e)
          if (c.handshakeData.commonCrypto() !== crypto.name) return cb(new Error('Failing: Wrong crypto used ' + c.handshakeData.commonCrypto() + ' != ' + crypto.name))
          c.cmd.ping({}, cb)
        })
      })
    }).timeout(20000)
  })

  afterEach(function (cb) {
    this.timeout(5000)
    node.stop(cb)
  })
})
