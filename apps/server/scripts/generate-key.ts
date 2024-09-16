import * as crypto from 'node:crypto';

function main() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
  const salt = crypto.randomBytes(16).toString('hex');

  console.log('Private Key: ', privateKey);
  console.log('Public Key: ', publicKey);
  console.log('Salt: ', salt);
}

main();
