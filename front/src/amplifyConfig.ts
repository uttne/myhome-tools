import {Amplify} from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_cognito_user_pool_id,
      userPoolClientId: import.meta.env.VITE_cognito_user_pool_web_client_id,
      // optional settings
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true, // allow e‑mail sign‑in
      },
      // identityPoolId: 'us‑east‑1:xxxxxxxx‑xxxx‑xxxx‑xxxx‑xxxxxxxxxxxx', // (optional)
    },
  },
});