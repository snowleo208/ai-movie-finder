import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { waitFor } from "@testing-library/react";

import { submitAction } from "./submitAction";

export const server = setupServer(
  http.get("https://example.com/user", () => {
    // ...and respond to them using this JSON response.
    return HttpResponse.json({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
      firstName: "John",
      lastName: "Maverick",
    });
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

    await waitFor(() => {
      expect(submitAction(null, form)).toEqual({});
    });
  });
});
