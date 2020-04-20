# use-const-callback

It's like `useCallback`, but you don't have to worry about dependencies.

## How does it work?

`useConstCallback` will return callback function and will never change it's reference during entire lifecycle of the component, but when called - it will always use 'fresh' version of the callback provided from the last render.

eg.

```tsx
import React, { useState, useEffect, memo } from 'react';
import { useConstCallback } from 'use-const-callback';

function SomeComponent() {
  // let's re-render the component every second
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((oldCount) => oldCount + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // we create callback that will never change it's reference, but will always
  // use last callback 'version' (so in this case it'll alert current count)
  const showCount = useConstCallback(() => {
    alert(count);
  });

  // now we use Button (which is memo component, so it'll not re-render if props doesn't change)
  // our `showCount` will never change - so this component will not re-render
  // but when called - it will show count from the last render
  return (
    <div>
      <Button onClick={showCount} />
      <div>{count}</div>
    </div>
  );
}

const Button = memo(function Memoized({ onClick }) {
  console.log('button rendered');
  return <div onClick={onClick}>Click</div>;
});
```

## Useage

`yarn add use-const-callback`

```ts
useConstCallback(callbackFunction); // returns function with the same signature as callbackFunction
```
