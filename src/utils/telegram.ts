import {Telegraf, Telegraf as TelegrafClass} from 'telegraf'
import PROJECT_CONFIG from '../const/project';
import { ICreateRequest } from '../controllers/request';

class Telegram {
  static bot: Telegraf;
  
  static init(botToken: string) {
    if (!botToken) throw new Error('No telegram bot token!');
    this.bot = new TelegrafClass(botToken)
  }

  static sendRequestMessage(data: ICreateRequest) {
    const text = `Exchange\n\nFrom: ${data.from} ${data.fromSelected.unit}\nTo: ${data.to} ${data.toSelected.unit}\nCourse: 1${data.fromSelected.unit} = ${data.course.rate} ${data.toSelected.unit} (counted with fee ${data.course.feePercent}%)\n\n\nContacts: \n\nFullname: ${data.fullname}\nEmail: ${data.email}\nPhone: ${data.phone}\n${data.toSelected.isBtc ? `Wallet: ${data.wallet}` : `Card: ${data.card}`}\nTelegram: ${data.telegram ? `${data.telegram[0] === '@' ? '' : '@'}${data.telegram}` : `N/A`}`
    console.log(PROJECT_CONFIG.TELEGRAM_CHAT_ID)
    this.bot.telegram.sendMessage(PROJECT_CONFIG.TELEGRAM_CHAT_ID, text)
  } 
}

export default Telegram;