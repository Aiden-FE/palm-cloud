import { getEnvConfig } from '@app/common';
import { Injectable } from '@nestjs/common';
import { SDK as CasdoorSDK } from 'casdoor-nodejs-sdk';
import * as cheerio from 'cheerio';

export const casdoorServerSDK = new CasdoorSDK({
  endpoint: 'https://aidencasdoor.cpolar.cn',
  clientId: getEnvConfig('CASDOOR_CLIENT_ID'),
  orgName: 'compass',
  appName: 'magic-utils',
  clientSecret: getEnvConfig('CASDOOR_CLIENT_SECRET'),
  certificate: getEnvConfig('CASDOOR_CERTIFICATE'),
});

@Injectable()
export class OpenService {
  getLoginUrl(redirectUri: string) {
    return casdoorServerSDK.getSignInUrl(redirectUri);
  }

  async getAuthToken(code: string) {
    return casdoorServerSDK.getAuthToken(code);
  }

  getTargetUrlText(targetUrl: string) {
    return fetch(targetUrl)
      .then((res) => {
        return res.text();
      })
      .then((htmlText) => {
        return cheerio.load(htmlText).text();
      });
  }
}
