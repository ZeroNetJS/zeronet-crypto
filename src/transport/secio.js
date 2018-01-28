'use strict'

const secio = require('libp2p-secio')

module.exports = function SecioCrypto (protocol, zeronet, id) {
  protocol.crypto.add('secio', (conn, conf, cb) => {
    const enc = secio.encrypt(id, conn, err => {
      if (err) return cb(err)
      cb(null, enc)
    })
  })
}
