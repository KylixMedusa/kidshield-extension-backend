import { NSFWDetector, PredictionType } from "./nsfw";

export type ModelSettings = {
  filterStrictness: number;
};

type IModel = {
  predictImage: (url: string) => Promise<boolean>;
  setSettings: (settings: ModelSettings) => void;
};

export class Model implements IModel {
  private readonly model: NSFWDetector;

  private readonly FILTER_LIST: Set<string>;
  private readonly firstFilterPercentages: Map<string, number>;
  private readonly secondFilterPercentages: Map<string, number>;

  constructor(settings: ModelSettings) {
    this.model = new NSFWDetector(
      "./src/services/Model/model-assets/model.json"
    );

    this.FILTER_LIST = new Set(["Hentai", "Porn", "Sexy"]);

    this.firstFilterPercentages = new Map();
    this.secondFilterPercentages = new Map();

    this.setSettings(settings);
  }

  public setSettings(settings: ModelSettings): void {
    const { filterStrictness } = settings;
    this.firstFilterPercentages.clear();
    this.secondFilterPercentages.clear();

    for (const className of this.FILTER_LIST.values()) {
      this.firstFilterPercentages.set(
        className,
        Model.handleFilterStrictness({
          value: filterStrictness,
          maxValue: 100,
          minValue: className === "Porn" ? 40 : 60,
        })
      );
    }

    for (const className of this.FILTER_LIST.values()) {
      this.secondFilterPercentages.set(
        className,
        Model.handleFilterStrictness({
          value: filterStrictness,
          maxValue: 50,
          minValue: className === "Porn" ? 15 : 25,
        })
      );
    }
  }

  public async predictImage(url: string): Promise<boolean> {
    const prediction = await this.model.classifyImage(url, 2);
    return this.handlePrediction(prediction).result;
  }

  private handlePrediction(prediction: PredictionType[]): {
    result: boolean;
    className: string;
    probability: number;
  } {
    if (prediction.length < 2)
      return { result: false, className: "Neutral", probability: 1 };
    const [
      { className: cn1, probability: pb1 },
      { className: cn2, probability: pb2 },
    ] = prediction;

    const result1 =
      this.FILTER_LIST.has(cn1) &&
      pb1 > (this.firstFilterPercentages.get(cn1) as number);
    if (result1) return { result: result1, className: cn1, probability: pb1 };

    const result2 =
      this.FILTER_LIST.has(cn2) &&
      pb2 > (this.secondFilterPercentages.get(cn2) as number);
    if (result2) return { result: result2, className: cn2, probability: pb2 };

    return { result: false, className: cn1, probability: pb1 };
  }

  public static handleFilterStrictness({
    value,
    minValue,
    maxValue,
  }: {
    value: number;
    minValue: number;
    maxValue: number;
  }): number {
    const MIN = minValue;
    const MAX = maxValue;

    const calc = (value: number): number => {
      if (value <= 1) return MAX;
      else if (value >= 100) return MIN;
      else {
        const coefficient = 1 - value / 100;
        return coefficient * (MAX - MIN) + MIN;
      }
    };

    return Math.round((calc(value) / 100) * 10000) / 10000;
  }
}
