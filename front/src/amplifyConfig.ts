import {Amplify} from 'aws-amplify';


// Amplify.configure({
//   Auth: {
//     Cognito: {
//       userPoolId: 'ap-northeast-1_OrCE4puWF',
//       userPoolClientId: '3mhljvrsf6cnuleinscd23atda',
//       identityPoolId: ""
//     }
//   }
// });

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      // optional settings
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true, // allow e‑mail sign‑in
      },
      // identityPoolId: 'us‑east‑1:xxxxxxxx‑xxxx‑xxxx‑xxxx‑xxxxxxxxxxxx', // (optional)
    },
  },
});