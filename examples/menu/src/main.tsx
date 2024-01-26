import type { JSX } from 'solid-js';
import { render } from 'solid-js/web';
import App from './App';

import './style.css';

function Root(): JSX.Element {
  return (
    <div class="bg-gradient-to-r from-fuchsia-400 to-purple-600 w-screen h-screen flex overflow-hidden">
      <div class="flex flex-col items-center justify-center w-full">
        <App />
      </div>
    </div>
  );
}

const app = document.getElementById('app');

if (app) {
  render(() => <Root />, app);
}
