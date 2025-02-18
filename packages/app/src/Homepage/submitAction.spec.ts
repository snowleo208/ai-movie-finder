import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { submitAction } from "./submitAction";

const server = setupServer(
    http.post("https://router.huggingface.co/hf-inference/models/NousResearch/Hermes-3-Llama-3.1-8B/v1/chat/completions", () => {
        return HttpResponse.json({ "object": "chat.completion", "id": "", "created": 1739909611, "model": "NousResearch/Hermes-3-Llama-3.1-8B", "system_fingerprint": "3.0.1-sha-bb9095a", "choices": [{ "index": 0, "message": { "role": "assistant", "content": "Summer breeze whispers,\nSunlight dances on the grass,\nNature's warm embrace." }, "logprobs": null, "finish_reason": "stop" }], "usage": { "prompt_tokens": 29, "completion_tokens": 17, "total_tokens": 46 } });
    }),
);

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
});

afterAll(() => {
    server.close();
});

describe("submitAction", () => {
    it("returns correctly", async () => {
        const form = new FormData();
        form.append("prompt", "Spring");

        expect(await submitAction(null, form)).toEqual({
            "message": "Summer breeze whispers,\nSunlight dances on the grass,\nNature's warm embrace.",
            "success": true,
        });
    });

    it("returns error", async () => {
        server.use(
            http.post("https://router.huggingface.co/hf-inference/models/NousResearch/Hermes-3-Llama-3.1-8B/v1/chat/completions", () => {
                return new HttpResponse(null, { status: 500 })
            }),
        )
        const form = new FormData();
        form.append("prompt", "Spring");

        expect(await submitAction(null, form)).toEqual({
            "message": "Something went wrong.",
            "success": false,
        });
    });
});
