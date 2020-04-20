import * as React from 'react';

interface Props {
  label: string;
}

export function RenderCount({ label }: Props) {
  const countRef = React.useRef(0);
  countRef.current++;

  return (
    <div>
      {label} renders count - {countRef.current}
    </div>
  );
}
