import { HfInference } from "@huggingface/inference";

// type LoadingState = "loaded" | "error" | "loading";

const HF_TOKEN = "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";

console.log(HF_TOKEN);

export function useAiModal() {
  async function fetchResponse() {
    try {
      const inference = new HfInference(HF_TOKEN);

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

      console.log(out.choices[0].message);
    } catch (e) {
      console.log(e);
    }
  }

  return {
    fetchResponse,
  };
}
