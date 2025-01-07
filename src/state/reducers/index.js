import {combineReducers} from 'redux'
import {thetaWalletReducer} from './ThetaWallet'
import {uiReducer} from './ui'
import {walletReducer} from './Wallet'

export const rootReducer = combineReducers({
  wallet: walletReducer,
  ui: uiReducer,
  thetaWallet: thetaWalletReducer
})
