'use client';

import { useState } from "react";
import { Button, TextField } from "@radix-ui/themes";
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
            <form action={onSubmit}>
                <TextField.Root placeholder="Input prompt" />
                <Button type="submit">Let's go</Button>
            </form>

            {currentState === 'loaded' && results.split('\n').map((item, index) => (<p key={`${item}_${index}`}>{item}</p>))}

            <div aria-live="polite">
                {currentState === 'error' && <p>Sorry, something went wrong.</p>}
            </div>
        </>
    );
};
