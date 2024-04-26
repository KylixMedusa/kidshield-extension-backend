import fs from "fs";

import { LRUCache } from "./LRUCache";

// Function to save cache to disk
const saveCache = <K, V>(cache: LRUCache<K, V>): void => {
  const data = JSON.stringify(cache.dump());
  fs.writeFileSync("images_cache.json", data);
};

// Function to load cache from disk
const loadCache = <K, V>(cache: LRUCache<K, V>): void => {
  try {
    const data = fs.readFileSync("images_cache.json", "utf-8");
    cache.load(JSON.parse(data));
  } catch (error) {
    console.log("Failed to load cache:", error);
  }
};

const ImageCache = {
  saveCache,
  loadCache,
};

export default ImageCache;
