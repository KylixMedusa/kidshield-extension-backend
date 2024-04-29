import Redis from "ioredis";

class ImageCache {
  private redisClient: Redis;

  constructor() {
    // Initialize Redis client
    this.redisClient = new Redis();
  }

  // Method to set a boolean value for a given string key
  async setKey(key: string, value: boolean): Promise<string> {
    return await this.redisClient.set(key, value.toString());
  }

  // Method to check if a key exists
  async keyExists(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }

  // Method to get a boolean value by string key
  async getKey(key: string): Promise<boolean | null> {
    const value = await this.redisClient.get(key);
    return value !== null ? value === "true" : null;
  }

  // Method to clear the cache
  async clear(): Promise<void> {
    await this.redisClient.flushall();
  }
}

export default ImageCache;
