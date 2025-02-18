import { Flex, Text } from "@radix-ui/themes";
import { PromptBar } from "./PromptBar.client";

export const Homepage = async () => {
  return (
    <Flex direction="column" gap="2">
      <Text>Hello!</Text>
      <PromptBar />
    </Flex>
  );
};
