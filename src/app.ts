import * as bitbank from 'node-bitbankcc';
import { confPri, confPub } from './config';
const amount = '0.01';

// instance
const privateApi = new bitbank.PrivateApi(confPri);
const publicApi = new bitbank.PublicApi(confPub);

// get price
const mona: bitbank.GetTickerRequest = {
  pair: 'mona_jpy', // required
};

const getPrice = async () => {
  const price = await publicApi.getTicker(mona);
  console.log(price);
};

getPrice();

const orderConf: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: amount, // required
  price: 100, // optional
  side: 'buy', // required
  type: 'limit', // required
};
const postOrder = async () => {
  const res = await privateApi.postOrder(orderConf);
  console.log(res);
};

postOrder();
