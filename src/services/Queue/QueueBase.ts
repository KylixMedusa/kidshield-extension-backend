import ImageCache from "../../utils/ImageCache";
import { LRUCache } from "../../utils/LRUCache";
import { Model } from "../Model/Model";

export type requestQueueValue = Array<
  Array<{
    resolve: (value: boolean) => void;
    reject: (error: Error) => void;
  }>
>;

export type CallbackFunction = (
  err: unknown | undefined,
  result: unknown | undefined
) => undefined;

export class QueueBase {
  protected readonly model: Model;
  protected readonly requestMap: Map<string, requestQueueValue>;
  protected readonly cache: LRUCache<string, boolean>;

  constructor() {
    this.model = new Model({
      filterStrictness: 100,
    });

    this.requestMap = new Map();
    this.cache = new LRUCache(100000);
    ImageCache.loadCache(this.cache);
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
