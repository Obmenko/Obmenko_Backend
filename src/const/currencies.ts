import { CurrencyUnitEnum } from "../types/exchange";

export interface CurrencyDataItemWithWallet {
  title: string;
  wallet: string;
  unit: CurrencyUnitEnum;
  isBtc?: boolean,
  onlyTo?: boolean,
  reserve: number
}

export const CURRENCY_LIST: CurrencyDataItemWithWallet[] = [
  {
    title: 'Bitcoin BTC',
    wallet: 'bc1qr7fw4x2dt4lp3gjh427njfq2l8vcw5420sc08h',
    isBtc: true,
    unit: CurrencyUnitEnum.BTC,
    reserve: 6,
  },
  {
    title: 'Ethereum(ERC20)',
    wallet: '0x5B4a943Ad1A9C59cB00DB5Eac15f2f1b684EfA29',
    isBtc: true,
    unit: CurrencyUnitEnum.ETH,
    reserve: 118,
  },
  {
    title: 'Ripple',
    wallet: 'rNNxf7j7HVhhdnkMDERsq9TNhhgSSpfakS',
    isBtc: true,
    unit: CurrencyUnitEnum.XRP,
    reserve: 120000,
  },
  {
    title: 'Binance Chain',
    wallet: 'bnb17wt70r4clut6xle4my7l8q90ae2yd7efckkw3p',
    isBtc: true,
    unit: CurrencyUnitEnum.BNB,
    reserve: 2521,
  },
  {
    title: 'Litecoin',
    wallet: 'ltc1ql4me2skxlgn82tmy0v2gn6gt80dphw8hk57q4a',
    isBtc: true,
    unit: CurrencyUnitEnum.LTC,
    reserve: 628,
  },
  {
    title: 'Polygon',
    wallet: '0x5B4a943Ad1A9C59cB00DB5Eac15f2f1b684EfA29',
    isBtc: true,
    unit: CurrencyUnitEnum.MATIC,
    reserve: 10000000,
  },
  {
    title: 'Stellar lumens',
    wallet: 'GD4AUYERLCQMJRWDO3S2BZAKLA2NGAVKDTRKQQPZXM77SMDV4HBI3OIZ',
    isBtc: true,
    unit: CurrencyUnitEnum.XLM,
    reserve: 80000,
  },
  {
    title: 'Tron (TRC20)',
    wallet: 'TNjYBmHTUXPVapnATtiwFDiuHgZczyH5Nz',
    isBtc: true,
    unit: CurrencyUnitEnum.TRX,
    reserve: 7300000,
  },
  {
    title: 'Cosmos',
    wallet: 'cosmos1kzz8vzue5tvnt07v5yz57606kutju6mjfctmjt',
    isBtc: true,
    unit: CurrencyUnitEnum.ATOM,
    reserve: 6452,
  },
  {
    title: 'Dash',
    wallet: 'Xm4Z6CyDW9tK6g11XpLCNMfVdQWdgVLBsf',
    isBtc: true,
    unit: CurrencyUnitEnum.DASH,
    reserve: 1221,
  },

  {
    title: 'Dogecoin',
    wallet: 'DKvKLoD8kwSBX5JPmQ7sjBgqUScppBKKNP',
    isBtc: true,
    unit: CurrencyUnitEnum.DOGE,
    reserve: 8000000,
  },
  {
    title: 'Waves',
    wallet: '3PNYAhpEUqj58L1P7Zj5fkU9UAd3yPjNyYx',
    isBtc: true,
    unit: CurrencyUnitEnum.WAVES,
    reserve: 7400,
  },
  {
    title: 'Solana',
    wallet: '7Hn42XExQ9WJtnQfkttJFx1SjhuqFrNccMpBuwkoHF77',
    isBtc: true,
    unit: CurrencyUnitEnum.SOL,
    reserve: 4500,
  },
  {
    title: 'USDT (Tether)',
    wallet: 'TNjYBmHTUXPVapnATtiwFDiuHgZczyH5Nz',
    isBtc: true,
    unit: CurrencyUnitEnum.USDT,
    reserve: 16200,
  },
  {
    title: 'Sberbank RUB',
    wallet: 'RUB',
    unit: CurrencyUnitEnum.RUB,
    reserve: 10000000,
    onlyTo: true,
  },
];
