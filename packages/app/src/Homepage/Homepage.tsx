import { Flex } from "@radix-ui/themes";
import { PromptBar } from "../components/PromptBar.client";

export const Homepage = () => {
  return (
    <Flex direction="column" gap="2">
      <h1>What Should I Watch? Ask the AI</h1>
      <PromptBar />
    </Flex>
  );
};
