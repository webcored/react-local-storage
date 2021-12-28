<img src="https://webcored-assets.netlify.app/react-local-storage.png"  height="250px" />

# React local storage

A stateful react hook for browser storage.

[![build](https://github.com/webcored/react-local-storage/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/webcored/react-local-storage/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/@webcored/react-local-storage?color=%23959DA)](https://www.npmjs.com/package/@webcored/react-local-storage)
[![downloads](https://img.shields.io/npm/dm/@webcored/react-local-storage?color=%23959DA)](https://www.npmjs.com/package/@webcored/react-local-storage)
![typescript](https://img.shields.io/npm/types/typescript)
![contributions](https://img.shields.io/badge/contributions-welcome-%3CCOLOR%3E.svg?style=flat)

## Why?

* Configurable
* Defaults support
* Versions & Migrations

## Usage

<small>component.jsx</small>
```js
const [user, userStorage] = useLocalStorage('user');

....

userStorage.update(...user, { name: 'new name' });
```

<details><summary>typescript</summary>
<p>

```ts
const [user, userStorage] = useLocalStorage<User>('user');
  
....

userStorage.update(...user, { name: 'new name' });
```
</p>
</details>

### sample app
 
|<a href="https://github.com/webcored/react-local-storage-app-js" target="_blank">View on Github</a> | <a href="https://codesandbox.io/s/react-local-storage-js-di7we" target="_blank"><img src="https://codesandbox.io/static/img/play-codesandbox.svg"></a>|
| ------------- | ------------- |

<details><summary>typescript</summary>
<p>

|<a href="https://github.com/webcored/react-local-storage-app-ts" target="_blank">View on Github</a>| <a href="https://codesandbox.io/s/react-local-storage-ts-gwye1" target="_blank"><img src="https://codesandbox.io/static/img/play-codesandbox.svg"></a> |
| ------------- | ------------- |
</p>
</details>


## Configurations

```js
import React from 'react';
import { user } from './storages/user';

import { storageConfig } from "react-local-storage";

...

localStorageConfig({
  namespace: 'app',
  delimiter: '/'
  react: React
  storages: {
    user
  }
})

```
### available [configuration options](https://github.com/webcored/react-local-storage/blob/main/src/types.ts#L9)


| config  | default | optional | description |
| ------------- | ------------- | ------------- | ------------- |
| namespace  | null  | true | namespace your storage keys to <br> **avoid conflicts especially in the case micro-frontends**.
| delimiter  | /  | true |delimiter between the namespace and keys, <br>ie: if namespace is app then key of user will be `app/user`
| react  | null  | false |react-local-storage uses useState hook internally which will be <br> abstracted from the given react instance.
| storage | window.localStorage | true | choose between local or session storage
| storages | null | true | storage keys config & definition


### [Key configurations](https://github.com/webcored/react-local-storage/blob/main/src/types.ts#L3)

Each key can have its own configuration

#### Defaults

Configure default values to the localstorage key

```js
import { storageKeyConfig } from "@webcored/react-local-storage"

const user = storageKeyConfig({
  defaults: {
    name: 'Guest',
    email: 'guest@email.com'
  }
})
```
<details><summary>typescript</summary>
<p>

```ts

import { storageKeyConfig } from "@webcored/react-local-storage"

const user = storageKeyConfig<User>({
  defaults: {
    name: 'Guest',
    email: 'guest@email.com'
  }
})
```
</p>
</details>

#### Versions & Migrations

If there is a schema change in the local storage or in the default value, the storage can be simply migrated to the latest version by **incrementing the version** of a key.
It will trigger the **migrationcallback** when there is a diff with version.


```js
import { storageKeyConfig } from "@webcored/react-local-storage"

const user = storageKeyConfig({
  defaults: {
    name: 'Guest',
    email: 'guest@email.com',
    avatar: 'example.com/guest.png'
  },
  version: 2,
  migration: (currentValue, defaultValue) {
    return Object.assign({}, ...currentValue, ...defaultValue);
  }
})
```
<details><summary>typescript</summary>
<p>

```ts
import { storageKeyConfig } from "@webcored/react-local-storage"

const user = storageKeyConfig<User>({
  defaults: {
    name: 'Guest',
    email: 'guest@email.com',
    avatar: 'example.com/guest.png'
  },
  version: 2,
  migration: (currentValue, defaultValue) {
    return Object.assign({}, ...currentValue, ...defaultValue);
  }
})
```
</p>
</details>






