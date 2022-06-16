import { ObjectID } from "bson";
import { Collection, ObjectId } from "mongodb";
import { CurrencyDataItemWithWallet } from "../const/currencies";
import crypto from 'crypto'
import { CurrencyUnitEnum } from "../types/exchange";
import _ from "lodash";
import { Database } from "../utils/db";

export enum RequestStatusEnum {
  NEW = 'new',
  PAYED = 'payed',
  PROCESSING = 'processing',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export type RequestType = {
  _id?: ObjectID,
  coinFrom: CurrencyUnitEnum,
  coinTo: CurrencyUnitEnum,
  countTo: string | number,
  countFrom: string | number
  userId?: ObjectID;
  status: RequestStatusEnum,
  wallet?: string,
  card?: string,
  createdAt?: number;
}
export interface RequestView extends Omit<RequestType, '_id' | 'userId'> {
  _id: string,
  userId: string
};

export interface ICreateRequest extends Omit<RequestType, '_id' | 'status' | 'createdAt' | 'coinFrom' | 'coinTo'> {
  coinTo: CurrencyDataItemWithWallet,
  coinFrom: CurrencyDataItemWithWallet,
  email?: string,
  phone?: string | number,
  wallet?: string,
  card?: string
}
export type IUpdateRequest = Partial<Pick<RequestType, 'status'>>

export class Request {
  constructor(private data: RequestType) {}

  public getView(): RequestView {
    const excludedList: never[] = []

    const buffer = _.omit(this.data, excludedList) as any;

    buffer._id = buffer._id.toHexString();
    buffer.userId = buffer.userId.toHexString();
    return buffer as RequestView
  }

  public getData() {
    return this.data
  }
}

export default class RequestService {
  static collection: Collection<RequestType>

  static async init() {
    this.collection = Database.getDatabase().collection<RequestType>('requests')
  }

  static async getById(id: string): Promise<Request | undefined> {
    const request = await this.collection.findOne({
      _id: new ObjectId(id)
    })

    return request ? new Request(request) : undefined;
  }

  static async get(filter: Partial<Omit<RequestType, '_id'>>) {
    const requestList = await this.collection.find({
      ...filter,
    }).toArray()

    return requestList.map(request => new Request(request));
  }

  static async create(data: ICreateRequest): Promise<string | undefined> {
    let token = '';
    crypto.randomBytes(48, function (_err, buffer) {
      token = buffer.toString('hex');
    });
    const requestData: RequestType = {
      coinFrom: data.coinFrom.unit,
      coinTo: data.coinTo.unit,
      countTo: data.countTo,
      countFrom: data.countFrom,
      userId: data.userId,
      status: RequestStatusEnum.NEW, //crypto.randomBytes(20).toString('hex'),
      createdAt: Date.now(),
    };
    const request = await this.collection.insertOne(requestData);

    return request.insertedId.toHexString() || undefined
  }

  static async delete(filter: Partial<RequestType>) {
    const requestList = await this.collection.deleteMany({
      ...filter,
    })
  }

  static async deleteById(id: string): Promise<void> {
    await this.collection.deleteOne({
      _id: new ObjectId(id)
    })
  }


  static async update(id: string, data: IUpdateRequest): Promise<string | undefined> {
    const request = await this.collection.findOneAndUpdate({
      _id: new ObjectId(id)
    }, {
      $set: data
    });

    return id || undefined
  }
}