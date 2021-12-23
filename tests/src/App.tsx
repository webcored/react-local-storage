import React from 'react';
import logo from './logo.svg';

import { useLocalStorage } from '../../index'
import { localStorageConfig } from '../../config'

function App(props: any) {
  // config
  if (props.config) {
    localStorageConfig({
      react: React,
      ...props.config,
    });
  }

  // get storage
  const [user, userDispatch] = useLocalStorage<any>('user');

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={() => userDispatch.update({ ...user, name: 'Tony Stark' })} data-testid="update">Update</button>
        <button onClick={() => userDispatch.reset()} data-testid="reset">Reset</button>
        <button onClick={() => userDispatch.remove()} data-testid="remove">Remove</button>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
