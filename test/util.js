'use strict'

const _Duplex = require('pull-pair/duplex')
const Connection = require('interface-connection').Connection
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const assert = require('assert')
const randSplit = require('pull-randomly-split')

const Duplex = () => {
  const d = _Duplex()
  let isc = 1 // is client
  return d.map(d => {
    return new Connection({
      source: pull(d.source, randSplit(1, 1024)),
      sink: d.sink
    }, {
      getObservedAddrs: isc-- ? (cb) => cb(null, [multiaddr('/ip4/127.0.0.1/tcp/15544')]) : (cb) => cb(null, [multiaddr('/ip4/127.0.0.1/tcp/36778')])
    })
  })
}

const TCPDuplex = require('./tcp-duplex')

function hexcrypt (protocol) {
  protocol.crypto.add('hex', (conn, conf, cb) => { // DON'T use this crypto in production
    const [a, b] = _Duplex()
    let c = ''
    function inputCheck (d) {
      if (c) d = c + d
      c = ''
      d = d.split('')
      const leftOver = d.length % 2
      if (leftOver) {
        c = d.pop()
      }
      return d.join('')
    }
    pull(
      conn,
      pull.map(d => Buffer.from(inputCheck(d.toString()), 'hex')),
      b.sink
    )
    pull(
      b.source,
      pull.map(d => Buffer.from((Buffer.isBuffer(d) ? d : Buffer.from(d)).toString('hex'))),
      conn
    )
    return cb(null, new Connection(a, conn))
  })
}

module.exports = {
  Duplex,
  TCPDuplex,
  pullCompare: (v, cb) => pull.collect((err, res) => {
    if (cb) {
      if (err) return cb(err)
    } else {
      if (err) throw err
    }
    assert.deepEqual(v, res)
    if (cb) cb()
  }),
  skipbrowser: it => process.toString() === '[object process]' ? it : it.skip,
  hexcrypt
}
