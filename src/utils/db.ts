import { Db, MongoClient } from "mongodb";

class DB {
  _db: Db

  init(connectionString: string) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(connectionString, (err, database) => {
        if (err) return reject(err)
        this._db = database as any as Db;
        resolve(database)
      })
    })
  }

  getDatabase(): Db {
    return this._db
  }
}

export const DBClient = new DB()
export const db = DBClient.getDatabase()
