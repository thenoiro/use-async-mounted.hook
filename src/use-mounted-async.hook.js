import { useEffect, useCallback } from 'react';

const useMountedAsync = (hookCallback, deps = null) => {
  const dependencies = Array.isArray(deps) ? deps : [];
  const dependedCallback = useCallback(hookCallback, dependencies);
  const cb = Array.isArray(deps) ? dependedCallback : hookCallback;

  useEffect(() => {
    let isMounted = true;
    let alwaysCallback = null;
    let successCallback = null;
    let errorCallback = null;
    let finallyCallback = null;

    const handleSuccess = (scb) => {
      successCallback = scb;
    };
    const handleError = (ecb) => {
      errorCallback = ecb;
    };
    const handleAlways = (acb) => {
      alwaysCallback = acb;
    };
    const handleFinally = (fcb) => {
      finallyCallback = fcb;
    };
    const runCallback = (fn, ...args) => {
      if (typeof fn === 'function') {
        fn(...args);
      }
    };
    const handleFunction = async () => {
      try {
        const asyncFunction = cb({
          always: handleAlways,
          success: handleSuccess,
          error: handleError,
          finally: handleFinally,
        });
        if (!asyncFunction) {
          return;
        }
        if (!(asyncFunction instanceof Promise)) {
          throw new Error('Given function is not async (should be an instance of Promise).');
        }
        const data = await asyncFunction;

        if (data instanceof Error) {
          throw data;
        }
        if (isMounted) {
          runCallback(alwaysCallback, true);
          runCallback(successCallback, data);
          runCallback(finallyCallback);
        }
      } catch (ex) {
        if (isMounted) {
          runCallback(alwaysCallback, false);
          runCallback(errorCallback, ex);
          runCallback(finallyCallback);
        }
      }
    };
    handleFunction();

    return () => {
      isMounted = false;
    };
  }, [cb]);
};
export default useMountedAsync;
