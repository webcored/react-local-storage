import { ReactLocalStorage, StorageConfig } from './types'

let config: StorageConfig = { storages: {}, react: undefined }

const storageConfig = (storageConfig: StorageConfig): StorageConfig => {
  config = Object.assign({}, config, storageConfig)
  return config
}

const storageKeyConfig = <T>(keyConfig: ReactLocalStorage<T>) => keyConfig

export { config } // to maintain the global ref

export default {
  storageConfig,
  storageKeyConfig
}
