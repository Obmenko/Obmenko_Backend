import { Db, MongoClient } from "mongodb";
import PROJECT_CONFIG from "../const/project";

export class Database {
  static client: MongoClient

  static async init(connectionString: string) {
    const database = await MongoClient.connect(connectionString)
    console.log('Database inited');
    this.client = database as any as MongoClient;
  }

  static getDatabase(): Db {
    return this.client.db()
  }
}