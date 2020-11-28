# [use-mounted-async](https://github.com/thenoiro/use-async-mounted.hook) - React hook which allows to run async action callbacks (succes, error, always) only in case component still mounted.

## Simple usage:
```jsx
useMountedAsync((callbacks) => {
    // This function will be invoked each time on component re-render. It should return
    // null, or async function call (instance of Promise).

    if (!condition) {
        // Means it is not the time to run async function.
        return null;
    }
    callbacks.success((data) => {
        // This callback will be invoked after async function. And only in case component still mounted.
        console.log(data);
    });
    return someAsyncFunction();
});
```

## Usage case:
### Typical problem:
This is an example of code, where the problem could appear. After submit action we want to make an async call to backend, but the user could leave the page. React will throw an error after trying to run callback function when the component not mounted anymore.
```jsx
import React, { useState } from 'react';
import RegisterForm from './RegisterForm';
import HomeLink from '../HomLink';
import { registerUrl } from '../constants/urls';
import http from '../common/http';

const RegisterPage = ({ onRegisterSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (formData) => {
        setLoading(true);

        try {
            // This function call could take around 5 seconds for example:
            const result = await http.post(registerUrl, formData);
            // The code below invoked when the component may be unmounted, because the user left the page.
            onRegisterSuccess(result);
        } catch (ex) {
            console.error(ex);
        }
        setLoading(false);
    };
    return (
        <RegisterForm
            onSubmit={handleSubmit}
            loading={loading}
        />
        <HomeLink />
    );
}
```
Using **`useMountedAsync`** hook this code can be rewrited to avoid such problem:
```jsx
import React, { useState } from 'react';
import useMountedAsync from 'use-mounted-async';
import RegisterForm from './RegisterForm';
import HomeLink from '../HomLink';
import { registerUrl } from '../constants/urls';
import http from '../common/http';

const RegisterPage = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState(null);

    const handleSubmit = (formData) => {
        // Now we just set up the state to fire submit flow:
        setFormData(formData);
    };
    useMountedAsync((callbacks) => {
        if (!formData) {
            // No any formData to send. Do not run http call.
            return null;
        }
        callbacks.always(() => {
            setFormData(null); 
        });
        callbacks.success((result) => {
            onRegisterSuccess(result);
        });
        callbacks.error((ex) => {
            console.error(ex);
        });
        
        // This is the place where you have to return your async function call.
        // According to specification async function call always returns instance of Promise.
        return http.post(registerUrl, formData);
    });

    return (
        <RegisterForm
            onSubmit={handleSubmit}
            loading={formData !== null}
        />
        <HomeLink />
    );
}
```

## Callbacks:
**`useMountedAsync`** hook takes your function wich will be invoked with **`callbacks`** object. This object contains 3 functions:
+ **`callbacks.always`**
+ **`callbacks.success`**
+ **`callbacks.error`**

These functions take your callback wich will be invoked after your async function call, and **only** in case component still mounted.
```jsx
useMountedAsync(({ always, success, error }) => {
    ...
    always(() => {
        // This one will be invoked first, before [success] and [error] callbacks
        ...
    });
    success((data) => {
        // Will return your async function call result (if presented);
        ...
    });
    error((ex) => {
        // Will return your async function exception (if presented);
        ...
    });
    ...
});
```

## Dependencies
You can also specify dependencies array.
If specified, **`useMountedAsync`** callback will be invoked only in case these variables have changed.
If empty array passed, **`useMountedAsync`** callback will be invoked only once.
If no dependencies passed, **`useMountedAsync`** callback will be invoked each time on component re-render.
```jsx
useMountedAsync((callbacks) => {
    // Works only if <formData> has changed.
    ...
}, [formData]);
```