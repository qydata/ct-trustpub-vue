// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/
// const INDEX_API_URL = process.env.VUE_APP_INDEX_API_URL
const INDEX_API_URL = 'https://wallet.ctblock.cn/api/v1'

const BASE_URL = process.env.VUE_APP_BASE_URL
const BASE_API = process.env.VUE_APP_BASE_API

const fetchData = (url, options = {}, payload) => {
  const fetchOptions = {
    method: options.method || 'get',
    headers: options.headers || {
      'content-type': 'application/json'
    }
  }

  if (payload) {
    fetchOptions.body = JSON.stringify(payload, true, 2)
  }

  return fetch(url, fetchOptions)
    .then(res => res.json())
    .catch(() => ({
      code: 500,
      results: []
    }))
}

const fetchGasRates = async () => fetchData(`${INDEX_API_URL}/gasrates`)

const fetchExchangeRates = async () => await fetchData(`${INDEX_API_URL}/exchangerate`)


const fetchSessionsStats = async (wallet, options = {}) => {
  if (!options.range) options.range = 'daily'
  if (!options.count) options.limit = 100
  if (!wallet) options.wallet = null
  const url = `${INDEX_API_URL}/nodes/activity/?range=${options.range}&count=${options.count}&wallet=${wallet}`

  return await fetchData(url)
}

function sendTelCode(data) {
  return fetchData(`${BASE_URL}${BASE_API}/index.php?a=send_telcode`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

function queryCert(data) {
  return fetchData(`${BASE_URL}${BASE_API}/index.php?a=query_cert`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

function putChangeReq(data) {
  return fetchData(`${BASE_URL}${BASE_API}/index.php?a=putChangeReq`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

const fetchCardlist = async (options = {}) => {
  const url = `${INDEX_API_URL}/cardlist?signature=${options.signature}&timestamp=${options.timestamp}`
  return await fetchData(url, {
    method: 'post',
    headers: {}
  })
}

const postBindcard = async (body = {}) => {
  const url = `${INDEX_API_URL}/bindcard`
  return await fetchData(
    url,
    {method: 'post'},
    body)
}

function checkPay(data) {
  return fetchData(`${BASE_URL}${BASE_API}/index.php?a=check_pay&order_id=` + data.order_id, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function userCert(data) {
  return fetchData(`${BASE_URL}${BASE_API}/index.php?a=user_cert`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }, data)
}

function getTransactions(address) {
  return fetchData(`${BASE_URL}${BASE_API}/index.php?a=getTargetResponseGet`,
    {method: 'post'},
    {
      // TODO这里是测试代码
      // TEST
      // target_url: 'https://ctblock.cn/api/v2/main-page/transactions'
      // PROD
      target_url: `https://ctblock.cn/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`
    })
}

const fetchTransactions = async (address) => getTransactions(address).then((resultTx) => ({
  transactions: resultTx.data.items
}))

// const fetchTokenValue = async () => fetchData(`${INDEX_API_URL}/token/current`)
const fetchTokenValue = async () => ({cnyPerCT: 0.1})

export {
  fetchGasRates,
  fetchExchangeRates,
  fetchSessionsStats,
  fetchTransactions,
  sendTelCode,
  queryCert,
  userCert,
  putChangeReq,
  checkPay,
  fetchTokenValue,
  fetchCardlist,
  postBindcard
}
