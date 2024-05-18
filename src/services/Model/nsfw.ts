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

  // Defines an asynchronous method to preprocess and infer predictions from an image URL.
  async infer(imageUrl: string) {
    // Download the image as an array buffer using axios.
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data);
    // Decode the image buffer into a tensor with 3 color channels (RGB).
    let tensor = tf.node.decodeImage(imageBuffer, 3);

    return tf.tidy(() => {
      // Normalize the tensor values from [0, 255] (integer pixel values) to [0, 1] (float).
      let normalized = tensor.toFloat().div(this.normalizationOffset);

      // Ensure the tensor has a batch dimension, required for model input.
      let batched = normalized;
      if (normalized.shape.length === 3) {
        batched = normalized.expandDims(0);
      }

      // Resize the image tensor to match the input size expected by the model.
      batched = tf.image.resizeBilinear(
        batched as tf.Tensor4D,
        [this.options.size, this.options.size],
        true
      );

      // Pass the preprocessed image tensor to the model for prediction.
      const prediction = this.model!.predict(batched);
      // Cast the output to tf.Tensor2D for further processing.
      return prediction as tf.Tensor2D;
    });
  }

  // Classify an image from a URL and return the top K classification results.
  async classifyImage(
    imageUrl: string,
    topK: number = 5
  ): Promise<PredictionType[]> {
    try {
      // Infer predictions from the image.
      const predictions = await this.infer(imageUrl);

      // Convert the prediction result tensor into an array of probabilities.
      const probabilities = await predictions.data();
      // Clean up the tensor to prevent memory leaks.
      predictions.dispose();

      // Extract the top K classes based on the prediction probabilities.
      return this.getTopKClasses(Array.from(probabilities), topK);
    } catch (error) {
      // Log and return an empty array if an error occurs during the process.
      console.error("Error during inference:", error);
      return [];
    }
  }

  // Utility function to extract the top K classes from prediction values.
  private getTopKClasses(values: number[], topK: number = 5): PredictionType[] {
    // Map prediction values to objects with class names and probabilities.
    const classesAndProbs = values.map((value, index) => ({
      className: NSFW_CLASSES[index as keyof typeof NSFW_CLASSES],
      probability: value,
    }));

    // Sort classes by probability in descending order.
    classesAndProbs.sort((a, b) => b.probability - a.probability);
    // Slice the array to get the top K classes and return.
    return classesAndProbs.slice(0, topK);
  }
}
