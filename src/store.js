// Copyright (C) 2022 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/

import {createStore} from 'vuex'
import {fetchTokenValue} from './utils/api'
import {empty, expire, getAddress, getUnlockExpiry, getWalletVersion, setUnlockExpiry} from './utils/storage'

const GlobalConfig = require('@/config/GlobalConfig.json')
const _address = require('@/config/address.json')

// eslint-disable-next-line no-undef
const ethers = require('ethers')
// eslint-disable-next-line no-undef
const ABI_const = require('@/contract/ABI_const.js')
const WALLET_EXPIRY = 5 * 60 * 1000

const init = async () => {

  const expires = await getUnlockExpiry()
  const locked = expires.getTime() < Date.now()

  const address = await (async () => {
    try {
      return await getAddress()
    } catch (err) {
      console.debug(err)
      return ''
    }
  })()

  return createStore({
    state: {
      locked,
      address,
      balance: 0,
      xctBalance: 0,

      cnyBalance: undefined,

      // TODO investigate whether we can set these in app mixin instead
      config: {
        blockchain: {
          baseURL: GlobalConfig.BLOCK_CHAIN.RPC_URL[0]
        },
        index: {
          baseURL: process.env.VUE_APP_INDEX_API_URL
        },
        MULT_CALL: GlobalConfig.MULT_CALL,
        XCT: _address.XCT,
        env: process.env
      },
      wcConnectorSession: {},

      showAlert: false,
      alertMessage: '',
      alertType: 'info' // 类型可以是 'info', 'success', 'error'
    },
    mutations: {
      lock(state) {
        state.locked = true
        expire()
      },
      reset(state) {
        state.locked = true
        state.address = ''
        state.balance = 0
        state.nextNonce = 0
      },
      setAddress(state, address) {
        state.address = address
      },
      setBalance(state, balance) {
        state.balance = balance
      },
      setXctBalance(state, _xctBalance) {
        state.xctBalance = _xctBalance
      },
      setCNYBalance(state, cnyBalance) {
        state.cnyBalance = cnyBalance
      },
      unlock(state) {
        state.locked = false
        setUnlockExpiry(new Date(Date.now() + WALLET_EXPIRY))
      },
      showAlert(state, {message, type}) {
        state.alertMessage = message
        state.alertType = type
        state.showAlert = true
        setTimeout(() => {
          state.showAlert = false
          // 显示3秒后自动关闭
        }, 3000)
      }
    },
    actions: {
      async backgroundRefresh({commit, dispatch, state}, router) {
        const expires = await getUnlockExpiry()
        const locked = expires.getTime() < Date.now()

        if (locked) {
          if (!state.locked) {
            commit('lock')
            router.push('/')
          }
        }
        else {
          // postpones expiry
          commit('unlock')
          dispatch('refresh')
        }
      },
      forget({commit}) {
        empty()
        commit('reset')
      },
      async refresh({commit, dispatch, state}) {
        try {
          const customHttpProvider = new ethers.providers.JsonRpcProvider(state.config.blockchain.baseURL, {
            chainId: 27
          })
          const CtMultCallAddress = state.config.MULT_CALL
          const CtXCTAddress = state.config.XCT
          const contract = new ethers.Contract(
            CtMultCallAddress,
            ABI_const['CtMultCall'].abi,
            customHttpProvider
          )

          const accountBalance = await contract.callStatic.queryBalanceAndTokenBalance(
            state.address,
            CtXCTAddress,
            0,
            20
          )
          if (!state.address) return
          if (state.locked) return
          // const info = await xe.wallet.infoWithNextNonce(state.config.blockchain.baseURL, state.address)
          const balance = ethers.utils.formatEther(accountBalance.balance)
          commit('setBalance', balance)

          commit('setXctBalance', ethers.utils.formatUnits(accountBalance.tokenBalance, 2))
          dispatch('refreshTokenValue')
        } catch (e) {
          console.log(e)
        }

      },
      async refreshTokenValue({commit, state}) {
        const tokenValue = await fetchTokenValue()
        commit('setCNYBalance', tokenValue.cnyPerCT * (state.balance))
      }
    },
    modules: {}
  })
}

export default {
  init
}
