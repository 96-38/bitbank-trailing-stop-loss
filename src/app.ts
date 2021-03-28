import * as bitbank from 'node-bitbankcc';
import { confPri, confPub } from './config';
import dayjs from 'dayjs';
import ora from 'ora';

// instance
const privateApi = new bitbank.PrivateApi(confPri);
const publicApi = new bitbank.PublicApi(confPub);

//---------- configs ----------
// getPrice params
const mona: bitbank.GetTickerRequest = {
  pair: 'mona_jpy', // required
};

//set order amount
let amount = ''; // initialize
const setAmount = async (jpy: number) => {
  const price = await publicApi.getTicker(mona);
  amount = String(jpy / Number(price.data.last));
  buyConfig.amount = amount;
  sellConfig.amount = amount;
  console.log(`order amount: ${buyConfig.amount}`);
};

//order params
const buyConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: amount, // required
  price: 0, // optional
  side: 'buy', // required
  type: 'limit', // required
};

const sellConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: amount, // required
  side: 'sell', // required
  type: 'market', // required
};

//initialize Stop
const stop = {
  price: 0,
};

//---------- functions ----------
//JPY資産を取得
const getAssets = async () => {
  const res = await privateApi.getAssets();
  //return JPY amount
  return Number(res.data.assets[0].onhand_amount);
};

//指値注文を発注
const postOrder = async () => {
  const res = await privateApi.postOrder(buyConfig);
  //注文情報を参照する際に必要なオブジェクトを return
  const orderInfo: bitbank.GetOrderRequest = {
    order_id: res.data.order_id,
    pair: 'mona_jpy',
  };
  return orderInfo;
};

//注文情報を取得
const getOrderInfo = async (config: { order_id: number; pair: string }) => {
  const res = await privateApi.getOrder(config);
  return res;
};

//約定を判定して完了するまで待機 → トレーリングストップ処理を開始
const checkOrderStatus = async (
  config: { order_id: number; pair: string },
  callback: () => Promise<void>
) => {
  const spinner = ora('waiting for transaction');
  spinner.start();
  const id = await setInterval(async () => {
    const status = await getOrderInfo(config);
    if (status.data.status === 'FULLY_FILLED') {
      spinner.succeed('transaction completed');
      clearInterval(id);
      await callback();
    }
  }, 1500);
};

//成り売り
const payoff = async () => {
  const res = await privateApi.postOrder(sellConfig);
  console.log(res);
};

// 注文価格を最終約定価格に設定
const setPrice = async () => {
  const price = await publicApi.getTicker(mona);
  buyConfig.price = Number(price.data.last);
  console.log(`order price: ${buyConfig.price}`);
};

// 最終約定価格 * 0.98 に損切りラインを設定
const setInitialStop = async () => {
  const price = await publicApi.getTicker(mona);
  stop.price = Number(price.data.last) * 0.98;
  console.log(`stop price: ${stop.price}`);
};

// 一定時間毎に現在価格が損切りラインに達していないか判定
const checkStop = async () => {
  let counter = 1;
  const interval = 1500;
  //開始時刻
  const startTime = dayjs().format('YYYY-MM-DD-HH:mm:ss');
  // 価格の状態を保存するための変数
  let temp = buyConfig.price!;
  console.log('starting trail ...');
  // 1500ms ごとに実行
  const id = setInterval(async () => {
    //現在時刻
    const currentTime = dayjs().format('YYYY-MM-DD-HH:mm:ss');
    console.log(
      `========== time: ${dayjs(currentTime).diff(
        startTime,
        'second'
      )} s ==========`
    );
    console.log({ currentTime });
    //注文価格を取得
    const orderedPrice = buyConfig.price!;
    console.log({ orderedPrice });
    const currentPrice = await publicApi.getTicker(mona);
    console.log({ currentPrice: Number(currentPrice.data.last) });
    //追従開始から現在までの最高値
    console.log({ highestPrice: temp });
    //変動幅算出
    const diff = Number(currentPrice.data.last) - temp;
    console.log({ diff });
    console.log({ stopPrice: stop.price });
    //利益算出
    const profit =
      Number(buyConfig.amount) * stop.price -
      Number(buyConfig.amount) * buyConfig.price!;
    console.log(`{ estimated profit: ${profit} yen}`);
    console.log();
    if (diff > 0) {
      //現在価格が上昇した時のみ実行
      temp += diff;
      stop.price += diff;
      console.log(`set stop : ${stop.price}`);
    }
    if (Number(currentPrice.data.last) <= stop.price) {
      //現在価格が損切りラインを下回った時のみ実行
      console.log('done');
      clearInterval(id);
      payoff();
    }
    counter++;
  }, interval);
};

const main = async () => {
  //JPY換算で注文数量を引数に指定
  // const before = await getAssets();
  await setAmount(100);
  await setPrice();
  await setInitialStop();
  const config = await postOrder();
  await checkOrderStatus(config, checkStop);
  // const after = await getAssets();
  // const profit = (await after) - before;
  // console.log({ profit });
  // console.log({ before, after });
};

main();
