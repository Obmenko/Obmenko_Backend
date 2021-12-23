import {Telegraf, Telegraf as TelegrafClass} from 'telegraf'
import PROJECT_CONFIG from '../const/project';
import { ICreateRequest, RequestType } from '../models/request';
import { User } from '../models/user';

class Telegram {
  static bot: Telegraf;
  
  static init(botToken: string) {
    if (!botToken) throw new Error('No telegram bot token!');
    this.bot = new TelegrafClass(botToken)
  }

  static sendRequestMessage(data: RequestType, user: User) {
    const text = `Exchange #${data._id}\n\nFrom: ${data.countFrom} ${data.coinFrom}\nTo: ${data.countTo} ${data.coinTo}\nCourse: 1${data.coinFrom} = ${+data.countTo / +data.countFrom} ${data.coinTo}\n\n\nContacts: \n\nFullname: ${user.data.fullname}\nEmail: ${user.data.email}\nPhone: ${user.data.phone}\nWallet/card: ${data.card || data.wallet}\nTelegram: ${user.data.telegram ? `${user.data.telegram[0] === '@' ? '' : '@'}${user.data.telegram}` : `N/A`}`
    return this.bot.telegram.sendMessage(PROJECT_CONFIG.TELEGRAM_CHAT_ID, text)
  } 
}

export default Telegram;