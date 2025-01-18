import { Bezier } from "bezier-js";
import { useState } from "react";
// import Midi from "./MidiControls";
import { MidiControls } from "./MidiControls";

import synthPlaybackTest from "./SynthPlaybackTest";
import { MidiNotesPlayer } from "./MidiNotesPlayer";



interface Point {
  x: number;
  y: number;
}

const POINT_RADIUS = 10;
const BezierCurve: React.FC = () => {

  const [midiParams, setMidiParams] = useState({
    key: "C",
    scale: "major",
    octaveOffset: 0,
  });
  // Control points and dragging state
  const [controlPoints, setControlPoints] = useState<Point[]>([
    { x: 10, y: 500 },
    { x: 200, y: 100 },
    { x: 400, y: 100 },
    { x: 790, y: 500 },
  ]);

  const [generatedNotes, setGeneratedNotes] = useState<Number[]>([]);

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

  const handleMidiParamUpdate = (key: string, value: any) => {
    setMidiParams((prev) => ({ ...prev, [key]: value }));
    updateMidiLogic(key, value); // Call the JS logic
  };

  const updateMidiLogic = (key: string, value: any) => {
    console.log(`Updating ${key} to`, value);
    synthPlaybackTest.updateMidiOptions(key, value); // Call the function from JS
    const notes: Number[] = synthPlaybackTest.regenerateMidi();    
    console.log("Generated Notes:", notes); // Debugging

    setGeneratedNotes(notes); // Update the state with the notes
  };

  const handleDownload = () => {
    const midiUrl = synthPlaybackTest.regenerateMidi();
    const link = document.createElement("a");
    link.href = midiUrl;
    link.download = `pattern_${Math.floor(Math.random() * 100000)}.mid`;
    link.click();
    URL.revokeObjectURL(midiUrl);
  };


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
      return <MidiControls onUpdate={handleUpdate} onDownload={handleDownload} />;
      {/* <BezierCurve /> */}
      <MidiNotesPlayer notes={generatedNotes || []} />
    </>
  );
};

export default BezierCurve;



