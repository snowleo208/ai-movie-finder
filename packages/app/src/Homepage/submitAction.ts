'use server';

import { HfInference } from "@huggingface/inference";

export type Results = {
  success: boolean;
  message: string
} | null

export async function submitAction(_prevState: Results, formData: FormData) {
  try {
    const prompt = formData.get('prompt')?.toString();

    if (!prompt) {
      throw new Error("Prompt is invalid.")
    }

    const accessToken = process.env.NEXT_PUBLIC_HF_TOKEN;
    const inference = new HfInference(accessToken);

    const out = await inference.chatCompletion({
      model: "NousResearch/Hermes-3-Llama-3.1-8B",
      messages: [
        {
          role: "user",
          content:
            `Write a haiku using these elements: ${prompt}`,
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
