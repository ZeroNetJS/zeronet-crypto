/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */

'use strict'

const Protocol = require('zeronet-protocol').Zero
const {Duplex, TCPDuplex, skipbrowser, hexcrypt} = require('../util')
const {transport} = require('../../src')

const cryptoData = {
  secio: transport.secio,
  'tls-rsa': transport.tls.tls_rsa,
  // 'tls-ecc': require('../src').tls.tls_ecc,
  hex: hexcrypt // hex crypto. why not?
}

const cryptos = Object.keys(cryptoData).map(c => {
  return {
    name: c,
    fnc: cryptoData[c]
  }
})

let id = require('./id')
const Id = require('peer-id')

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

describe('crypto handshake', () => {
  before(cb => {
    Id.createFromJSON(id, (err, id_) => {
      if (err) return cb(err)
      id = id_
      cb()
    })
  })
  cryptos.forEach(crypto => {
    (crypto.name.startsWith('tls-') ? skipbrowser(describe) : describe)(crypto.name, () => { // TLS is currently not supported in browsers. TODO: add
      let protocol, doServer, doClient

      before(cb => {
        protocol = new Protocol({
          crypto: crypto.fnc,
          id
        }, {swarm: {}})

        doServer = protocol.upgradeConn({isServer: true})
        doClient = protocol.upgradeConn({isServer: false})

        protocol.handle('ping', {}, {body: [
          b => Boolean(b === 'Pong!')
        ]}, (data, cb) => cb(null, {body: 'Pong!'}))

        cb()
      })

      it('should handshake with ' + crypto.name, cb => {
        const [client, server] = Duplex()
        doServer(server, err => expect(err).to.not.exist())
        doClient(client, (err, c) => {
          if (err) return cb(err)
          if (c.handshake.local.commonCrypto() !== crypto.name) return cb(new Error('Failing: Wrong crypto used ' + c.handshake.local.commonCrypto() + ' != ' + crypto.name))
          c.cmd.ping({body: 'Pong!'}, cb)
        })
      })

      skipbrowser(it)('should handshake with ' + crypto.name + ' over tcp', cb => {
        TCPDuplex((err, client, server) => {
          if (err) return cb(err)
          doServer(server, err => expect(err).to.not.exist())
          doClient(client, (err, c) => {
            if (err) return cb(err)
            if (c.handshake.local.commonCrypto() !== crypto.name) return cb(new Error('Failing: Wrong crypto used ' + c.handshake.local.commonCrypto() + ' != ' + crypto.name))
            c.cmd.ping({body: 'Pong!'}, cb)
          })
        })
      })
    })
  })
})
