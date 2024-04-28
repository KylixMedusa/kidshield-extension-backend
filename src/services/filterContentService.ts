import VulgarEmojis from "../utils/vulgar_emojis.json";
import VulgarWordsMap from "../utils/vulgar_words.json";
import { FilterContentValidator } from "../validators";
import { QueueWrapper as Queue } from "./Queue/QueueWrapper";
import transformTextService from "./transformTextService";

const MATCHES_PER_SENTENCE = 1;
const MIN_SENTENCE_LENGTH_FOR_REVIEW = 40;
const BOUNDARY_SENTENCES_COUNT = 1;

class FilterContentService {
  private queue;

  constructor() {
    this.queue = new Queue();
  }

  private removeVulgarEmojis = (text: string) => {
    // Escape potential regex special characters in emojis (generally not necessary for emojis)
    const escapedEmojis = VulgarEmojis.map((emoji) =>
      emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    // Create a regex pattern to match any of the vulgar emojis
    const regexPattern = new RegExp(escapedEmojis.join("|"), "g");

    // Replace the matched vulgar emojis with an empty string
    const cleanedText = text.replace(regexPattern, "");

    return cleanedText;
  };

  private markAndReplaceVulgarWords = (text: string) => {
    let processedText = text;
    const regexPattern = Object.keys(VulgarWordsMap)
      .map((word) => `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`) // Escape special regex characters and ensure word boundaries
      .join("|");
    const regex = new RegExp(regexPattern, "gi"); // Global and case-insensitive

    // Find all matches
    const vulgarWordMatches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!vulgarWordMatches.includes(match[0].toLowerCase())) {
        vulgarWordMatches.push(match[0].toLowerCase());
      }
    }

    // Replace matches
    processedText = processedText.replace(regex, (matched) => {
      return VulgarWordsMap[
        matched.toLowerCase() as keyof typeof VulgarWordsMap
      ];
    });

    return {
      hasVulgarWords: vulgarWordMatches.length > 0,
      vulgarWordMatches: vulgarWordMatches,
      processedText: this.removeVulgarEmojis(processedText),
    };
  };

  private processNodeText = (text: string) => {
    // Step 0: Initialize variables
    let containsVulgarWords = false;

    // Step 1: Break the text into sentences
    const sentences = text.split(/(?<=\.\s)/);

    const processedSentences = sentences.map((sentence, index) => {
      // Identify vulgar words in the sentence
      const { hasVulgarWords, vulgarWordMatches, processedText } =
        this.markAndReplaceVulgarWords(sentence);

      containsVulgarWords = containsVulgarWords || hasVulgarWords;

      // Step 3: Mark for review
      const sendForReview =
        hasVulgarWords &&
        vulgarWordMatches.length > MATCHES_PER_SENTENCE &&
        sentence.length >= MIN_SENTENCE_LENGTH_FOR_REVIEW;

      return {
        text: sentence,
        processedText,
        review: sendForReview, // Mark for review
      };
    });

    let textForReview = "";
    let processedText = "";
    let sentenceForReviewFound = false;
    let prefixSentencesIndex = 0;
    let postfixSentencesIndex = 0;
    let startBoundary = 0;
    let endBoundary = 0;

    // Combine all the sentences from the first marked sentence to the end
    for (let i = 0; i < processedSentences.length; i++) {
      const sentence = processedSentences[i];

      if (sentence.review) {
        if (!sentenceForReviewFound) {
          prefixSentencesIndex = Math.max(0, i - BOUNDARY_SENTENCES_COUNT);
          startBoundary = i;
        }
        endBoundary = i;
        sentenceForReviewFound = true;
      }

      if (sentenceForReviewFound) {
        textForReview += sentence.text;
      }

      processedText += sentence.processedText;
    }

    // Include the boundary sentences
    if (sentenceForReviewFound) {
      postfixSentencesIndex = Math.min(
        processedSentences.length - 1,
        endBoundary + BOUNDARY_SENTENCES_COUNT
      );

      for (let i = startBoundary - 1; i >= prefixSentencesIndex; i--) {
        textForReview = processedSentences[i].text + textForReview;
      }

      for (let i = endBoundary + 1; i <= postfixSentencesIndex; i++) {
        textForReview += processedSentences[i].text;
      }
    }
    let prefixSentencesExcluded = 0;
    let postfixSentencesExcluded = 0;

    prefixSentencesExcluded = Math.max(
      0,
      startBoundary - BOUNDARY_SENTENCES_COUNT
    );
    postfixSentencesExcluded = Math.min(
      processedSentences.length - 1,
      endBoundary + BOUNDARY_SENTENCES_COUNT
    );

    let reviewStartIndex = 0;
    let reviewEndIndex = 0;

    for (let index = 0; index < prefixSentencesExcluded; index++) {
      reviewStartIndex += processedSentences[index].text.length;
    }

    reviewEndIndex = reviewStartIndex + textForReview.length;

    return {
      text,
      hasVulgarWords: containsVulgarWords,
      processedText,
      textForReview,
      reviewStartIndex,
      reviewEndIndex,
    };
  };

  public filterContent = async (
    nodes: FilterContentValidator.HTMLNodes,
    images: string[]
  ): Promise<FilterContentValidator.FilterContentResponse> => {
    // remove unnecessary fields from the nodes & filter out nodes with missing id or text
    const strippedNodes = nodes
      .map((node) => ({
        id: node.id,
        text: node.text,
      }))
      .filter(
        (node) => node.id && node.text
      ) as FilterContentValidator.Modification[];

    // Filter nodes to find nodes that contain vulgar words or phrases
    // Return the processed text
    const filteredNodes = strippedNodes
      .map((node) => {
        const {
          hasVulgarWords,
          processedText,
          textForReview,
          text,
          reviewStartIndex,
          reviewEndIndex,
        } = this.processNodeText(node.text);

        return {
          id: node.id,
          text,
          review: hasVulgarWords,
          textForReview,
          processedText,
          reviewStartIndex,
          reviewEndIndex,
        };
      })
      .filter((node) => node.review);

    let collectiveTextForReview = filteredNodes.map((node, index) => ({
      index,
      text: node.textForReview,
    }));

    let transformedTexts: string[] = [];
    let nsfwImages: string[] = [];

    // Prepare promises for transforming text and predicting images
    const transformTextPromises = collectiveTextForReview
      .filter((node) => node.text)
      .map((node) =>
        transformTextService.transformText(`[${node.index}] ${node.text}`)
      );

    const imagePromises = images.map((image) => this.queue.predict(image));

    // Await all asynchronous operations at once
    const [textResults, imageResults] = await Promise.all([
      Promise.all(transformTextPromises),
      Promise.all(imagePromises),
    ]);

    // Assign transformed texts directly
    transformedTexts = textResults;

    // Filter and return NSFW images based on prediction results
    nsfwImages = images.filter((_, index) => imageResults[index]);

    const transformedNodes = filteredNodes.map((node, index) => {
      if (node.textForReview) {
        const transformedText = transformedTexts
          .find((text) => text.startsWith(`[${index}]`))
          ?.replace(`[${index}]`, "")
          .trim();

        if (transformedText) {
          const replacedText =
            node.text.substring(0, node.reviewStartIndex) +
            transformedText +
            node.text.substring(node.reviewEndIndex);

          return {
            id: node.id,
            text: this.markAndReplaceVulgarWords(replacedText).processedText,
          };
        }
      }

      return {
        id: node.id,
        text: node.processedText || node.text,
      };
    });

    return {
      modifications: transformedNodes,
      images: nsfwImages,
    };
  };
}

export default new FilterContentService();
