import { useState } from "react";

interface Point {
  x: number;
  y: number;
}

const BezierCurve: React.FC = () => {
  // Control points and dragging state
  const [controlPoints, setControlPoints] = useState<Point[]>([
    { x: 100, y: 500 },
    { x: 200, y: 100 },
    { x: 400, y: 100 },
    { x: 500, y: 500 },
  ]);

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
    newControlPoints[dragging] = {
      x: mouseX - offsetX,
      y: mouseY - offsetY,
    };
    setControlPoints(newControlPoints); // Update control points
  };

  const onMouseUp = () => {
    setDragging(null); // Stop dragging
  };

  return (
    <div>
      <svg
        className=""
        viewBox="0 0 800 600"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Bézier curve path */}
        <path
          d={generateBezierPath()}
          stroke="white"
          fill="transparent"
          strokeWidth="2"
        />
        
        {controlPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={10}
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
      <p>{JSON.stringify(controlPoints)}</p>
    </div>
  );
};

export default BezierCurve;
