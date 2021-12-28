"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageKeyConfig = exports.storageConfig = exports.useLocalStorage = void 0;
const config_1 = require("./config");
const { storageConfig, storageKeyConfig } = config_1.default;
exports.storageConfig = storageConfig;
exports.storageKeyConfig = storageKeyConfig;
const react = () => {
    if (!config_1.config.react) {
        throw new Error('Please provide a react instance');
    }
    return config_1.config.react;
};
const storage = () => config_1.config.storage || window.localStorage;
const storageTrack = {};
let versionTrack;
const defaultTrackVersion = 1;
const trackKey = 'track';
const initKey = 'init';
class ReactLocalStorageKlass {
    constructor(key) {
        this.key = key;
        this.updateState = null;
        this.storageConfig = { defaults: {} };
    }
    init() {
        const { storages } = config_1.config;
        const storageConfig = storages[this.key];
        if (!storageConfig) {
            console.warn(`config definition for storage:${this.key} not found`);
        }
        if (!storageTrack[this.initKey]) {
            storageTrack[this.initKey] = [];
        }
        const initialized = storageTrack[this.initKey].includes(this.key);
        this.storageConfig = storageConfig;
        const data = storage().getItem(this.keyName);
        if (!data && !initialized && (storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.defaults)) {
            this.save(this.keyName, storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.defaults);
            this.setTrack(this.key, storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.version);
        }
        const stateValue = this.toState(data) || ((storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.defaults) || null);
        !initialized && this.checkForMigration(stateValue);
        const useState = react().useState;
        const [state, updateState] = useState(stateValue);
        this.updateState = updateState;
        const customDispatcher = this.dispatcher();
        storageTrack[this.initKey].push(this.key);
        return [state, customDispatcher];
    }
    dispatcher() {
        return {
            update: this.update.bind(this),
            reset: this.reset.bind(this),
            remove: this.remove.bind(this)
        };
    }
    update(data) {
        var _a;
        this.updateState && this.updateState(data);
        this.save(this.keyName, data);
        this.setTrack(this.key, (_a = this.storageConfig) === null || _a === void 0 ? void 0 : _a.version);
    }
    reset() {
        var _a, _b;
        const defaultValue = ((_a = this.storageConfig) === null || _a === void 0 ? void 0 : _a.defaults) || null;
        if (!defaultValue) {
            this.noDefinitionWaring();
        }
        this.updateState && this.updateState(defaultValue);
        this.save(this.keyName, defaultValue);
        this.setTrack(this.key, (_b = this.storageConfig) === null || _b === void 0 ? void 0 : _b.version);
    }
    remove() {
        storage().removeItem(this.keyName);
        this.removeTrack(this.key);
        this.updateState && this.updateState(null);
    }
    getKeyName(key) {
        const { namespace, delimiter } = config_1.config;
        return namespace ? `${namespace}${delimiter || '/'}${key}` : key;
    }
    get keyName() {
        return this.getKeyName(this.key);
    }
    get initKey() {
        return this.getKeyName(initKey);
    }
    get trackKey() {
        return this.getKeyName(trackKey);
    }
    toStorage(data) {
        try {
            return JSON.stringify(data);
        }
        catch (error) {
            return data;
        }
    }
    toState(data) {
        try {
            return JSON.parse(data);
        }
        catch (error) {
            return data;
        }
    }
    save(key, data) {
        const proccessedData = this.toStorage(data);
        storage().setItem(key, proccessedData);
    }
    checkForMigration(currentValue) {
        var _a, _b, _c;
        const track = this.getTrack();
        if (!track[this.key]) {
            this.setTrack(this.key);
        }
        else if (track[this.key].v !== (((_a = this.storageConfig) === null || _a === void 0 ? void 0 : _a.version) || defaultTrackVersion)) {
            const migrationCallback = (_b = this.storageConfig) === null || _b === void 0 ? void 0 : _b.migration;
            if (!migrationCallback) {
                console.error(`Migration method not found for key:${this.key}`);
                return;
            }
            const migratedValue = migrationCallback(currentValue, this.storageConfig.defaults);
            if (!migratedValue) {
                console.error('Expected return value from the callback');
            }
            else {
                this.save(this.keyName, migratedValue);
            }
            this.setTrack(this.key, (_c = this.storageConfig) === null || _c === void 0 ? void 0 : _c.version);
        }
    }
    getTrack() {
        if (!versionTrack) {
            const trackData = storage().getItem(this.trackKey);
            return this.toState(trackData) || {};
        }
        return versionTrack;
    }
    setTrack(key, version = defaultTrackVersion) {
        const track = this.getTrack();
        track[this.key] = { v: version };
        this.save(this.trackKey, track);
    }
    removeTrack(key) {
        const track = this.getTrack();
        delete track[key];
        this.save(this.trackKey, Object.assign(track));
    }
    noDefinitionWaring() {
        console.warn(`config definition for storage:${this.key} not found`);
    }
}
const useLocalStorage = (key) => {
    const reactLocalStorageKlass = new ReactLocalStorageKlass(key);
    return reactLocalStorageKlass.init();
};
exports.useLocalStorage = useLocalStorage;
