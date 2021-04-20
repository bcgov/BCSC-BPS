const signedAlgorithm = [
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
];

const encryptedAlgorithm = ['RSA-OAEP', 'RSA1_5'];

const encryptedEncoding = [
  'A256GCM',
  'A256CBC+HS512',
  'A192GCM',
  'A128GCM',
  'A128CBC-HS256',
  'A192CBC-HS384',
  'A256CBC-HS512',
  'A128CBC+HS256',
];

export { signedAlgorithm, encryptedAlgorithm, encryptedEncoding };
