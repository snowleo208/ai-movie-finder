import { Flex } from "@radix-ui/themes";
import { PromptBar } from "../components/PromptBar.client";

export const Homepage = async () => {
  return (
    <Flex direction="column" gap="2">
      <PromptBar />
    </Flex>
  );
};
