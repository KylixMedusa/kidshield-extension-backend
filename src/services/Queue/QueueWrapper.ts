import { PredictionQueue } from "./PredictionQueue";

type IQueueWrapper = {
  predict: (url: string) => Promise<boolean>;
};

export class QueueWrapper extends PredictionQueue implements IQueueWrapper {
  public async predict(url: string): Promise<boolean> {
    return await new Promise(async (resolve, reject) => {
      const isCached = await this.cache.keyExists(url);
      if (isCached) {
        const cachedValue = await this.cache.getKey(url);
        resolve(cachedValue ?? false);
        return;
      }

      if (this.requestMap.has(url)) {
        this.requestMap.get(url)?.push([{ resolve, reject }]);
      } else {
        this.requestMap.set(url, [[{ resolve, reject }]]);
        this.predictionQueue.add({ url });
      }
    });
  }
}
