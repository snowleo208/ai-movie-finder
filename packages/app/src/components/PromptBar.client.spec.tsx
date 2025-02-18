import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PromptBar } from "./PromptBar.client";

afterEach(() => {
    jest.clearAllMocks();
});

const renderComponent = () => {
    return render(<PromptBar />);
};

describe("Prompt Bar", () => {
    it("Renders correctly", () => {
        renderComponent();
        expect(
            screen.getByRole("button", { name: "Generate" }),
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText('Input prompt'),
        ).toBeInTheDocument();
    });
});
