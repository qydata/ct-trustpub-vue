// middlewares
import {cypherMiddleware} from '@/service/middleware/cypherMiddleware'
import {Connection} from 'jsstore'

// Import all database table schemas
import tables from './tables/index'

const getWorkerPath = () => {
  // return dev build when env is development
  if (process.env.NODE_ENV === 'development') {
    return require('file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.js')
  }
  // eslint-disable-next-line line-comment-position
  else { // return prod build when env is production
    return require('file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.min.js')
  }
}

const workerPath = getWorkerPath().default
export const idbCon = new Connection(new Worker(workerPath))
export const dbName = 'ToolWalletDb'
export const initJsStore = async () => {
  try {
    const isDbCreated = await idbCon.initDb(getDatabase())
    idbCon.addMiddleware(cypherMiddleware)

    if (isDbCreated) {
      console.log('Database created. Version: ', getDatabase().version)
      // Perform database alters on version change here.
    }
    else {
      console.log('IdbService.js: db opened')
    }
  }
  catch (ex) {
    console.log(ex)
  }
}

const getDatabase = () => {
  const dataBase = {
    name: 'ToolWallet',
    version: 1,
    tables: [
      tables.tblUsers,
      tables.tblContacts,
      tables.tblContactAddresses,
      tables.tblActivityHistory,
      tables.tblWallets,
      tables.tblHistory,
      tables.tblUserSettings,
      tables.tblErrors,
      tables.tblWeb3Connections
    ]
  }
  return dataBase
}
