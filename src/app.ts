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
};

//order params
const orderConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: amount, // required
  price: 0, // optional
  side: 'buy', // required
  type: 'limit', // required
};

//initialize limit
const limit = {
  price: 0,
};

//---------- functions ----------
const postOrder = async () => {
  const res = await privateApi.postOrder(orderConfig);
  // console.log(res);
};

const setPrice = async () => {
  const price = await publicApi.getTicker(mona);
  orderConfig.price = Number(price.data.last);
  // console.log(orderConfig);
};

const setInitialLimit = async () => {
  const price = await publicApi.getTicker(mona);
  //最終約定価格 * 0.98 に損切りラインを設定
  limit.price = Number(price.data.last) * 0.98;
  console.log(`set initial limit : ${limit.price}`);
};

const checkLimit = async () => {
  let conter = 0;
  //注文価格を変数に保存
  //最新の価格の一つ前の価格を保存するための一時変数
  let temp = orderConfig.price!;
  const id = setInterval(async () => {
    //現在価格を取得
    const currentPrice = await publicApi.getTicker(mona);
    console.log({ currentPrice: currentPrice.data.last });
    const orderedPrice = orderConfig.price!;
    console.log({ orderedPrice });
    console.log({ temp });
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
    }
    console.log(conter++);
  }, 1500);
};

const main = async () => {
  await setAmount(100);
  await console.log(`orederAmount:${orderConfig.amount}`);
  await setPrice();
  await setInitialLimit();
  // await checkLimit();
  // await postOrder();
};

main();
