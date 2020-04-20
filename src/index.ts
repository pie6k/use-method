import { useCallback, useRef } from 'react';

/**
 * Will return callback function that will keep the same reference
 * during entire lifetime of the component, but when called,
 * will always use 'fresh' version of callback from last render
 *
 */
export function useConstCallback<Args extends any[], Result>(
  callback: (...args: Args) => Result,
) {
  /**
   * Remember 'fresh' callback function in ref during every render
   */
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  /**
   * Create actuall callback that will never change, but which under the hood
   * is always using the latest version of the callback function
   */
  const constantCallback = useCallback((...args: Args) => {
    return callbackRef.current(...args);
  }, []);

  return constantCallback;
}

export default useConstCallback;
