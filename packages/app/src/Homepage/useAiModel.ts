'use server';

import { HfInference } from "@huggingface/inference";

export async function fetchResponse() {
  try {
    const accessToken = process.env.HF_TOKEN;
    const inference = new HfInference(accessToken);

    const out = await inference.chatCompletion({
      model: "NousResearch/Hermes-3-Llama-3.1-8B",
      messages: [
        {
          role: "user",
          content:
            "Write a haiku using these elements: spring, memories, believe. ",
        },
      ],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 0.7,
    });

    return {
      success: true,
      message: out.choices[0].message.content
    };
  } catch (e: unknown) {
    console.log(e);
    return {
      success: false,
      message: "Something went wrong."
    }
  }
}
