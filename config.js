"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
let config = { storages: {}, react: undefined };
exports.config = config;
const storageConfig = (storageConfig) => {
    exports.config = config = Object.assign({}, config, storageConfig);
    return config;
};
const storageKeyConfig = (keyConfig) => keyConfig;
exports.default = {
    storageConfig,
    storageKeyConfig
};
