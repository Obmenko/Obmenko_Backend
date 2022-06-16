import axios from 'axios';
import { writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
import { CurrencyPairsConfig as CurrencyConfig, CurrencyUnitEnum } from '../types/exchange';
import PROJECT_CONFIG from '../const/project';
// @ts-ignore
import { Spot } from '@binance/connector'
import _ from 'lodash';
import fs from 'fs'
import path from 'path'

const META_DIR_PATH = path.join(process.cwd(), 'meta')

class CurrencyConfigGenerator {
  private apiKey = PROJECT_CONFIG.BINANCE_API_KEY
  private secretKey = PROJECT_CONFIG.BINANCE_SECRET_KEY
  private client = new Spot(this.apiKey, this.secretKey)
  public config: CurrencyConfig
  private validPairs: Array<[CurrencyUnitEnum, CurrencyUnitEnum]> = []
  private invalidPairs: Array<[CurrencyUnitEnum, CurrencyUnitEnum]> = []
  private EXPIRE_TIME = 20 * 1000

  constructor() {
    this.config = JSON.parse(fs.readFileSync(path.join(META_DIR_PATH, 'currency_config.json'), 'utf8'))
    this.validPairs = JSON.parse(fs.readFileSync(path.join(META_DIR_PATH, 'valid_pairs.json'), 'utf8'))
    this.invalidPairs = JSON.parse(fs.readFileSync(path.join(META_DIR_PATH, 'invalid_pairs.json'), 'utf8'))
  }

  private async updateConfig() {
    let validPairs = this.validPairs
    let invalidPairs = this.invalidPairs
    if (!validPairs.length || !this.isConfigValid(this.config))  {
      const {valid, invalid} = await this.fetchPairListByStatus()
      validPairs = valid
      invalidPairs = invalid
    }
    let unFilledConfigData = await this.fetchPairsCourse(validPairs)
    unFilledConfigData = this.getConfigWithInvalidPairs(unFilledConfigData, invalidPairs)
    unFilledConfigData = this.getConfigWithDuplicates(unFilledConfigData)
    const config: CurrencyConfig = {
        updatedAt: Date.now(),
        data: unFilledConfigData as CurrencyConfig['data']
    }
    this.validPairs = validPairs
    this.invalidPairs = invalidPairs
    this.config = config
    this.saveInvalidPairList(invalidPairs)
    this.saveValidPairList(validPairs)
    this.saveConfig(config)
  }

  public async getConfig() {
    if (this.isConfigExpired(this.config)) {
      await this.updateConfig()
      if (this.isConfigValid(this.config)) return this.config
    }
    if (!this.isConfigValid(this.config)) {
      await this.updateConfig()
      if (this.isConfigValid(this.config)) return this.config
    }
    return this.config
  }

  private saveConfig(data: CurrencyConfig) {
    fs.writeFileSync(path.join(META_DIR_PATH, 'currency_config.json'), JSON.stringify(data, null, 2))
  }
  private saveValidPairList(data: Array<[CurrencyUnitEnum, CurrencyUnitEnum]>) {
    fs.writeFileSync(path.join(META_DIR_PATH, 'valid_pairs.json'), JSON.stringify(data, null, 2))
  }
  private saveInvalidPairList(data: Array<[CurrencyUnitEnum, CurrencyUnitEnum]>) {
    fs.writeFileSync(path.join(META_DIR_PATH, 'invalid_pairs.json'), JSON.stringify(data, null, 2))
  }

  private isConfigValid(config: CurrencyConfig) {
    const needTotalCount = Math.pow(Object.keys(CurrencyUnitEnum).length, 2) 
    const currentTotlaCount = Object.values(config.data).reduce((accum, dict) => accum + (Object.keys(dict).length), 0)

    if (needTotalCount - currentTotlaCount) console.log(`Config diff in ${needTotalCount - currentTotlaCount}`);
    return needTotalCount === currentTotlaCount
  }

  private isConfigExpired(config: CurrencyConfig) {
    if (config.updatedAt === undefined) return true
    return (Date.now() - this.EXPIRE_TIME) - +new Date(config.updatedAt) >= 0
  }

  private async fetchPairsCourse(pairs: Array<[CurrencyUnitEnum, CurrencyUnitEnum]>): Promise<Partial<CurrencyConfig['data']>> {
    const fetchedData: Array<{ symbol: string, price: string }> = (await this.client.tickerPrice('', pairs.map(el => el.join('')))).data
    const unFilledCurrencyConfigData: Partial<CurrencyConfig['data']> = pairs.reduce<Partial<CurrencyConfig['data']>>((accum, pair) => {
      const symbol = pair.join('')
      const dataElementIndex = fetchedData.findIndex(el => el.symbol === symbol)
      if (dataElementIndex === -1) {
        return accum
      }
      if (!accum[pair[0]]) accum[pair[0]] = {}
      if (!accum[pair[1]]) accum[pair[1]] = {}
      if (accum[pair[0]]) (accum[pair[0]] as any)[pair[1]] = this.handleNumber(+fetchedData[dataElementIndex].price)
      if (accum[pair[1]]) (accum[pair[1]] as any)[pair[0]] = this.handleNumber(1 / +(fetchedData[dataElementIndex].price))
      return accum
    }, {})

    return unFilledCurrencyConfigData
  }

  private async fetchPairListByStatus(): Promise<{
    valid: Array<[CurrencyUnitEnum, CurrencyUnitEnum]>,
    invalid: Array<[CurrencyUnitEnum, CurrencyUnitEnum]>
  }> {
    const pairsForBinance: Array<[CurrencyUnitEnum, CurrencyUnitEnum]> = []
    const pairsToHandle: Array<[CurrencyUnitEnum, CurrencyUnitEnum]> = []
    await Promise.all(
      Object.keys(CurrencyUnitEnum).map((unit) => {
        return Promise.all(
          Object.keys(CurrencyUnitEnum).map(async innerUnit => {
            try {
              await this.fetchPairsCourse([[unit as CurrencyUnitEnum, innerUnit as CurrencyUnitEnum]])
              pairsForBinance.push([unit as CurrencyUnitEnum, innerUnit as CurrencyUnitEnum])
            } catch (e) {
              if (unit !== innerUnit) pairsToHandle.push([unit as CurrencyUnitEnum, innerUnit as CurrencyUnitEnum])
            }
          })
        )
      })
    )

    return {
      valid: pairsForBinance,
      invalid: pairsToHandle
    }
  }

  private getConfigWithInvalidPairs(unFilledConfig: Partial<CurrencyConfig['data']>, invalidPairs: Array<[CurrencyUnitEnum, CurrencyUnitEnum]>): Partial<CurrencyConfig['data']> {
    const buffer = _.cloneDeep(unFilledConfig) 
    invalidPairs.forEach(pair => {
      if ((unFilledConfig[pair[0]] as any)[pair[1]]) return
      const dict = Object.values(unFilledConfig).find(el => el?.[pair[0]] !== undefined && el?.[pair[1]] !== undefined)
      if (dict === undefined) {
        console.log('pair', pair);
        console.log(`Not found for ${pair.join('/')}`);
        return
      }

      if (dict) {
        if (!buffer[pair[0]]) buffer[pair[0]] = {}
        if (!buffer[pair[1]]) buffer[pair[1]] = {}
        if (buffer[pair[0]]) (buffer[pair[0]] as any)[pair[1]] = this.handleNumber((dict as any)[pair?.[1] as CurrencyUnitEnum] / (dict as any)[pair[0] as CurrencyUnitEnum])
        if (buffer[pair[1]]) (buffer[pair[1]] as any)[pair[0]] = this.handleNumber((dict as any)[pair?.[0] as CurrencyUnitEnum] / (dict as any)[pair[1] as CurrencyUnitEnum])
      }
    })
    return buffer as Partial<CurrencyConfig['data']>
  }

  private getConfigWithDuplicates(unFilledConfig: Partial<CurrencyConfig['data']>) {
    const buffer = _.cloneDeep(unFilledConfig) 
    Object.keys(buffer).forEach(key => {
      (buffer[key] as any)[key] = "1"
    })
    return buffer
  }

  private handleNumber(data: number | string): string {
    return Number(data).toFixed(11).replace(/\.?0+$/, "")
  }
}

export default CurrencyConfigGenerator