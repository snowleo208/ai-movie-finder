"use client";

import { Button, Flex, Select } from "@radix-ui/themes";
import { LIST_OF_GENRES, LIST_OF_HOURS } from "../constants";

export type MovieSelectBarProps = {
  isLoading: boolean;
  onStop: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGenreChange: (genre: string) => void;
  onHourChange: (hour: string) => void;
};

export const MovieSelectBar = ({
  isLoading,
  onStop,
  onSubmit,
  onGenreChange,
  onHourChange,
}: MovieSelectBarProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Flex gap="2">
          <Select.Root defaultValue="Mystery" onValueChange={onGenreChange}>
            <Select.Trigger aria-label="Select genre" />
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

          <Select.Root defaultValue="2hr" onValueChange={onHourChange}>
            <Select.Trigger aria-label="Select length" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Select length</Select.Label>
                {LIST_OF_HOURS && Object.entries(LIST_OF_HOURS).map(([hour, label]) => (<Select.Item key={hour} value={hour}>{label}</Select.Item>))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Button type="submit" disabled={isLoading}>
            Ask
          </Button>
          <Button onClick={onStop} disabled={!isLoading}>Stop</Button>
        </Flex>
      </form>
    </>
  );
};
