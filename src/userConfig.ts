//available pairs
const pair = {
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

const userConfig = {
  //pair
  pair: pair.mona,
  //manual pricing (default: last price)
  price: 200, //JPY
  //order amount
  amount: 1000, //JPY
  //timeout sec (default: 30)
  timeout: 10, //sec
};

export default userConfig;
