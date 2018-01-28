'use strict'

/**
  Orders an object
  Example: {z: true, a: 1, q: {1: true, 0: -1}} => {a: 1, q: {0: -1, 1: true}, z: true}
  * @param {object} unordered - Object with unordered keys
  * @return {object} - Object with ordered keys
  */
function orderObject (unordered) {
  const ordered = {}
  if (typeof unordered !== 'object' || unordered == null || Array.isArray(unordered)) return unordered
  Object.keys(unordered).sort().forEach(function (key) {
    ordered[key] = ((typeof unordered[key] === 'object') && !Array.isArray(unordered[key])) ? orderObject(unordered[key]) : unordered[key]
  })
  return ordered
}

function padWithLeadingZeros (string) {
  return new Array(5 - string.length).join('0') + string
}

function unicodeCharEscape (charCode) {
  return '\\u' + padWithLeadingZeros(charCode.toString(16))
}

function unicodeEscape (string) {
  return string.split('')
    .map(function (char) {
      const charCode = char.charCodeAt(0)
      return charCode > 127 ? unicodeCharEscape(charCode) : char
    })
    .join('')
}

/**
  JSON Dumper
  * @param {Object} data
  * @return {string}
  * @private
  */
function jsonDump (data) {
  if (data == null) return 'null' // python gives a fuck about 'undefined'
  switch (typeof data) {
    case 'number':
    case 'boolean':
      return JSON.stringify(data) // hand off primitives to JSON.stringify
    case 'string':
      return unicodeEscape(JSON.stringify(data)) // strings are special because unicode
    case 'object':
      if (Array.isArray(data)) {
        return '[' + data.map(jsonDump).join(', ') + ']'
      } else {
        return '{' + Object.keys(data).map(key =>
          '"' + key + '": ' + jsonDump(data[key])).join(', ') + '}'
      }
      break;
    default:
      throw new Error('Cannot handle unknown type ' + typeof data + '! Report as ZeroNetJS Bug!')
  }
}

/**
  Python style json dump with 1 space
  Fixed as only this way the data is equal on all devices
  (The historic reason why python style is used is simply that the first zeronet version was written in python)
  * @param {object} data - Arbitrary object
  * @return {string} - Stringified JSON
  */
function pyJsonDump (data) {
  return jsonDump(orderObject(data))
}

module.exports = {
  dump: pyJsonDump,
  parse: data => JSON.parse(data),
  orderObject
}
