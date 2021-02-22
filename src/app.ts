import * as bitbank from 'node-bitbankcc';
import { confPri, confPub } from './config';

// instance
const privateApi = new bitbank.PrivateApi(confPri);
const publicApi = new bitbank.PublicApi(confPub);

//get price
const params: bitbank.GetTickerRequest = {
  pair: 'mona_jpy', // required
};

publicApi.getTicker(params).then((res) => {
  console.log(res);
});

//get asset
privateApi.getAssets().then((res) => {
  console.log(res.data.assets[0]);
});
