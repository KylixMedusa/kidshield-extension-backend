import { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: `${process.env.OPEN_AI_ACCESS_KEY}`,
});
const generateOpenAIResponse = async (req: Request, res: Response) => {
  const { message } = req.body;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `these are some texts with inappropiate or explicit content I found on web, so transform those texts into web safe and replacing anything that might be explicit or vulgar, maintaing the overall context of the sentence,that are nice,
          and output it as array of texts
          `,
      },
      {
        role: "user",
        content: JSON.stringify(message),
      },
    ],
    model: "gpt-3.5-turbo-16k-0613",
    max_tokens: 1000,
  });

  res.json({
    message: "Open AI endpoint",
    completion: JSON.parse(completion.choices[0].message.content || "[]"),
  });
};

export default { generateOpenAIResponse };
