import './utils/dotenv'
import express from 'express';
import requestRouter from './controllers/request';
import PROJECT_CONFIG from './const/project';
import cors from 'cors';
import Telegram from './utils/telegram';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { DBClient } from './utils/db';

Telegram.init(PROJECT_CONFIG.TELEGRAM_BOT_TOKEN)

const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

app.use('/api/tg', requestRouter);
require('./app/routes')(app);

const init = async () => {
  await DBClient.init(PROJECT_CONFIG.MONGODB_URL)
  app.listen(PROJECT_CONFIG.PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PROJECT_CONFIG.PORT}`);
  });
}

init()