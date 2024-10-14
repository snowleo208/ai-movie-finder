import { Flex, Text, Button } from "@radix-ui/themes";
import { useAiModal } from "./useAiModel";

export const Homepage = async () => {
  const { fetchResponse } = useAiModal();

  await fetchResponse();

  return (
    <Flex direction="column" gap="2">
      <Text>Hello!</Text>
      <Button>Let's go</Button>
    </Flex>
  );
};
