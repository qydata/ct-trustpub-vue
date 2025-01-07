// Copyright (C) 2022 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import {clear, createStore, del, get, set} from 'idb-keyval'

const KEY_UNLOCK_EXPIRY = 'unlock-expiry'

/**
 * All data is stored in a single edge database > wallet store.
 * `idb-keyval` does not support multiple stores:
 * https://github.com/jakearchibald/idb-keyval/blob/main/custom-stores.md#defining-a-custom-database--store-name
 */
const store = createStore('ctchain', 'wallet')


/**
 * Clear storage.
 *
 * @returns Promise<void>
 */
const empty = () => clear(store)

/**
 * Force unlock expiry.
 *
 * @returns Promise<void>
 */
const expire = () => del(KEY_UNLOCK_EXPIRY, store)

/**
 * Get wallet address from storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {number|undefined} version Storage version
 * @returns Promise<string>
 */

const getWalletAddress = () => get('walletAddress', store)


/**
 * Get unlock expiry time from storage.
 *
 * @returns Promise<Date>
 */
const getUnlockExpiry = async () => {
  const dateStr = await get(KEY_UNLOCK_EXPIRY, store)
  if (!dateStr) return new Date(0)
  return new Date(dateStr)
}


/**
 * Set unlock expiry time in storage.
 *
 * @param {Date} date Expiry date & time
 * @returns Promise<void>
 */
const setUnlockExpiry = (date) => set(KEY_UNLOCK_EXPIRY, date.toString(), store)

const setCardList = (_address, date) => set('cardList', date, store)
const getCardList = () => get('cardList', store)

/**
 * Save wallet in storage.
 * @returns Promise<void>
 */
const setWalletAddress = (addr) => {
  set('walletAddress', addr, store)
}

const hasWallet = async () => {
  const walletAddress = await get('walletAddress', store)
  return walletAddress && walletAddress.length == 42
}

export {
  empty,
  expire,
  getUnlockExpiry,
  setUnlockExpiry,
  setCardList,
  getCardList,
  setWalletAddress,
  hasWallet,
  getWalletAddress,
  store
}

export class getPrivateKey {
}
