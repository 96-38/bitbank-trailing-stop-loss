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
  pair: pairs.btc, //required

  //order amount
  amount: 10000, //required [JPY]

  //manual pricing (default: last price)
  price: 5000000, //optional [JPY]

  //timeout (default: 30)
  timeout: 60, //optional [sec]
};

export default userConfig;
