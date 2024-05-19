import RedisClient from "../redis";

class ImageCache {
  // Method to set a boolean value for a given string key
  async setKey(key: string, value: boolean) {
    return await RedisClient.client.set(key, value.toString());
  }

  // Method to check if a key exists
  async keyExists(key: string): Promise<boolean> {
    return (await RedisClient.client.exists(key)) === 1;
  }

  // Method to get a boolean value by string key
  async getKey(key: string): Promise<boolean | null> {
    const value = await RedisClient.client.get(key);
    return value !== null ? value === "true" : null;
  }

  // Method to clear the cache
  async clear(): Promise<void> {
    await RedisClient.client.flushAll();
  }
}

export default ImageCache;
