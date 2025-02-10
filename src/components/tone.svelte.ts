import * as Tone from "tone";

export const TONE_STATE = $state({
    initializing: false,
    initialized: false
});


export async function initializeTone() {
    TONE_STATE.initializing = true;
    await Tone.start();
    TONE_STATE.initializing = false;
    TONE_STATE.initialized = true;
}