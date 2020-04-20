# Useage

`yarn add use-method`

```ts
import { useMethod } from 'use-method';

function MyComponent() {
  const randomNumber = Math.random();

  // returns function that keeps the same reference during entire lifecycle of the component, while always using 'fresh' variables from last render
  const hiMethod = useMethod((name) => {
    // it'll always have `randomNumber` variable from the last render
    alert(`Hi, ${name} (${randomNumber})!`);
  });

  // hiMethod reference will remain the same on every render - if you'll pass it to other components like <MyComponent onEvent={hiMethod} /> it'll never re-render if it's memo or PureComponent
}
```

# Introduction & Rationale

When hooks got introduced - it's became problematic to keep functions references the same on each render.

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

Without any optimization - `handleClick` would result in a brand new function on every render.

React `useCallback` hook is created to help solving this problem.

But even `useCallback` updates function reference when variables used as dependencies change.

Also - useCallback dependencies list tend to 'pollute' the code and might make it easy to introduce nasty bugs if you don't use proper linter.

`use-method` makes provided function behave like class method. It will have the same reference on every render, but it'll use values from last render.

Let's consider such example:

```tsx
function PeopleToggler({ people, onToggle }) {
  const togglePerson = useMethod((person) => {
    // we want to always use `fresh` people and onToggle props here
    const peopleAfterToggle = oggleInArray(people, person);
    onToggle(peopleAfterToggle);
  });

  return <ToggleButton onToggle={togglePerson} />;
}
```

When `togglePerson` is called - it has access to fresh `people` and `onToggle` values.

At the same time, `togglePerson` reference remains constant.

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

In this case, `togglePerson` will actually get a new reference every time props `people` or `onToggle` will update.

## When to use it and when not to use it?

You can think about it in the same way as class method.

In class, if you'd have something like

```tsx
<Button onPress={this.handlePress} />
```

It's fine, but if you'd have something like

```tsx
class Table extends Component {
  cellLabel = 'Person';

  renderCell(item) {
    return (
      <div>
        Cell: {item.name} (type: {this.cellLabel})
      </div>
    );
  }

  render() {
    <div>
      {this.props.cells.map((cellData) => {
        return <Cell renderer={this.renderCell} key={someKey} />;
      })}
    </div>;
  }
}
```

It's not really safe, because if `cellLabel` will change - Cell will not know about it and as all it's props are the same - it'll not re-render.

Therefore you should use `use-method` mostly for events or something that dont impact rendering output.

## Licence

MIT
