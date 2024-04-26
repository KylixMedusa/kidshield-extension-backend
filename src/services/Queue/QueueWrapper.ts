import { PredictionQueue } from "./PredictionQueue";

type IQueueWrapper = {
  predict: (url: string) => Promise<boolean>;
};

export class QueueWrapper extends PredictionQueue implements IQueueWrapper {
  public async predict(url: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      if (this.cache.has(url)) {
        resolve(this.cache.get(url) as boolean);
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
