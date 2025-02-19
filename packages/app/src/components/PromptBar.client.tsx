"use client";

import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useCompletion } from "@ai-sdk/react";

export const PromptBar = () => {
  const { isLoading, completion, error, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/completion',
  });

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Flex gap="2">
          <TextField.Root placeholder="Input prompt" name="prompt" onChange={handleInputChange} />
          <Button type="submit">Generate</Button>
        </Flex>
      </form>

      <div>
        {isLoading && <Text as="p">Loading...</Text>}

        {!isLoading && completion && (
          <div>
            <Text as="p">
              <strong>Results: </strong>
            </Text>
            {completion.split("\n").map((item, index) => (
              <Text as="p" key={`${item}_${index}`}>
                {item}
              </Text>
            ))}
          </div>
        )}
      </div>

      <div aria-live="polite">
        {!isLoading && error && (
          <Text as="p" color="tomato" size="2">
            Sorry, something went wrong.
          </Text>
        )}
      </div>
    </>
  );
};
