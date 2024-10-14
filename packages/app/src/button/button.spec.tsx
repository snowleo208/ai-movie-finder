import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button, ButtonProps } from "./button";

afterEach(() => {
  jest.clearAllMocks();
});

const defaultProps: ButtonProps = {
  children: "Button here",
};

const renderComponent = (additionalProps: Partial<ButtonProps> = {}) => {
  const props = { ...defaultProps, ...additionalProps };
  return render(<Button {...props} />);
};

describe("Button", () => {
  it("Renders correctly", () => {
    renderComponent();
    expect(
      screen.getByRole("button", { name: "Button here" })
    ).toBeInTheDocument();
  });
});
