import * as bitbank from 'node-bitbankcc';
import dotenv from 'dotenv';

dotenv.config();
const env = process.env;

export const confPub: bitbank.ApiConfig = {
  endPoint: 'https://public.bitbank.cc', // required
  keepAlive: false, // optional, default false
  timeout: 3000, // optional, default 3000
};

export const confPri: bitbank.PrivateApiConfig = {
  endPoint: 'https://api.bitbank.cc/v1', // required
  apiKey: env.API_KEY!, // required
  apiSecret: env.SECRET_KEY!, // required
  keepAlive: false, // optional, default->false
  timeout: 3000, // optional, default->3000
};
