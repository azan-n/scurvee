import  { useState } from "react";
import * as Tone from "tone";

interface MidiNotesPlayerProps {
  notes: number[];
}

export function MidiNotesPlayer({ notes }: MidiNotesPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);


  const playNotes = async () => {
    if (!Array.isArray(notes) || notes.length === 0) {
        console.error("No notes to play");
        return;
      }
    await Tone.start(); // Make sure Tone.js context starts
    const synth = new Tone.Synth().toDestination(); // Create a synth

    // Play notes in sequence
    const now = Tone.now();
    notes.forEach((note, index) => {
      const noteName = Tone.Frequency(note, "midi").toNote(); // Convert MIDI to note name
      synth.triggerAttackRelease(noteName, "8n", now + index * 0.25); // Play the note
    });
  };

  const togglePlay = async () => {
    if (!isPlaying) {
      await playNotes();
    }
    setIsPlaying(!isPlaying); // Toggle play/pause
  };

  return (
    <div>
      <button onClick={togglePlay}>
        {isPlaying ? "Stop Playing" : "Start Playing"}
      </button>
    </div>
  );
};