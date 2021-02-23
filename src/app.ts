import * as bitbank from 'node-bitbankcc';
import { confPri, confPub } from './config';

// instance
const privateApi = new bitbank.PrivateApi(confPri);
const publicApi = new bitbank.PublicApi(confPub);

//---------- configs ----------
// getPrice params
const mona: bitbank.GetTickerRequest = {
  pair: 'mona_jpy', // required
};

//order amount
let amount = ''; // initialize
const setAmount = async (jpy: number) => {
  const price = await publicApi.getTicker(mona);
  amount = String(jpy / Number(price.data.last));
  orderConfig.amount = amount;
  orderPayoff.amount = amount;
  console.log(`set amount:${orderConfig.amount}`);
};

//order params
const orderConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: amount, // required
  price: 0, // optional
  side: 'buy', // required
  type: 'limit', // required
};

const orderPayoff: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: amount, // required
  side: 'sell', // required
  type: 'market', // required
};
//initialize limit
const limit = {
  price: 0,
};

//---------- functions ----------

//指値注文を発注
const postOrder = async () => {
  const res = await privateApi.postOrder(orderConfig);
  console.log(res);
};

//成り売り
const payoff = async () => {
  const res = await privateApi.postOrder(orderPayoff);
  console.log(res);
};

// 注文価格を最終約定価格に設定
const setPrice = async () => {
  const price = await publicApi.getTicker(mona);
  orderConfig.price = Number(price.data.last);
  console.log(`set price: ${orderConfig.price}`);
};

// 最終約定価格 * 0.98 に損切りラインを設定
const setInitialLimit = async () => {
  const price = await publicApi.getTicker(mona);
  limit.price = Number(price.data.last) * 0.98;
  console.log(`set initial limit: ${limit.price}`);
};

const checkLimit = async () => {
  let counter = 1;
  // 最新の価格の一つ前の価格を保存するための一時変数
  let temp = orderConfig.price!;
  console.log('starting trail ...');
  // 1500ms ごとに実行
  const id = setInterval(async () => {
    console.log(`===== ${counter} =====`);
    //現在価格を取得
    const currentPrice = await publicApi.getTicker(mona);
    console.log({ currentPrice: currentPrice.data.last });
    const orderedPrice = orderConfig.price!;
    console.log({ orderedPrice });
    console.log(`{ max: ${temp} }`);
    const diff = Number(currentPrice.data.last) - temp;
    console.log({ diff });
    console.log({ limitPrice: limit.price });
    if (diff > 0) {
      //現在価格が上昇した時のみ実行
      temp += diff;
      limit.price += diff;
      console.log(`set limit : ${limit.price}`);
    }
    if (Number(currentPrice.data.last) <= limit.price) {
      //現在価格が損切りラインを下回った時に実行
      console.log('clear');
      clearInterval(id);
      payoff();
    }
    counter++;
  }, 1500);
};

const main = async () => {
  //JPY換算で注文数量を引数に指定
  await setAmount(100);
  await setPrice();
  await setInitialLimit();
  await postOrder();
  await checkLimit();
};

main();
