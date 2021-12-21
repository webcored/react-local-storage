# React local storage

A stateful react hook for browser storage.

## Why?

* Configurable
* Defaults support
* Versions & Migrations

## Usage

##### sample app
|javascript| [![Edit react-local-storage](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vy14jywyl7?fontsize=14&hidenavigation=1&theme=dark) |
| ------------- | ------------- |
|typescript| [![Edit react-local-storage](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vy14jywyl7?fontsize=14&hidenavigation=1&theme=dark) |

<small>component.js</small>
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

## Configurations

<small>app.js</small>
```js
import React from 'react';
import { user } from './storages/user';

import { localStorageConfig } from "react-local-storage/config";

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
| delimiter  | /  | true |delimiter between the namespace and keys, <br>example if namespace is app then key of user will be `app/user`
| react  | null  | false |react-local-storage uses useState hook internally which will be <br> abstracted from the given react instance.
| storage | window.localStorage | true | choose between local or session storage
| storages | null | true | storage keys config & definition object


### [Key configurations](https://github.com/webcored/react-local-storage/blob/main/src/types.ts#L3)

Each and every key can have its own configuration

#### Defaults

Configure default values to the localstorage key

```js
const user = {
  defaults: {
    name: 'Guest',
    email: 'guest@email.com'
  }
}
```
<details><summary>typescript</summary>
<p>

```ts
import { ReactLocalStorage } from "react-local-storage";

const user = ReactLocalStorage<User> {
  defaults: {
    name: 'Guest',
    email: 'guest@email.com'
  }
}
```
</p>
</details>

#### Versions & Migrations

If there is a schema change in the local storage or in the default value, the storage can be simply migrated to the latest version by **incrementing the version** of a key.
It will trigger the **migrationcallback** when there is a diff with version.


```js
const user = {
  defaults: {
    name: 'Guest',
    email: 'guest@email.com',
    avatar: 'example.com/guest.png'
  },
  version: 2,
  migration: (currentValue, defaultValue) {
    return Object.assign({}, ...currentValue, ...defaultValue);
  }
}
```
<details><summary>typescript</summary>
<p>

```ts
import { ReactLocalStorage } from "react-local-storage";

const user = ReactLocalStorage<User> {
  defaults: {
    name: 'Guest',
    email: 'guest@email.com',
    avatar: 'example.com/guest.png'
  },
  version: 2,
  migration: (currentValue, defaultValue) {
    return Object.assign({}, ...currentValue, ...defaultValue);
  }
}
```
</p>
</details>






