import { ConcurrentQueue } from "./ConcurrentQueue";
import { QueueBase, requestQueueValue } from "./QueueBase";

type HandlerParams = {
  url: string;
  result: boolean;
  error: Error;
};

type OnProcessParam = Pick<HandlerParams, "url">;
export type OnSuccessParam = Pick<HandlerParams, "url" | "result">;
export type OnFailureParam = Pick<HandlerParams, "url" | "error">;
type OnDoneParam = Pick<HandlerParams, "url">;

export type CallbackFunction = (
  err: unknown | undefined,
  result: unknown | undefined
) => undefined;

export class PredictionQueue extends QueueBase {
  protected readonly predictionQueue: ConcurrentQueue<OnProcessParam>;

  constructor() {
    super();

    this.predictionQueue = new ConcurrentQueue({
      concurrency: 1, // We don't need more concurrent jobs here because this queue does CPU-bound task, it means that it blocks event loop anyway
      timeout: 0,
      onProcess: this.onProcess.bind(this),
      onSuccess: this.onSuccess.bind(this),
      onFailure: this.onFailure.bind(this),
      onDone: this.onDone.bind(this),
      onDrain: this.onDrain.bind(this),
    });
  }

  private onProcess({ url }: OnProcessParam, callback: CallbackFunction): void {
    this.model
      .predictImage(url)
      .then((result) => callback(undefined, { url, result }))
      .catch((error: Error) => callback({ url, error }, undefined));
  }

  private onSuccess({ url, result }: OnSuccessParam): void {
    this.cache.setKey(url, result);

    for (const [{ resolve }] of this.requestMap.get(url) as requestQueueValue) {
      resolve(result);
    }
  }

  private onFailure({ url, error }: OnFailureParam): void {
    this.cache.setKey(url, false);

    for (const [{ reject }] of this.requestMap.get(url) as requestQueueValue) {
      reject(error);
    }
  }

  private onDone({ url }: OnDoneParam): void {
    this.requestMap.delete(url);
  }

  private onDrain(): void {}
}
