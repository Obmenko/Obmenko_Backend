import './utils/dotenv'
import express from 'express';
import requestRouter from './controllers/request';
import PROJECT_CONFIG from './const/project';
import cors from 'cors';
import Telegram from './utils/telegram';
import bodyParser from 'body-parser';
import { Database } from './utils/db';
import userRouter from './controllers/user';
import RequestService from './models/request';
import { UserService } from './models/user';
import currencyRouter from './controllers/currency';

Telegram.init(PROJECT_CONFIG.TELEGRAM_BOT_TOKEN)

const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

const init = async () => {
  await Database.init(PROJECT_CONFIG.MONGODB_URL)
  await RequestService.init()
  app.use('/api', requestRouter);
  await UserService.init()
  app.use('/api', userRouter)
  app.use('/api', currencyRouter)
  app.listen(PROJECT_CONFIG.PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PROJECT_CONFIG.PORT}`);
  });
}

init()