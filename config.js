"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.localStorageConfig = void 0;
let config = {
    namespace: '',
    delimiter: '',
    storages: {},
};
exports.config = config;
const localStorageConfig = (storageConfig) => {
    exports.config = config = Object.assign({}, config, storageConfig);
    return config;
};
exports.localStorageConfig = localStorageConfig;
