<h1 align="center">📈 bitbank trailing stop-loss</h1>

<p align="center">
Provides a dynamic stop-loss that automatically adjusts as the price increases.
</p>
<p align="center">
  <a href="https://github.com/96-38/bitbank-trailing-stop/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" />
  </a>
</p>
<b>
Disclaimer : May contain inaccuracies, please use it at your own risk.
</b>

## Requirements

- Node.js

## Installation

### Clone the repository

```bash
$ git clone https://github.com/96-38/bitbank-trailing-stop
```

### Install dependencies

```bash
$ cd bitbank-trailing-stop
$ yarn install # or npm install
```

## Configure API keys

How to obtain an API key, please refer to the [official guide](https://support.bitbank.cc/hc/ja/articles/360036234574-API%E3%82%AD%E3%83%BC%E3%81%AE%E7%99%BA%E8%A1%8C%E3%81%A8API%E4%BB%95%E6%A7%98%E3%81%AE%E7%A2%BA%E8%AA%8D%E6%96%B9%E6%B3%95#h_62a68a59-b459-421e-8c18-335677d1a0a2).

Then create a .env file at the root directory of the application and add API keys to it.

```
API_KEY = 'YOUR_API_KEY'
SECRET_KEY = 'YOUR_SECRET_KEY'
```

## Configure Order Information

Edit src/userConfig.ts
- Example

```typescript
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
```

- pair : Please select from available pairs
- amount : Please set the value in Japanese yen equivalent.
- price : Please set the order price in Japanese yen. (by default, last transaction price.)
- timeout : Please set time to wait for the transaction to be completed (by default, 30 seconds)

If you want to use the default value, comment out the corresponding line.

## Running

### Usage

```bash
$ yarn start
```

## How it works

Submit the order according to the settings and set the initial stop-loss at 2% below the order price. (I will likely add an option later to specify stop-loss price.)

If the transaction is completed within the time specified in the timeout, the trailing stop process will be initiated. (If the transaction is not completed in time, the order is cancelled.)

As the price goes higher, the stop-loss will get dragged with it.Once the price crosses the stop-loss price, a sell order is executed.

### Important note

Please make sure you have available Japanese yen before running the application.

Partial transaction completion is not supported at this time, so we recommend that you do not make a large amount of orders at once.
