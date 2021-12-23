import { ObjectId, ObjectID } from "bson";
import { Database } from "../utils/db";
import crypto from 'crypto';
import { Collection } from "mongodb";
import _ from 'lodash';

export type UserType = {
  _id?: ObjectID,
  token: string,
  email: string,
  password: string,
  username: string,
  fullname?: string,
  telegram?: string,
  phone?: string,
  resetPasswordToken?: string,
  resetPasswordExpires?: number
}
export type UserView = Omit<UserType, "password" | "resetPasswordToken" | "resetPasswordExpires">

export type ICreateUser = Pick<UserType, 'email' | 'password' | 'username'>
export type IUpdateUser = Partial<Omit<UserType, "token" | 'password' | "_id">>
export type IUserAuth = {
  email: string,
  password: string
}


export class User {
  constructor(public data: UserType) {}

  getView(): UserView {
    const excludedList = ['resetPasswordExpires', 'resetPasswordToken', 'password']

    const buffer = _.omit(this.data, excludedList) as any;

    buffer._id = buffer._id.toHexString();

    return buffer as UserView
  }
}

export class UserService {
  static collection: Collection<UserType>

  static async init() {
    const db = Database.getDatabase()
    this.collection = db.collection<UserType>('users')
  }

  static async getById(id: string): Promise<User | undefined> {
    const user = await this.collection.findOne({
      _id: new ObjectId(id)
    })

    return user ? new User(user) : undefined;
  }

  static async getByAuth(data: IUserAuth): Promise<User | undefined> {
    const user = await this.collection.findOne({
      $and: [
        {
          email: data.email
        },
        {
          password: data.password
        }
      ]
    })

    return user ? new User(user) : undefined;
  }

  static async getByToken(token: string): Promise<User | undefined> {
    const user = await this.collection.findOne({
      token
    })

    return user ? new User(user) : undefined;
  }

  static async getByEmail(email: string): Promise<User | undefined> {
    const user = await this.collection.findOne({
      email
    })

    return user ? new User(user) : undefined;
  }

  static async getByResetPasswordToken(resetPasswordToken: string): Promise<User | undefined> {
    const user = await this.collection.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    return user ? new User(user) : undefined;
  }

  static async get(filter: Partial<UserType>) {
    const user = await this.collection.findOne({
      ...filter,
      _id: filter._id
    })

    return user ? new User(user) : undefined;
  }

  static async create(data: ICreateUser): Promise<string | undefined> {
    const token = crypto.randomBytes(48).toString('hex');
    if (!token) return undefined;
    const userData: UserType = {
      email: data.email,
      password: data.password,
      token: token,
      username: data.username,
      resetPasswordToken: '', //crypto.randomBytes(20).toString('hex'),
      resetPasswordExpires: 0, //Date.now() + 3600000,
    };
    const user = await this.collection.insertOne(userData);

    return user.insertedId.toHexString() || undefined
  }

  static async deleteById(id: string): Promise<void> {
    await this.collection.deleteOne({
      _id: new ObjectId(id)
    })
  }


  static async update(id: string, data: IUpdateUser): Promise<string | undefined> {
    const user = await this.collection.updateOne({
      _id: new ObjectId(id)
    }, {
      $set: data
    });

    return user.upsertedId?.toHexString() || undefined
  }

  static async updatePassword(id: string, newPassword: string): Promise<string | undefined> {
    const user = await this.collection.updateOne({
      _id: new ObjectId(id)
    }, {
      password: newPassword
    });

    return user.upsertedId.toHexString() || undefined
  }
}