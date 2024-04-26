import VulgarWords from "../utils/vulgar_words.json";
import { FilterContentValidators } from "../validators";
import { TransformTextServices } from "./";
import { QueueWrapper as Queue } from "./Queue/QueueWrapper";

const MATCHES_PER_SENTENCE = 1;
const MIN_SENTENCE_LENGTH_FOR_REVIEW = 40;
const BOUNDARY_SENTENCES_COUNT = 1;

const queue = new Queue();

const markAndReplaceVulgarWords = (text: string) => {
  let hasVulgarWords = false;
  let processedText = text;

  const vulgarWordMatches = VulgarWords.filter((vulgarWord) =>
    new RegExp(`\\b${vulgarWord}\\b`, "i").test(text)
  );

  hasVulgarWords = vulgarWordMatches.length > 0;

  if (hasVulgarWords) {
    vulgarWordMatches.forEach((vulgarWord) => {
      processedText = processedText.replace(
        new RegExp(`\\b${vulgarWord}\\b`, "gi"),
        "***"
      );
    });
  }

  return { hasVulgarWords, vulgarWordMatches, processedText };
};

const processNodeText = (text: string) => {
  // Step 0: Initialize variables
  let containsVulgarWords = false;

  // Step 1: Break the text into sentences
  const sentences = text.split(/(?<=\.\s)/);

  const processedSentences = sentences.map((sentence, index) => {
    // Identify vulgar words in the sentence
    const { hasVulgarWords, vulgarWordMatches, processedText } =
      markAndReplaceVulgarWords(sentence);

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

  // for (
  //   let index = postfixSentencesExcluded;
  //   index <= processedSentences.length - 1;
  //   index++
  // ) {
  //   reviewEndIndex += processedSentences[index].text.length;
  // }
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

const filterContent = async (
  nodes: FilterContentValidators.HTMLNodes,
  images: string[]
): Promise<FilterContentValidators.FilterContentResponse> => {
  // remove unnecessary fields from the nodes & filter out nodes with missing id or text
  const strippedNodes = nodes
    .map((node) => ({
      id: node.id,
      text: node.text,
    }))
    .filter(
      (node) => node.id && node.text
    ) as FilterContentValidators.Modification[];

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
      } = processNodeText(node.text);

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

  let collectiveTextForReviewTexts = collectiveTextForReview
    .filter((node) => node.text)
    .map((node) => `[${node.index}] ${node.text}`);

  let transformedTexts: string[] = [];
  let nsfwImages: string[] = [];

  const results = await Promise.all([
    TransformTextServices.transformText(collectiveTextForReviewTexts),
    ...images.map((image) => queue.predict(image)),
  ]);

  transformedTexts = results[0];

  // return the images that are NSFW
  nsfwImages = images.filter((_, index) => results[index + 1]);

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
          text: markAndReplaceVulgarWords(replacedText).processedText,
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

export default { filterContent };
