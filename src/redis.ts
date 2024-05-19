import { createClient } from "redis";

abstract class RedisClient {
  public static client = createClient({
    url: process.env.REDIS_URL,
  });

  static async initiateConnection(): Promise<void> {
    try {
      await this.client.connect();
      console.log("Connected to Redis");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      throw error; // Optionally rethrow the error for handling elsewhere
    }
  }
}

export default RedisClient;
