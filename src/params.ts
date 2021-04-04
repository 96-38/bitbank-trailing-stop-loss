import * as bitbank from 'node-bitbankcc';
import dotenv from 'dotenv';
import userConfig from './userConfig';

dotenv.config();
const env = process.env;

//for public api
export const confPub: bitbank.ApiConfig = {
  endPoint: 'https://public.bitbank.cc', // required
  keepAlive: true, // optional, default false
  timeout: 10000, // optional, default 3000
};

//for private api
export const confPri: bitbank.PrivateApiConfig = {
  endPoint: 'https://api.bitbank.cc/v1', // required
  apiKey: env.API_KEY!, // required
  apiSecret: env.SECRET_KEY!, // required
  keepAlive: true, // optional, default false
  timeout: 10000, // optional, default 3000
};

// getPrice params
export const pair: bitbank.GetTickerRequest = {
  pair: userConfig.pair, // required
};

//order params
export const buyConfig: bitbank.OrderRequest = {
  pair: userConfig.pair, // required
  amount: '', // required
  price: 0, // optional
  side: 'buy', // required
  type: 'limit', // required
};

export const sellConfig: bitbank.OrderRequest = {
  pair: userConfig.pair, // required
  amount: '', // required
  side: 'sell', // required
  type: 'market', // required
};

//initialize stop price
export const stop = {
  price: 0,
};
