"use client";

import { Flex, Callout, Spinner, Separator, VisuallyHidden } from "@radix-ui/themes";

import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import { MarkdownComponent } from "../MarkdownComponent/MarkdownComponent.client";
import { MovieSelectBar } from "../MovieSelectBar/MovieSelectBar.client";
import { LIST_OF_HOURS } from "../constants";

export const MovieFinder = () => {
  const [selectedHour, setSelectedHour] = useState<keyof typeof LIST_OF_HOURS>("2hr");
  const [selectedGenre, setSelectedGenre] = useState("Mystery");

  const { isLoading, stop, completion, error, setInput, handleSubmit } = useCompletion({
    api: '/api/completion',
    initialInput: JSON.stringify({ hour: LIST_OF_HOURS[selectedHour], genre: selectedGenre }),
  });

  const isValidHour = (hour: string): hour is keyof typeof LIST_OF_HOURS => {
    return Object.keys(LIST_OF_HOURS).includes(hour);
  }

  const onHourChange = (hour: string) => {
    if (!isValidHour(hour)) {
      console.error(`Invalid hour selected: ${hour}`);
      return;
    }

    setSelectedHour(hour);
    setInput(JSON.stringify({ hour: LIST_OF_HOURS[hour], genre: selectedGenre }));
  };

  const onGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setInput(JSON.stringify({ hour: LIST_OF_HOURS[selectedHour], genre: genre }));
  };

  return (
    <>
      <MovieSelectBar
        isLoading={isLoading}
        onGenreChange={onGenreChange}
        onHourChange={onHourChange}
        onStop={stop}
        onSubmit={handleSubmit}
      />

      <Separator my="3" size="4" />

      <Flex gap="2">
        {isLoading && !completion && <div>
          <Spinner />
          <VisuallyHidden>Loading...</VisuallyHidden>
        </div>}

        {completion && (
          <Flex direction="column" gap="2" data-testid="completion">
            {completion.split("\n").map((item, index) => (
              <MarkdownComponent content={item} key={`${item}_${index}`} />
            ))}
          </Flex>
        )}
      </Flex>

      <div aria-live="polite">
        {!isLoading && error && (
          <Callout.Root color="red">
            <Callout.Text>
              {error.message.includes('limit') ? 'You have reached the limit of requests.' : 'Sorry, something went wrong.'}
            </Callout.Text>
          </Callout.Root>
        )}
      </div>
    </>
  );
};
