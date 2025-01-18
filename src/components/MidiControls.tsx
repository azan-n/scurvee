import React, { useState } from "react";

interface MidiControlsProps {
  onUpdate: (key: string, value: any) => void;
}

export const MidiControls: React.FC<MidiControlsProps> = ({ onUpdate }) => {
  const [key, setKey] = useState("C");
  const [scale, setScale] = useState("major");
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [clipLength, setClipLength] = useState(16);
  const [steps, setSteps] = useState(150);

  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKey(e.target.value);
    onUpdate("key", e.target.value);
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScale(e.target.value);
    onUpdate("scale", e.target.value);
  };

  const handleOctaveOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setOctaveOffset(value);
    onUpdate("octaveOffset", value);
  };

  const handleClipLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setClipLength(value);
    onUpdate("clipLength", value);
  };

  const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSteps(value);
    onUpdate("steps", value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
      <label>
        Key:
        <select value={key} onChange={handleKeyChange}>
          {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>

      <label>
        Scale:
        <select value={scale} onChange={handleScaleChange}>
          {["major", "minor", "mixolydian", "dorian", "triads", "minor7thchord"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        Octave Offset:
        <input
          type="range"
          min="-2"
          max="2"
          value={octaveOffset}
          onChange={handleOctaveOffsetChange}
        />
        {` ${octaveOffset}`}
      </label>

      <label>
        Clip Length:
        <select value={clipLength} onChange={handleClipLengthChange}>
          {[4, 8, 16, 32, 64].map((length) => (
            <option key={length} value={length}>
              {length}
            </option>
          ))}
        </select>
      </label>

      <label>
        Steps:
        <input
          type="range"
          min="0"
          max="300"
          value={steps}
          onChange={handleStepsChange}
        />
        {` ${steps}`}
      </label>
    </div>
  );
};
