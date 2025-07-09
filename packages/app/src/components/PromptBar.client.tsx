"use client";

import { Button, Flex, Text, Select } from "@radix-ui/themes";

import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import { MarkdownDisplay } from "./MarkdownText.client";

const LIST_OF_GENRES = ['Mystery', 'Comedy', 'Drama', 'Action', 'Horror', 'Sci-Fi', 'Romance'];

const LIST_OF_HOURS = {
  "1hr": "1 hour",
  "2hr": "2 hours",
  "2hr-more": "2 hours+",
}

export const PromptBar = () => {
  const [selectedHour, setSelectedHour] = useState<keyof typeof LIST_OF_HOURS>("2hr");
  const [selectedGenre, setSelectedGenre] = useState("Mystery");

  const { isLoading, stop, completion, error, setInput, handleSubmit } = useCompletion({
    api: '/api/completion',
    initialInput: JSON.stringify({ hour: LIST_OF_HOURS[selectedHour], genre: selectedGenre }),
  });

  const isValidHour = (hour: string): hour is keyof typeof LIST_OF_HOURS => {
    return Object.keys(LIST_OF_HOURS).includes(hour);
  }

  const handleHourChange = (hour: string) => {
    if (!isValidHour(hour)) {
      console.error(`Invalid hour selected: ${hour}`);
      return;
    }

    setSelectedHour(hour);
    setInput(JSON.stringify({ hour: LIST_OF_HOURS[hour], genre: selectedGenre }));
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setInput(JSON.stringify({ hour: selectedHour, genre: genre }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Flex gap="2">
          <Select.Root defaultValue="Mystery" onValueChange={handleGenreChange}>
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Label>Select genre</Select.Label>
                {LIST_OF_GENRES.map((genre) => (
                  <Select.Item key={genre} value={genre}>
                    {genre}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Select.Root defaultValue="2hr" onValueChange={handleHourChange}>
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Label>Select length</Select.Label>
                {LIST_OF_HOURS && Object.entries(LIST_OF_HOURS).map(([hour, label]) => (<Select.Item key={hour} value={hour}>{label}</Select.Item>))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
          <Button onClick={stop} disabled={!isLoading}>Stop</Button>
        </Flex>
      </form>

      <div>
        {isLoading && !completion && <Text as="p">Loading...</Text>}

        {completion && (
          <div data-testid="completion">
            {completion.split("\n").map((item, index) => (
              <MarkdownDisplay content={item} key={`${item}_${index}`} />
            ))}
          </div>
        )}
      </div>

      <div aria-live="polite">
        {!isLoading && error && (
          <Text as="p" color="tomato" size="2">
            {error.message.includes('limit') ? 'You have reached the limit of requests.' : 'Sorry, something went wrong.'}
          </Text>
        )}
      </div>
    </>
  );
};
