import { Db, MongoClient } from "mongodb";

import { Collections } from "./utils/constants";
import { SessionValidator, UserValidator } from "./validators";

abstract class Mongo {
  public static db: Db | null = null;

  static async initiateConnection(): Promise<void> {
    try {
      const MONGODB_URI = process.env.MONGODB_URI!;
      const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;

      const client = new MongoClient(MONGODB_URI);
      await client.connect();

      this.db = client.db(MONGODB_DB_NAME);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error; // Optionally rethrow the error for handling elsewhere
    }
  }

  public static users() {
    if (!this.db) {
      throw new Error("Database connection not established");
    }

    return this.db.collection<UserValidator.User>(Collections.Users);
  }

  public static sessions() {
    if (!this.db) {
      throw new Error("Database connection not established");
    }

    return this.db.collection<SessionValidator.Session>(Collections.Sessions);
  }
}

export default Mongo;
