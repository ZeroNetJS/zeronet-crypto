'use strict'

/* eslint-disable camelcase */

const btcMessage = require('bitcoinjs-message')

/**
  Verifies a bitcoin signature
  * @param {string} address - Bitcoin address of the signer
  * @param {string} data - Data that was signed
  * @param {string} signature - Signature of the data
  * @return {boolean} - Returns wether the signature was valid and signed with the key
  */
function verifySignature (address, data, signature) {
  return btcMessage.verify(data, address, signature, '\x18Bitcoin Signed Message:\n')
}

/**
  Gets the valid signers for a file based on it's path and address
  Will be soon deperacted in favor of zeronet-auth
  * @param {string} address - The address of the zie
  * @param {string} inner_path - The path of the content.json file
  * @param {object} data - The content.json contents as object
  * @return {array} - Array of valid signers
  */
function constructValidSigners (address, inner_path, data) {
  let valid_signers = []
  if (inner_path === 'content.json') {
    if (data.signers) valid_signers = Object.keys(data.signers)
  } else {
    // TODO: multi-user
  }
  if (valid_signers.indexOf(address) === -1) valid_signers.push(address) // Address is always a valid signer
  return valid_signers
}

/**
  Returns the signers_sign based on the array of valid signers and singers_required
  * @param {array} valid_signers - Valid signers array
  * @param {number} signers_required - The signers required
  * @return {string} - signers_sign data field
  */
function GetSigners (valid_signers, signers_required) {
  return signers_required + ':' + valid_signers.join(',')
}

module.exports = {
  verifySignature,
  constructValidSigners,
  GetSigners
}
