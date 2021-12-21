import { LocalStorageConfig } from "./types";

/**
 * default config
 */
let config: LocalStorageConfig = {
  namespace: '',
  delimiter: '',
  storages: {},
};


const localStorageConfig = (storageConfig: LocalStorageConfig) => {
  config = Object.assign({}, config, storageConfig);
  return config;
}

export {
  localStorageConfig,
  config
}