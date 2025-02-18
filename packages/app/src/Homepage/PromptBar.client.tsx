'use client';

import { useActionState } from "react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { submitAction, type Results } from "./submitAction.ts";

export const PromptBar = () => {
    const [results, onSubmit, isPending] = useActionState<Results, FormData>(submitAction, null);
    const hasData = results?.success && results.message;

    return (
        <>
            <form action={onSubmit}>
                <Flex gap="2">
                    <TextField.Root placeholder="Input prompt" name="prompt" />
                    <Button type="submit">Generate</Button>
                </Flex>
            </form>

            <div>
                {isPending && <Text as="p">Loading...</Text>}

                {!isPending && hasData && <div>
                    <Text as="p"><strong>Results: </strong></Text>
                    {results.message.split('\n').map((item, index) => (
                        <Text as="p" key={`${item}_${index}`}>{item}</Text>
                    ))}
                </div>}
            </div>

            <div aria-live="polite">
                {!isPending && results?.success === false && <Text as="p" color="tomato" size="2">Sorry, something went wrong.</Text>}
            </div>
        </>
    );
};
