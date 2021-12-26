import configurationsMethods, { config } from './config'
import { CustomDispatcher, InitializedTrack, ReactLocalStorage, Track } from './types'

const { storageConfig, storageKeyConfig } = configurationsMethods

// to avoid this data in every class instance
const react = () => {
  if (!config.react) { throw new Error('Please provide the react instance') }
  return config.react
}

const storage = () => config.storage || window.localStorage

/**
 * tracker flags to avoid setting defaults on re-render
 */
const initalized: InitializedTrack = {}

let track: Track | undefined
const defaultTrackVersion = 1

class ReactLocalStorageKlass {
  constructor (key: string) {
    this.key = key
    this.updateState = null
    this.storageConfig = { defaults: {} }
  }

  // variables
  private readonly key: string;
  /**
   * key config data
   */
  private storageConfig: ReactLocalStorage<any>;
  /**
   * state dispatcher
   */
  private updateState: any;

  // methods
  public init<T> (): [T, CustomDispatcher] {
    const { storages } = config

    const storageConfig = storages[this.key] as ReactLocalStorage<T>
    if (!storageConfig) {
      console.warn(`config definition for storage:${this.key} not found`)
    }

    // cache config
    this.storageConfig = storageConfig

    const keyName = this.getKeyName(this.key)
    let stateValue: any

    const initKey = this.getInitKey()
    if (!initalized[initKey]) { initalized[initKey] = [] }
    const isIntialized = initalized[initKey].includes(this.key)

    const data = storage().getItem(keyName)

    // set default values if data not exists
    if (!data && !isIntialized && storageConfig?.defaults) {
      this.save(keyName, storageConfig?.defaults)
      this.setTrack(this.key, storageConfig?.version)
      stateValue = storageConfig?.defaults
    }

    // if data exists
    if (data) {
      stateValue = this.toState(data)
    }

    // check for migration
    !isIntialized && this.checkForMigration(stateValue)

    // state
    const useState = react().useState
    const [state, updateState] = useState(stateValue)
    this.updateState = updateState

    // init flag
    if (!isIntialized) {
      (initalized[initKey] as any).push(this.key)
    }

    return [state, this.dispatcher()]
  }

  public dispatcher (): CustomDispatcher {
    return {
      update: this.update.bind(this),
      reset: this.reset.bind(this),
      remove: this.remove.bind(this)
    }
  }

  private update (data: any) {
    const keyName = this.getKeyName(this.key)
    this.updateState && this.updateState(data)
    this.save(keyName, data)
    this.setTrack(this.key, this.storageConfig.version)
  }

  private reset () {
    const keyName = this.getKeyName(this.key)
    let defaultValue = this.storageConfig.defaults
    if (!defaultValue) {
      console.warn(`Definition for storage:${this.key} not found`)
      defaultValue = null
    }
    this.updateState && this.updateState(defaultValue)
    this.save(keyName, defaultValue)
    this.setTrack(this.key, this.storageConfig.version)
  }

  private remove () {
    const keyName = this.getKeyName(this.key)
    storage().removeItem(keyName)
    this.removeTrack(this.key)

    // update state
    this.updateState && this.updateState(null)
  }

  /**
   * converts key name with configured namespace & delimeter
   */
  private getKeyName (key: string): string {
    const { namespace, delimiter } = config
    return namespace ? `${namespace}${delimiter || '/'}${key}` : key
  }

  /**
   * converts the data  to supported local stoarge format
   */
  private toStorage (data: any): any {
    try {
      return JSON.stringify(data)
    } catch (error) { // may be string or number
      return data
    }
  }

  /**
   * converts the data to state format
   */
  private toState (data: any): any {
    try {
      return JSON.parse(data)
    } catch (error) { // may be string or number
      return data
    }
  }

  /**
   * Update data to local storage
   * @param data
   */
  private save (keyName: string, data: any) {
    const proccessedData = this.toStorage(data)
    storage().setItem(keyName, proccessedData)
  }

  // migrate
  private checkForMigration (currentValue: any) {
    const track = this.getTrack()

    if (!track[this.key]) { // set default version
      this.setTrack(this.key)
    } else if (track[this.key].v !== (this.storageConfig?.version || defaultTrackVersion)) { // migrate if conflict
      const migrationCallback = this.storageConfig?.migration
      if (!migrationCallback) {
        console.error(`Migration method not found for key:${this.key}`)
        return
      }

      const updatedValue = migrationCallback(currentValue, this.storageConfig.defaults)
      if (!updatedValue) {
        console.error('Expected return value from the callback')
      } else {
        this.save(this.getKeyName(this.key), updatedValue) // save migrated value
      }

      this.setTrack(this.key, this.storageConfig?.version) // update version
    }
  }

  // track
  private getTrackName (): string {
    return this.getKeyName('track')
  }

  private getTrack (): Track {
    if (!track) {
      const trackName = this.getTrackName()
      const trackData = storage().getItem(trackName)
      return this.toState(trackData) || {}
    }

    return track
  }

  private setTrack (key: string, version: number = defaultTrackVersion, setOnFalse: boolean = false) {
    const trackName = this.getTrackName()
    const track = this.getTrack()

    const updateTrack = () => {
      track[this.key] = { v: version }
      this.save(trackName, track)
    }

    // set only if deleted
    if (setOnFalse && !track[this.key]) {
      updateTrack()
    } else {
      updateTrack()
    }
  }

  private removeTrack (key: string) {
    const trackName = this.getTrackName()
    const track = this.getTrack()
    delete track[key]
    this.save(trackName, Object.assign(track))
  }

  private getInitKey () {
    return this.getKeyName('init')
  }
}

const useLocalStorage = <T>(key: string): [T, CustomDispatcher] => {
  const reactLocalStorageKlass = new ReactLocalStorageKlass(key)
  return reactLocalStorageKlass.init<T>()
}

export {
  useLocalStorage,
  storageConfig,
  storageKeyConfig,
  ReactLocalStorage
}
