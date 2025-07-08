import { render, screen } from "@testing-library/react";
import { Homepage } from "./Homepage";
import { Theme } from "@radix-ui/themes";

const renderComponent = () => {
    return render(
        <Theme
            accentColor="pink"
            grayColor="mauve"
            radius="large"
            scaling="100%"
        ><Homepage />
        </Theme>);
};

describe("Homepage", () => {
    it("renders the homepage correctly", async () => {
        renderComponent()

        expect(screen.getByRole("heading", { name: 'What Should I Watch? Ask the AI', level: 1 })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: 'Submit' })).toBeInTheDocument();
    });
});
