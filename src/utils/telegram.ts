import {Telegraf, Telegraf as TelegrafClass} from 'telegraf'
import PROJECT_CONFIG from '../const/project';
import { ICreateRequest, RequestType } from '../models/request';
import { User } from '../models/user';
import { CurrencyUnitEnum } from '../types/exchange';


type ITelegramRequest = {
  _id: string,
  coinFrom: CurrencyUnitEnum,
  coinTo: CurrencyUnitEnum,
  countTo: string | number,
  countFrom: string | number,
  createdAt?: number;
  email: string,
  phone: string | number,
  wallet?: string,
  card?: string
}

class Telegram {
  static bot: Telegraf;
  
  static init(botToken: string) {
    if (!botToken) throw new Error('No telegram bot token!');
    this.bot = new TelegrafClass(botToken)
  }

  static sendRequestMessage(data: ITelegramRequest) {
    const text = `Exchange #${data._id}\n\nFrom: ${data.countFrom} ${data.coinFrom}\nTo: ${data.countTo} ${data.coinTo}\nCourse: 1${data.coinFrom} = ${+data.countTo / +data.countFrom} ${data.coinTo}\n\n\nContacts: \n\nEmail: ${data.email}\nPhone: ${data.phone}\nWallet/card: ${data.card || data.wallet}`

    return this.bot.telegram.sendMessage(PROJECT_CONFIG.TELEGRAM_CHAT_ID, text)
  } 
}

export default Telegram;