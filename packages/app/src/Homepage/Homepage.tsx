import { Flex, Text } from "@radix-ui/themes";
import { PromptBar } from "../components/PromptBar.client";

export const Homepage = async () => {
  return (
    <Flex direction="column" gap="2">
      <Text>Hello!</Text>
      <PromptBar />
    </Flex>
  );
};
