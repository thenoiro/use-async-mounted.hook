# [use-mounted-async](https://github.com/thenoiro/use-async-mounted.hook) - React hook which allows to run async action callbacks (succes, error, always) only while component is mounted.

```jsx
import React, { useState } from 'react';
import useMountedAsync from 'use-async-mounted';

/**
 * [compute] function call takes around 5 seconds.
 */
const SomeComponent = ({ compute, onCompute }) => {
  const [loading, setLoading] = useState(false);

  /**
   * In this case React will throw an error if component will be unmounted before async function
   * finish its work.
   */
  // const handleClick = async () => {
  //   try {
  //     const data = await compute();
  //     onCompute(data);
  //   } catch (ex) {
  //     console.error(ex);
  //   }
  //   setLoading(false);
  // };
  const handleClick = () => {
    setLoading(true);
  };

  /**
   * useMountedAsync hook takes a function, which should return [null] or async function
   * (Promise-like) call. Given function will be invoked synchronously.
   */
  useMountedAsync((callbacks) => {
    /**
     * [callbacks] object contains three callback functions: [success], [error], and [always].
     * Each function will accept another callback, wich will be invoked only in case component
     * still mounted.
     */
    const { success, error, always } = callbacks;

    if (!loading) {
      /**
       * You can return [null|undefined|false] if there is no need to do any async calls.
       */
      return null;
    }

    /**
     * These callbacks will be invoked only in case component still mounted
     */
    success((data) => {
      // In case of succes
      onCompute(data);
    });
    error((ex) => {
      // In case of error
      console.error(ex);
    });
    always(() => {
      // Always (after success or error)
      setLoading(false);
    });

    /**
     * Here is the place where you have to return your async function call. For example Promise
     * or fetch call:
     *  return new Promise((rs, rj) => {...});
     */
    return compute();
  });

  return (
    <div>
      <div style={{ display: !loading }}>Loading...</div>
      <button onClick={handleClick}>Compute</button>
    </div>
  );
};
```
