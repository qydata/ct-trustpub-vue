// src/services/userService.js

import {fetchGraphQL, fetchGraphQLExploder} from './graphql'

export function chainpayOrderEvents(skip, first, hideReleased) {
  let query
  let variables
  if (hideReleased === 1) {
    query = `
    query (
    $skip:Int
    $first:Int
    $_chainpayOrder_state:BigInt
    ) {
      chainpayOrderEvents(
        skip: $skip
        where: {_chainpayOrder_state: $_chainpayOrder_state}
        first: $first
        ) {
        id
        _chainpayOrder_sender
        _chainpayOrder_trues
        _chainpayOrder_falses
        _chainpayOrder_value
        blockNumber
        blockTimestamp
        transactionHash
        _chainpayOrder_state
        _chainpayOrder_orderId
        _chainpayOrder_createAt
        _chainpayOrder_updateAt
      }
    }
  `
    variables = {skip: skip, first: first, _chainpayOrder_state: hideReleased}
  }
  else {
    query = `
    query ($skip:Int, $first:Int) {
      chainpayOrderEvents(
        skip: $skip
        first: $first) {
        id
        _chainpayOrder_sender
        _chainpayOrder_trues
        _chainpayOrder_falses
        _chainpayOrder_value
        blockNumber
        blockTimestamp
        transactionHash
        _chainpayOrder_state
        _chainpayOrder_orderId
        _chainpayOrder_createAt
        _chainpayOrder_updateAt
      }
    }
  `
    variables = {skip: skip, first: first}

  }
  return fetchGraphQL(query, variables)
}

export function transactionsByAddress(first, hash) {

  const query = `
    query ($hash:AddressHash!, $first:Int) {
      address(hash: $hash) {
        transactions(first: $first) {
          edges {
            cursor
            node {
              id
              hash
              status
              fromAddressHash
              toAddressHash
              value
              gas
              earliestProcessingStart
              blockNumber
              createdContractAddressHash
            }
          }
        }
      }
    }
  `
  const variables = {first: first, hash: hash}

  return fetchGraphQLExploder(query, variables)
}
