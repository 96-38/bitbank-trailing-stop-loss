import * as bitbank from 'node-bitbankcc';
import { confPri, confPub, pair, buyConfig, sellConfig, stop } from './params';
import userConfig from './userConfig';
import dayjs from 'dayjs';
import ora from 'ora';
const logUpdate = require('log-update');

// instance
const privateApi = new bitbank.PrivateApi(confPri);
const publicApi = new bitbank.PublicApi(confPub);

//get JPY assets
const getAssets = async () => {
  try {
    const res = await privateApi.getAssets();
    //return JPY amount
    return Number(res.data.assets[0].onhand_amount);
  } catch (ignored) {}
};

//set order amount
const setAmount = async (jpy: number) => {
  try {
    const price = await publicApi.getTicker(pair);
    const amount = String(jpy / Number(price.data.last));
    buyConfig.amount = amount;
    sellConfig.amount = amount;
    console.log(`order amount: ${Math.floor(Number(amount) * 10000) / 10000}`);
  } catch (ignored) {
    //do nothing
    //timeout error may occur due to axios
  }
};

//post limit order (buy)
const postOrder = async () => {
  try {
    const res = await privateApi.postOrder(buyConfig);
    //return order object
    const orderInfo: bitbank.GetOrderRequest = {
      order_id: res.data.order_id,
      pair: userConfig.pair,
    };
    return orderInfo;
  } catch (ignored) {}
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
  orderInfo: { order_id: number; pair: string },
  callback: () => Promise<void>
) => {
  try {
    //counter for timeout
    let counter = 0;
    const maxCount = (timeout * 1000) / 1500; // timeout(ms)/interval(ms)
    const spinner = ora(`waiting for transaction: timeout in ${timeout} sec`);
    spinner.start();
    const id = await setInterval(async () => {
      const status = await getOrderInfo(orderInfo);
      counter++;
      //timeout, cancel order
      if (counter > maxCount) {
        spinner.fail('transaction timeout: order cancelled');
        await privateApi.cancelOrder(orderInfo);
        clearInterval(id);
      }
      //when transaction completed
      if (status!.data.status === 'FULLY_FILLED') {
        spinner.succeed('transaction completed');
        clearInterval(id);
        await callback();
      }
    }, 1500);
  } catch (ignored) {}
};

//post sell order (market)
const payoff = async () => {
  try {
    const res = await privateApi.postOrder(sellConfig);
    console.log(res);
  } catch (ignored) {}
};

//set order price (default: last price)
const setPrice = async (arg?: number) => {
  try {
    const price = await publicApi.getTicker(pair);
    buyConfig.price = arg || Number(price.data.last);
    console.log(`order price: ${buyConfig.price}`);
  } catch (ignored) {}
};

//set initial stop price
const setInitialStop = async () => {
  try {
    stop.price = buyConfig.price! * 0.98;
    console.log(`stop price: ${stop.price}`);
  } catch (ignored) {}
};

//check if current price has reached the stop price
const checkStop = async () => {
  try {
    let counter = 1;
    const interval = 1000;
    const startTime = dayjs().format('YYYY-MM-DD-HH:mm:ss');
    //store price status
    //highest price from start tracking
    let temp = buyConfig.price!;
    console.log('start trailing ...');
    const id = setInterval(async () => {
      const currentTime = dayjs().format('YYYY-MM-DD-HH:mm:ss');
      //get order price
      const orderedPrice = buyConfig.price!;
      const currentPrice = await publicApi.getTicker(pair);
      //diff from latest price
      const diff = Number(currentPrice.data.last) - temp;
      //estimated profit
      const profit =
        Number(buyConfig.amount) * stop.price -
        Number(buyConfig.amount) * buyConfig.price!;
      // const log = {
      //   'current time': currentTime,
      //   'ordered price': `${orderedPrice} yen`,
      //   'current price': `${Number(currentPrice.data.last)} yen`,
      //   'highest price': `${temp} yen`,
      //   'stop price': `${Math.round(stop.price * 1000) / 1000} yen`,
      //   'estimated profit': `${Math.round(profit * 1000) / 1000} yen`,
      // };
      logUpdate(
        `\ncurrent time: ${currentTime}
elapsed time: ${counter} sec
      \nordered price: ${orderedPrice}
current price: ${Number(currentPrice.data.last)}
   stop price: ${Math.round(stop.price * 1000) / 1000}
highest price: ${temp}
      \nestimated profit: ${Math.floor(profit * 1000) / 1000} yen`
      );
      //when price rises
      if (diff > 0) {
        temp += diff;
        stop.price += diff;
      }
      //when current price has reached the stop price
      if (Number(currentPrice.data.last) <= stop.price) {
        clearInterval(id);
        payoff();
      }
      counter++;
    }, interval);
  } catch (ignored) {}
};

const main = async () => {
  try {
    await setAmount(userConfig.amount);
    await setPrice(userConfig.price);
    await setInitialStop();
    const orderInfo = await postOrder();
    await checkOrderStatus(userConfig.timeout, orderInfo!, checkStop);
  } catch (ignored) {}
};

main();
