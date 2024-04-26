// import fetch from "node-fetch";
import axios from "axios";

import * as tf from "@tensorflow/tfjs-node";

export const NSFW_CLASSES = {
  0: "Drawing",
  1: "Hentai",
  2: "Neutral",
  3: "Porn",
  4: "Sexy",
} as const;

export type PredictionType = {
  className: (typeof NSFW_CLASSES)[keyof typeof NSFW_CLASSES];
  probability: number;
};

export class NSFWDetector {
  private model: tf.GraphModel | tf.LayersModel | undefined;
  private normalizationOffset: tf.Scalar;
  private options: { size: number };

  constructor(private modelPath: string, options = { size: 224 }) {
    this.loadModel();

    this.options = options;
    this.normalizationOffset = tf.scalar(255);
  }

  async loadModel(): Promise<void> {
    this.model = await tf.loadGraphModel(`file://${this.modelPath}`);
  }

  async infer(imageUrl: string) {
    // Download the image using axios and convert it to a tensor
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data);
    let tensor = tf.node.decodeImage(imageBuffer, 3);

    return tf.tidy(() => {
      // Normalize the image from [0, 255] to [0, 1].
      let normalized = tensor.toFloat().div(this.normalizationOffset);

      // Add a batch dimension if it's not already there
      let batched = normalized;
      if (normalized.shape.length === 3) {
        batched = normalized.expandDims(0);
      }

      // Resize the image if necessary
      batched = tf.image.resizeBilinear(
        batched as tf.Tensor4D,
        [this.options.size, this.options.size],
        true
      );

      // Make prediction
      const prediction = this.model!.predict(batched);
      return prediction as tf.Tensor2D;
    });
  }

  async classifyImage(
    imageUrl: string,
    topK: number = 5
  ): Promise<PredictionType[]> {
    try {
      const predictions = await this.infer(imageUrl);

      const probabilities = await predictions.data();
      predictions.dispose();

      return this.getTopKClasses(Array.from(probabilities), topK);
    } catch (error) {
      console.error("Error during inference:", error);
      return [];
    }
  }

  private getTopKClasses(values: number[], topK: number = 5): PredictionType[] {
    const classesAndProbs = values.map((value, index) => ({
      className: NSFW_CLASSES[index as keyof typeof NSFW_CLASSES],
      probability: value,
    }));

    classesAndProbs.sort((a, b) => b.probability - a.probability);
    return classesAndProbs.slice(0, topK);
  }
}
