import { useEffect } from 'react';

const useMountedAsync = (cb) => {
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
          success: handleSuccess,
          error: handleError,
          always: handleAlways,
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
          successCallback(data);
        }
      } catch (ex) {
        if (typeof errorCallback === 'function' && isMounted) {
          errorCallback(ex);
        }
      }
      if (typeof alwaysCallback === 'function' && isMounted) {
        alwaysCallback();
      }
    };
    handleFunction();

    return () => {
      isMounted = false;
    };
  }, [cb]);
};
export default useMountedAsync;
