import * as React from 'react';
import { render } from 'react-dom';
import { useMethod } from '../src';

import { RenderCount } from './RendersCount';

const { useState, useEffect, memo } = React;

function App() {
  // let's re-render the component every second
  const [count, setCount] = useState(1);

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
  const showCount = useMethod(() => {
    alert(count);
  });

  // now we use Button (which is memo component, so it'll not re-render if props doesn't change)
  // our `showCount` will never change - so this component will not re-render
  // but when called - it will show count from the last render
  return (
    <div>
      <RenderCount label="App" />
      <Button onClick={showCount} />
    </div>
  );
}

const Button = memo(function Memoized({ onClick }: { onClick: () => void }) {
  console.log('button rendered');
  return (
    <div>
      <RenderCount label="Button" />
      <button onClick={onClick}>Click</button>
    </div>
  );
});

render(<App />, document.getElementById('app'));
