# Useage

`yarn add use-const-callback`

```ts
useConstCallback(callbackFunction); // returns function with the same signature as callbackFunction
```

# Introduction & Rationale

When hooks got introduced - it's became problematic to avoid re-creating functions references on each render.

With classes it's not a problem. You just call `this.handleClick` which has the same reference on every render.

With functional components, you define such functions during rendering like

```tsx
function SomeComponent() {
  function handleClick() {
    // handling click
  }

  // rendering
}
```

Without any optimization - `handleClick` would be brand new function on every render, which can lead to re-rendering child components.

React `useCallback` hook is created to help solving this problem.

However, when using it, you might face some problems:

## Polluted code which doesn't contribute to business logic:

Quite often, when creating more complicated components, you'll end up having quite long list of callback dependencies:

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

It 'pollutes' your code without contributing to actual business logic.

It becomes even worse if your list of dependencies becomes so long that formatter like prettier breaks the list into multiple lines.

Code lines related to those dependencies can actually be quite big part of total lines of code of your file.

Also - without using proper linter - it's very easy to forget about adding some dependency which might lead to nasty bugs. You can also provide too many dependencies at some point (eg. when you'll refactor your code) which can loosen your optimizations.

## useCallback result reference still has to update when dependencies change

Even when properly using `useCallback` - your function reference still has to update when dependencies change. eg:

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

In this case, our `togglePerson` will actually get new reference every time props `{people, onToggle}` will change. It seems unavoidable with `useCallback` without creating ref value for every value used inside the callback.

It means our `ToggleButton` will also re-render every time main props will change.

## What can we do about it?

First, let's consider this:

There are actually 2 main ways in which functions passed as props are used in React components.

### One way is to call a function from props DURING the render:

```tsx
function UserFollowersCount({ followersFilter, followersList }) {
  const actualFollowers = followersList.filter((follower) => {
    // !! Our function from props is called DURING the render
    return followersFilter(follower);
  });

  // render the list
}
```

In this case - function provided in prop (`followersFilter`) can impact render result so component needs to be aware when it has changed in order to re-render.

In this case it's good thing that `followersFilter` will get new reference as we indeed want it to re-render.

### We also have functions from props called only AFTER the render (usually inside events)

Quite often we pass a lot of functions (usually related to events) that got called at some point in time AFTER the render (they can also never be actually called)

```tsx
function Input({placeholder, onChange}) {
  return <input placeholder={placeholder} onChange={event => {
    // onChange function from props get called on some event after the render
    // it might also never be actually called
    onChange(event.target.value)
  }}>
}
```

In this case, provided function in props doesn't impact render result as it's only used AFTER the render when some action (like onClick/onChange) occurs.

What it means in terms of optimizations is we want to keep this prop function reference the same as long as possible while allowing it to have access to fresh values used inside it.

And this is exactly what `useConstCallback` is doing.

## How does it work?

`useConstCallback` will return the same callback function reference during entire lifecycle of the component, but under the hood it'll always use last function version, when called.

Let's consider such example:

```tsx
function PeopleToggler({ people, onToggle }) {
  const togglePerson = useConstCallback((person) => {
    // we want to always use `fresh` people and onToggle props here
    const peopleAfterToggle = oggleInArray(people, person);
    onToggle(peopleAfterToggle);
  });

  return <ToggleButton onToggle={togglePerson} />;
}
```

When `togglePerson` is called - we need access to fresh `people` and `onToggle` values in order for callback to work properly.

At the same time, we want `togglePerson` reference to remain constant to avoid re-rendering `ToggleButton`.

Both of those things will happen with `useConstCallback`.

The same component using `useCallback` could look like:

```tsx
function PeopleToggler({ people, onToggle }) {
  const togglePerson = useCallback(
    (person) => {
      // we need fresh `people` and `onToggle` here
      const peopleAfterToggle = oggleInArray(people, person);
      onToggle(peopleAfterToggle);
    },
    [people, onToggle],
  );

  return <ToggleButton onToggle={togglePerson} />;
}
```

In this case, our `togglePerson` will actually get new reference every time props `people` or `onToggle` props will change.

It means our `ToggleButton` will also re-render every time those props change.

## When to use it and when not to use it?

### If some function is called DURING the render block eg.

```tsx
function PersonCard({ person, avatarRenderer }) {
  return (
    <div>
      <strong>{person.name}</strong>
      <div className="avarar-holder">
        {/** avararRenderer is called DURING the render **/}
        {avatarRenderer(person)}
      </div>
    </div>
  );
}
```

Dont use this hook. Function returned from it will always have the same reference so child component will not know if it has to re-render

### If some function is called AFTER the render block eg.

```tsx
function Clicker({ label, onClick }) {
  return (
    <div
      onClick={() => {
        // onClick is called AFTER the render (it might actually never get called)
        onClick();
      }}
    >
      {label}
    </div>
  );
}
```

Use this hook as it's not used called during the render.

## Licence

MIT
