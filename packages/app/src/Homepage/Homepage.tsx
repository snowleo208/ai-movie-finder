import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { PromptBar } from "../components/PromptBar.client";

export const Homepage = () => {
  return (
    <Container size="4" p="2">
      <Heading as="h1" mb="2">What Should I Watch Tonight?</Heading>
      <PromptBar />
    </Container>
  );
};
