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

## When to use it and when not to use it?

There are 2 main ways in which functions passed as props are used in React components.

One way is to call a function from props DURING the render and another is to call function from props after the render (eg during events)

### Function from props called DURING the render:

```tsx
function UserFollowersCount({ followersFilter, followersList }) {
  const actualFollowers = followersList.filter((follower) => {
    // !! Our function from props is called DURING the render
    return followersFilter(follower);
  });

  // render the list
}
```

In this case - function provided in prop impact render result so component needs to be aware when it has changed.

In this case you should not use this hook.

### Function from props called AFTER the render

eg.

```tsx
function Input({placeholder, onChange}) {
  return <input placeholder={placeholder} onChange={event => {
    // !! our function from props is NOT called (with `()`) DURING the render, but after the render on some action
    // it means this function has no 'power' to impact result of the render!
    onChange(event.target.value)
  }}>
}
```

In this case, provided function in props doesn't impact render result as it's only used after the render when some action (like onClick/onChange) occurs

This is where you can use this hook.

With `useConstCallback` the component will always get the same reference to the function, but when it's called it'll have fresh variables.

## Why?

There are a few advantages you'll get by using this hook:

### Easier to read and simpler code

When you're using `useCallback` - you have to provide an array of dependencies telling when your the callback function becomes 'stale'.

Very often, you actually put everything that is used inside the callback to this dependencies array (actually, eslint rules related to hooks require that).

It means you just want to have fresh variables inside while keeping old reference as long as possible.

As your component becomes complex, you might find yourself creating long arrays of dependencies for every callback.

eg

```tsx
const onDragMove = useCallback(() => {
  // implementation
}, [
  onDragStart,
  onDragEnd,
  onDragSort,
  currentDraggableItems,
  currentDraggedItem,
]);
```

It 'pollutes' your without contributing to actual business logic.

It becomes even worse if your list of dependencies becomes so long that formatter like prettier breaks the list into multiple lines.

### Saving more re-renders than useCallback

Even if you're properly using `useCallback`, your function still gets new reference sometimes when it's dependencies changes.

eg.

```tsx
function PeopleToggler({ people, onToggle }) {
  const togglePerson = useCallback(
    (person) => {
      const peopleAfterToggle = oggleInArray(people, person);
      onToggle(peopleAfterToggle);
    },
    [people, onToggle],
  );

  return <ToggleButton onToggle={togglePerson} />;
}
```

In this case, our `togglePerson` will actually get new reference every time props `{people, onToggle}` will change. It seems unavoidable with `useCallback`.

It means our `ToggleButton` will also re-render every time our callback gets a new reference.

Here is the same component, but using `useConstCallback`:

```tsx
function PeopleToggler({ people, onToggle }) {
  const togglePerson = useConstCallback((person) => {
    const peopleAfterToggle = oggleInArray(people, person);
    onToggle(peopleAfterToggle);
  });

  return <ToggleButton onToggle={togglePerson} />;
}
```

`togglePerson` will keep the same reference during entire lifetime of the component, but when called - it'll use latest version of the callback from last render.

This actually saves us `ToggleButton` re-renders while keeping callback working properly.
