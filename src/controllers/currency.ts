import axios from 'axios';
import express from 'express';
import PROJECT_CONFIG from '../const/project';
import { CurrencyUnitEnum } from '../types/exchange';
import CurrencyConfigGenerator from '../utils/currency';
import { parseRequestToken } from '../utils/http';


const currencyRouter = express.Router();

currencyRouter.get('/currency/:from/:to', async (req, res) => {  
  const currencyConfig = new CurrencyConfigGenerator()
  await currencyConfig.getConfig()


  res.status(200).send(currencyConfig.config.data)
});

export default currencyRouter