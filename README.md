# Suspensify

Easy way to convert any async function to suspended function

```
yarn add suspensify
```

Demo: https://pie6k.github.io/suspensify/

```ts
import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { suspensify } from 'suspensify';

// first - let's say we have some regular, async function
function getHelloWithDelay(name: string, delay: number) {
  // just a promise that returns a string after some delay
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(`Hello, ${name}`);
    }, delay);
  });
}

// now we convert it to suspended function
const [getSuspendedHello] = suspensify(getHelloWithDelay);

// now we can just use it inside any component like it is sync function

// let's create some simple component
interface DelayedHelloProps {
  delay: number;
  name: string;
}

function DelayedHello({ delay, name }: DelayedHelloProps) {
  const helloString = getSuspendedHello(name, delay);
  return <div>{helloString}</div>;
}

// last step is to create suspense loading fallback
function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DelayedHello name="Bob" delay={1000} />
    </Suspense>
  );
}

// and start the app
render(<App />, document.getElementById('app'));
```
