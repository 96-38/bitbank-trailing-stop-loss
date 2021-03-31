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
  amount: number;
  price?: number;
  timeout?: number;
} = {
  //pair
  pair: pairs.mona, //required

  //order amount
  amount: 100, //required [JPY]

  //manual pricing (default: last price)
  price: 220, //optional [JPY]

  // timeout sec (default: 30)
  timeout: 100, //optional [sec]
};

export default userConfig;
