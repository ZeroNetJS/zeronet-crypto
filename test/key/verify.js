/* eslint-env mocha */

'use strict'

const equal = require('assert').equal
const {key} = require('../../src')

describe('verify', () => {
  it('verifies the test message', () => {
    equal(key.verify('1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN', 'This is an example of a signed message.', 'HJLQlDWLyb1Ef8bQKEISzFbDAKctIlaqOpGbrk3YVtRsjmC61lpE5ErkPRUFtDKtx98vHFGUWlFhsh3DiW6N0rE'), true)
  })
})
