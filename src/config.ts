import * as bitbank from 'node-bitbankcc';
import dotenv from 'dotenv';

dotenv.config();
const env = process.env;

//for public api
export const confPub: bitbank.ApiConfig = {
  endPoint: 'https://public.bitbank.cc', // required
  keepAlive: false, // optional, default false
  timeout: 3000, // optional, default 3000
};

//for private api
export const confPri: bitbank.PrivateApiConfig = {
  endPoint: 'https://api.bitbank.cc/v1', // required
  apiKey: env.API_KEY!, // required
  apiSecret: env.SECRET_KEY!, // required
  keepAlive: false, // optional, default->false
  timeout: 3000, // optional, default->3000
};

// getPrice params
export const pair: bitbank.GetTickerRequest = {
  pair: 'mona_jpy', // required
};

//order params
export const buyConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: '', // required
  price: 0, // optional
  side: 'buy', // required
  type: 'limit', // required
};

export const sellConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: '', // required
  side: 'sell', // required
  type: 'market', // required
};

//initialize stop price
export const stop = {
  price: 0,
};

export const userConfig = {
  //timeout sec (default: 30sec)
  timeout: 5,
  //manual pricing (default: last price)
  price: 200,
  //set amount(JPY)
  amount: 10,
};
