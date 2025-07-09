import { Container, Heading } from "@radix-ui/themes";
import { MovieFinder } from "../components/MovieFinder/MovieFinder.client";
export const Homepage = () => {
  return (
    <Container size="4" p="2">
      <Heading as="h1" mb="2">What Should I Watch Tonight?</Heading>
      <MovieFinder />
    </Container>
  );
};
