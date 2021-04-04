//available pairs
const pairs = {
  btc: 'btc_jpy',
  eth: 'eth_jpy',
  xrp: 'xrp_jpy',
  ltc: 'ltc_jpy',
  bcc: 'bcc_jpy',
  xlm: 'xlm_jpy',
  bat: 'bat_jpy',
  qtum: 'qtum_jpy',
  mona: 'mona_jpy',
};

//comment out or delete when using the default value
const userConfig: {
  pair: string;
  orderAmount: number;
  orderPrice?: number;
  stopPrice?: number;
  stopPriceRatio?: number;
  timeout?: number;
} = {
  //pair
  pair: pairs.btc, //required

  //order amount
  orderAmount: 10000, //required [JPY]

  //order price (default: last price)
  orderPrice: 5000000, //optional [JPY]

  //stop price (If stopPrice is not set, stopPriceRatio is used by default.)
  stopPrice: 4900000, //optional [JPY]

  //deviation ratio between stop loss price and order price. If stopPrice is set, this value will be ignored. (default: 3)
  stopPriceRatio: 2, // optional [%]

  //timeout (default: 30)
  timeout: 60, //optional [sec]
};

export default userConfig;
