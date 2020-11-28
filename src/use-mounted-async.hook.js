import { useEffect, useCallback } from 'react';

const useMountedAsync = (hookCallback, deps = null) => {
  const dependencies = Array.isArray(deps) ? deps : [];
  const dependedCallback = useCallback(hookCallback, dependencies);
  const cb = Array.isArray(deps) ? dependedCallback : hookCallback;

  useEffect(() => {
    let isMounted = true;
    let successCallback = null;
    let errorCallback = null;
    let alwaysCallback = null;

    const handleSuccess = (scb) => {
      successCallback = scb;
    };
    const handleError = (ecb) => {
      errorCallback = ecb;
    };
    const handleAlways = (acb) => {
      alwaysCallback = acb;
    };
    const handleFunction = async () => {
      try {
        const asyncFunction = cb({
          always: handleAlways,
          success: handleSuccess,
          error: handleError,
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
        if (typeof successCallback === 'function' && isMounted) {
          if (typeof alwaysCallback === 'function') {
            alwaysCallback(true);
          }
          successCallback(data);
        }
      } catch (ex) {
        if (typeof errorCallback === 'function' && isMounted) {
          if (typeof alwaysCallback === 'function') {
            alwaysCallback(false);
          }
          errorCallback(ex);
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
