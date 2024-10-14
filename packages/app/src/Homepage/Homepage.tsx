import { Flex, Text, Button } from "@radix-ui/themes";
// import { fetchResponse } from "./useAiModel.ts";
import { PromptBar } from "./PromptBar.client.tsx";

export const Homepage = async () => {
  return (
    <Flex direction="column" gap="2">
      <Text>Hello!</Text>
      <PromptBar />
    </Flex>
  );
};
