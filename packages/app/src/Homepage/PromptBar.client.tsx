'use client';

import { useState } from "react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { fetchResponse } from "./useAiModel.ts";

type CurrentState = 'empty' | "loaded" | "error" | "loading";

export const PromptBar = () => {
    const [results, setResults] = useState('');
    const [currentState, setCurrentState] = useState<CurrentState>('empty');
    const onSubmit = async () => {
        try {
            setCurrentState('loading')
            const data = await fetchResponse();

            if (!data.success) {
                throw Error('Something went wrong.')
            }

            setResults(data.message);
            setCurrentState('loaded')
        } catch (e) {
            console.log(e)
            setCurrentState('error')
        }
    }

    return (
        <>
            {/* @ts-ignore: for server action even with types/react@18.3, see if can be fixed properly? */}
            <form action={onSubmit}>
                <Flex gap="2">
                    <TextField.Root placeholder="Input prompt" />
                    <Button type="submit">Generate</Button>
                </Flex>
            </form>

            {currentState === 'loaded' && <div>
                <Text as="p"><strong>Results: </strong></Text>
                {results.split('\n').map((item, index) => (<Text as="p" key={`${item}_${index}`}>{item}</Text>))}
            </div>}

            <div aria-live="polite">
                {currentState === 'error' && <Text as="p" color="tomato" size="2">Sorry, something went wrong.</Text>}
            </div>
        </>
    );
};
