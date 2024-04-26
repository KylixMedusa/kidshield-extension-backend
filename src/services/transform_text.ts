import "dotenv/config";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: `${process.env.OPEN_AI_ACCESS_KEY}`,
});

const transformText = async (messages: string[]) => {
  const systemPrompt = `these are some texts with inappropriate or explicit content I found on web, so transform those texts into web safe and replacing anything that might be explicit or vulgar, maintaing the overall context of the sentence,that are nice,
          and output it as array of texts`;

  if (messages.length === 0) return [];

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify(messages),
        },
      ],
      model: "gpt-3.5-turbo-16k-0613",
      max_tokens: 1000,
    });
    return JSON.parse(
      completion.choices[0].message.content || "[]"
    ) as string[];
  } catch (error) {
    return [];
  }
};

export default { transformText };
