import { Bezier } from "bezier-js";
import { useEffect, useState } from "react";
import * as Tone from "tone";

interface Point {
  x: number;
  y: number;
}

const POINT_RADIUS = 10;
const BezierCurve: React.FC = () => {
  // Control points and dragging state
  const [controlPoints, setControlPoints] = useState<Point[]>([
    { x: 10, y: 500 },
    { x: 200, y: 100 },
    { x: 400, y: 100 },
    { x: 790, y: 500 },
  ]);

  const generateBezier = () => {
    return new Bezier(controlPoints);
  }

  const [dragging, setDragging] = useState<number | null>(null); // Index of the point being dragged
  const [dragOffset, setDragOffset] = useState<[number, number] | null>(null); // Offset of mouse from control point

  // Function to generate Bézier path data
  const generateBezierPath = (): string => {
    const p0 = controlPoints[0];
    const p1 = controlPoints[1];
    const p2 = controlPoints[2];
    const p3 = controlPoints[3];
    return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
  };

  // Mouse events for dragging control points
  const onMouseDown = (e: React.MouseEvent<SVGElement, MouseEvent>, index: number) => {
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    setDragging(index); // Start dragging this control point
    setDragOffset([mouseX - controlPoints[index].x, mouseY - controlPoints[index].y]); // Store offset
  };

  const onMouseMove = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    if (dragging === null) return;

    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    const [offsetX, offsetY] = dragOffset!;

    const newControlPoints = [...controlPoints];
    if (dragging === 0 || dragging === controlPoints.length - 1) {
      // If dragging the first or last point, only update the y-coordinate
      newControlPoints[dragging] = {
        x: controlPoints[dragging].x, // Keep the x-coordinate fixed
        y: mouseY - offsetY,          // Update the y-coordinate
      };
    } else {
      // For all other points, update both x and y coordinates
      newControlPoints[dragging] = {
        x: mouseX - offsetX,
        y: mouseY - offsetY,
      };
    }
    setControlPoints(newControlPoints); // Update control points
  };

  const onMouseUp = () => {
    setDragging(null); // Stop dragging
  };

  const [bezier, setBezier] = useState<Bezier>(generateBezier());

  useEffect(() => {
    setBezier(generateBezier())
  }, [controlPoints])

  return (
    <>

      <svg
        className="h-full w-full"
        viewBox="0 0 800 600"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Bézier curve path */}
        <path
          d={generateBezierPath()}
          className="stroke-slate-400"
          fill="transparent"
          strokeWidth="2"
        />

        {controlPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={POINT_RADIUS}
            className="fill-slate-300"
            onMouseDown={(e) => onMouseDown(e, index)}
          />
        ))}

        {controlPoints.slice(0, -1).map((point, index) => {
          const nextPoint = controlPoints[index + 1];
          return (
            <line
              key={index}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              className="stroke-slate-600"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <MidiNotesPlayer bezier={bezier} />
    </>
  );
};

export default BezierCurve;

import React from 'react';

export function MidiNotesPlayer({ bezier }: { bezier: Bezier }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState<Tone.Loop>();
  const [synth, setSynth] = useState<Tone.Synth>();

  // Function to play the notes using Tone.js
  const playNotes = () => {
    Tone.start().then(() => {
      const synth = new Tone.Synth().toDestination();
      setSynth(synth);

      const loop = new Tone.Loop(getLoopCallback(bezier, synth), "4n");
      loop.start()

      setLoop(loop)
      // all loops start when the Transport is started
      Tone.getTransport().start()
      setIsPlaying(true); // Toggle the play/pause state
    });
  };

  useEffect(() => {
    if (loop && isPlaying && synth) {
      loop.callback = getLoopCallback(bezier, synth);
    }
  }, [bezier])

  const togglePlay = async () => {
    if (!isPlaying) {
      playNotes();
    } else {
      synth?.dispose()
      loop?.dispose()
      Tone.getTransport().stop();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <button className="font-mono" onClick={togglePlay}>
        {isPlaying ? 'stop' : 'start'}
      </button>
    </div>
  );
};

function getLoopCallback(bezier: Bezier, synth: Tone.Synth<Tone.SynthOptions>): ((time: Tone.Unit.Seconds) => void) {
  return (time) => {
    const lut = bezier.getLUT(4);
    synth?.triggerAttackRelease(lut[randomInt(0, lut.length - 1)].y, "8n", time);
  };
}

function randomInt(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}
