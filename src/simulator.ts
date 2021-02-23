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

// 一定時間毎に現在価格が損切りラインに達していないか判定
const checkLimit = async () => {
  let counter = 1;
  const interval = 1500;
  // 最新の価格の一つ前の価格を保存するための一時変数
  let temp = orderConfig.price!;
  console.log('starting trail ...');
  // 1500ms ごとに実行
  const id = setInterval(async () => {
    console.log(`========== time: ${counter * (interval / 1000)} s ==========`);
    //現在価格を取得
    const orderedPrice = orderConfig.price!;
    console.log({ orderedPrice });
    const currentPrice = await publicApi.getTicker(mona);
    console.log({ currentPrice: Number(currentPrice.data.last) });
    console.log({ highestPrice: temp });
    const diff = Number(currentPrice.data.last) - temp;
    console.log({ diff });
    console.log({ limitPrice: limit.price });
    //利益算出
    const profit =
      Number(orderConfig.amount) * limit.price -
      Number(orderConfig.amount) * orderConfig.price!;
    console.log(`{ profit: ${profit} yen}`);
    if (diff > 0) {
      //現在価格が上昇した時のみ実行
      temp += diff;
      limit.price += diff;
      console.log(`set limit : ${limit.price}`);
    }
    if (Number(currentPrice.data.last) <= limit.price) {
      //現在価格が損切りラインを下回った時のみ実行
      console.log('clear');
      clearInterval(id);
    }
    counter++;
  }, interval);
};

const main = async () => {
  //JPY換算で注文数量を引数に指定
  await setAmount(10000);
  await setPrice();
  await setInitialLimit();
  await checkLimit();
};

main();
