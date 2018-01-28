/* eslint-env mocha */

'use strict'

const samples = {
  multi_space: 'lots       of       spaces',
  unicode: ' ü ä ö ',
  complex: {
    hello: [
      'world',
      1, 2, 3,
      'test'
    ]
  },
  zero_hello: require('./zh.json'),
  object_with_arrays: {
    test: [
      'thats',
      1,
      'nice',
      ' Array ~~'
    ],
    test2: [
      'other',
      'array'
    ]
  },
  null_type: [
    null,
    undefined
  ]
}

const assert = require('assert')
const crypto = require('../../src')
const cp = require('child_process')
const bl = require('bl')
const path = require('path')

let py = ['python2', 'python'].filter(py => {
  try {
    cp.execSync(py)
    return true
  } catch (e) {
    return false
  }
})[0]

if (!py) console.warn('WARN: Python not found!')

describe('json', () => {
  for (let sample in samples) {
    (py ? it : it.skip)('should stringify the ' + sample + ' sample like python', done => {
      const s = samples[sample]
      const p = cp.spawn(py, [path.join(__dirname, 'json_convert.py')], {
        stdio: ['pipe', 'pipe', 'inherit']
      })
      p.stdin.write(JSON.stringify(s))
      p.stdin.end()
      p.stdout.pipe(bl((err, data) => {
        if (err) return done(err)
        assert.equal(crypto.json.dump(s), data.toString(), 'not matching zn-py-dump')
        assert.deepEqual(s, crypto.json.parse(crypto.json.dump(s)), 'input != output')
        done()
      }))
      p.once('exit', (e, s) => e || s ? done(new Error('Python exited with ' + e || s)) : false)
    })
  }
})
