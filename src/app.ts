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

//order params
const buyConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: '', // required
  price: 0, // optional
  side: 'buy', // required
  type: 'limit', // required
};

const sellConfig: bitbank.OrderRequest = {
  pair: 'mona_jpy', // required
  amount: '', // required
  side: 'sell', // required
  type: 'market', // required
};

//initialize stop price
const stop = {
  price: 0,
};

//---------- functions ----------
//get JPY assets
const getAssets = async () => {
  const res = await privateApi.getAssets();
  //return JPY amount
  return Number(res.data.assets[0].onhand_amount);
};

//set order amount
const setAmount = async (jpy: number) => {
  const price = await publicApi.getTicker(mona);
  const amount = String(jpy / Number(price.data.last));
  buyConfig.amount = amount;
  sellConfig.amount = amount;
  console.log(`order amount: ${buyConfig.amount}`);
};

//post limit order (buy)
const postOrder = async () => {
  const res = await privateApi.postOrder(buyConfig);
  //return order object
  const orderInfo: bitbank.GetOrderRequest = {
    order_id: res.data.order_id,
    pair: 'mona_jpy',
  };
  return orderInfo;
};

//get order info
const getOrderInfo = async (config: { order_id: number; pair: string }) => {
  try {
    const res = await privateApi.getOrder(config);
    return res;
  } catch (ignored) {
    //do nothing
    //errors (Error:20001, Error:50009) may occur due to the API
  }
};

//waiting for transaction -> start trailing
const checkOrderStatus = async (
  timeout: number = 30,
  config: { order_id: number; pair: string },
  callback: () => Promise<void>
) => {
  //counter for timeout
  let counter = 0;
  const maxCount = (timeout * 1000) / 1500; // timeout(ms)/interval(ms)
  const spinner = ora(`waiting for transaction: timeout ${timeout} sec`);
  spinner.start();
  const id = await setInterval(async () => {
    const status = await getOrderInfo(config);
    counter++;
    //timeout, cancel order
    if (counter > maxCount) {
      spinner.fail('transaction timeout: order cancelled');
      await privateApi.cancelOrder(config);
      clearInterval(id);
    }
    //when transaction completed
    if (status!.data.status === 'FULLY_FILLED') {
      spinner.succeed('transaction completed');
      clearInterval(id);
      await callback();
    }
  }, 1500);
};

//post sell order (market)
const payoff = async () => {
  const res = await privateApi.postOrder(sellConfig);
  console.log(res);
};

//set order price (default: last price)
const setPrice = async (arg?: number) => {
  const price = await publicApi.getTicker(mona);
  buyConfig.price = arg || Number(price.data.last);
  console.log(`order price: ${buyConfig.price}`);
};

//set initial stop price
const setInitialStop = async () => {
  stop.price = buyConfig.price! * 0.98;
  console.log(`stop price: ${stop.price}`);
};

//check if current price has reached the stop price
const checkStop = async () => {
  let counter = 1;
  const interval = 1500;
  const startTime = dayjs().format('YYYY-MM-DD-HH:mm:ss');
  //store price status
  let temp = buyConfig.price!;
  console.log('start trailing ...');
  const id = setInterval(async () => {
    const currentTime = dayjs().format('YYYY-MM-DD-HH:mm:ss');
    console.log(
      `========== time: ${dayjs(currentTime).diff(
        startTime,
        'second'
      )} s ==========`
    );
    console.log({ currentTime });
    //get order price
    const orderedPrice = buyConfig.price!;
    console.log({ orderedPrice });
    const currentPrice = await publicApi.getTicker(mona);
    console.log({ currentPrice: Number(currentPrice.data.last) });
    //highest value from start tracking
    console.log({ highestPrice: temp });
    //diff from latest price
    const diff = Number(currentPrice.data.last) - temp;
    console.log({ diff });
    console.log({ stopPrice: stop.price });
    //estimated profit
    const profit =
      Number(buyConfig.amount) * stop.price -
      Number(buyConfig.amount) * buyConfig.price!;
    console.log(`{ estimated profit: ${profit} yen}`);
    console.log();
    //when price rises
    if (diff > 0) {
      temp += diff;
      stop.price += diff;
      console.log(`set stop : ${stop.price}`);
    }
    //when current price has reached the stop price
    if (Number(currentPrice.data.last) <= stop.price) {
      console.log('done');
      clearInterval(id);
      payoff();
    }
    counter++;
  }, interval);
};

const main = async () => {
  //timeout sec (default: 30sec)
  const timeout = 10;
  //manual pricing (default: last price)
  const price = 220;
  //set amount(JPY)
  const amount = 100;

  // const before = await getAssets();
  await setAmount(amount);
  await setPrice(price);
  await setInitialStop();
  const config = await postOrder();
  await checkOrderStatus(timeout, config, checkStop);
  // const after = await getAssets();
  // const profit = (await after) - before;
  // console.log({ profit });
  // console.log({ before, after });
};

main();
