import OpenAI from "openai";

class TransformTextService {
  private readonly openai;

  constructor() {
    this.openai = new OpenAI({
      apiKey: `${process.env.OPEN_AI_ACCESS_KEY}`,
    });
  }

  public transformText = async (message: string) => {
    const prompt =
      "Here is a text with inappropriate or explicit content. Transform this text into web safe content, replacing anything that might be explicit or vulgar, maintaining the overall context of the sentence. Output it a single modified text.";

    if (message.length === 0) return "";

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        model: "gpt-3.5-turbo-16k-0613",
        max_tokens: 100,
      });
      return completion.choices[0].message.content || "";
    } catch (error) {
      return "";
    }
  };
}

export default new TransformTextService();
