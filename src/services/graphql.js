// src/services/graphql.js

import axios from 'axios'

const GRAPH_NODE_URL = 'https://graph-node.ctblock.cn/subgraphs/name/ctOraclePay'
const GRAPH_EXPLODER_URL = 'https://wallet.ctblock.cn/api/v1/graphql'

export function fetchGraphQL(query, variables = {}) {
  return axios.post(GRAPH_NODE_URL, {
    query: query,
    variables: variables
  }).then(response => {
    if (response.data.errors) {
      console.error('GraphQL errors:', response.data.errors)
      throw new Error('GraphQL error occurred')
    }
    return response.data.data
  }).catch(error => {
    console.error('Error fetching data:', error)
    // throw error
    return 'Error fetching data:' + error
  })
}

export function fetchGraphQLExploder(query, variables = {}) {
  return axios.post(GRAPH_EXPLODER_URL, {
    query: query,
    variables: variables
  }).then(response => {
    if (response.data.errors) {
      console.error('GraphQL errors:', response.data.errors)
      // throw new Error('GraphQL error occurred')
      return 'Error fetching data:' + response.data.errors[0].message
    }
    return response.data.data
  }).catch(error => {
    console.error('Error fetching data:', error)
    // throw error
    return 'Error fetching data:' + error
  })
}
