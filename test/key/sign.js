/* eslint-env mocha */

'use strict'

const equal = require('assert').equal
const {key} = require('../../src')

describe('sign', () => {
  it('signs the test message', () => {
    equal(key.sign('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss', 'This is an example of a signed message.'), 'G9L5yLFjti0QTHhPyFrZCT1V/MMnBtXKmoiKDZ78NDBjERki6ZTQZdSMCtkgoNmp17By9ItJr8o7ChX0XxY91nk=')
  })
})
