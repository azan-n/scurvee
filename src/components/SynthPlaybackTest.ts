import { Midi } from "@tonejs/midi";
import { Bezier } from "bezier-js";
import * as fs from 'node:fs/promises'

let octaves: number = 1;
let range: number = octaves * 12;
let clipLength: number = 16;
let steps: number = 150;
let startX: number = 0;
let startY: number = 0;
let startControlX: number = clipLength;
let startControlY: number = 0;
let endControlX: number = 0;
let endControlY: number = range;
let endX: number = clipLength;
let endY: number = range;

// Define the structure of the `options` object
interface Options {
  duration: number;
  bpm: number;
  scale: string;
  rootNote: number;
  minMidi: number;
  maxMidi: number;
  chordType: string;
  octaveOffset?: number; 
  startCtrlX: number;
  startCtrlY: number,
  endCtrlX: number,
  endCtrlY: number,
  startY: number,
  endY: number,
}

const scales: { [key: string]: number[] } = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  triads: [0, 4, 7],
  minor7thchord: [0, 3, 7, 10],
  perfectFourths: [0, 5, 10],
  superUltraHyperMegaMetaLydian: [],
};

let pattern: number[] = [];
let start: number = 0;
pattern.push(start);
while (start + 6 <= 127) {
  for (let i = 0; i < 3; i++) {
    start += 2;
    pattern.push(start);
  }
  start++;
  pattern.push(start);
}
scales.superUltraHyperMegaMetaLydian = pattern;

function generateNoteArray(root: number, scale: string): number[] {
  const intervals = scales[scale];
  const notes: number[] = [];
  for (let i = root; i <= 127; i++) {
    if (intervals.includes((i - root) % 12)) {
      notes.push(i);
    }
  }
  return notes;
}

function quantizeToScale(note: number, scaleArray: number[]): number {
  for (let i = note; i <= 127; i++) {
    if (scaleArray.includes(i)) {
      return i;
    }
  }
  return note; // Return original note if no match found
}

function findClosestIndex(array: number[], target: number): number {
  if (array.length === 0) {
    throw new Error("Array is empty");
  }

  let closestIndex = 0;
  let closestDifference = Math.abs(array[0] - target);

  for (let i = 1; i < array.length; i++) {
    let currentDifference = Math.abs(array[i] - target);
    if (currentDifference < closestDifference) {
      closestDifference = currentDifference;
      closestIndex = i;
    }
  }

  return closestIndex;
}

// MIDI generation object
const synthPlaybackTest = {
  options: {
    duration: 10,
    bpm: 860,
    scale: "minor",
    rootNote: 0,
    minMidi: 0,
    maxMidi: 127,
    chordType: "triads",
    octaveOffset: 0, // Default value
    startCtrlX: 0,
    startCtrlY: 0,
    endCtrlX: 0,
    endCtrlY: 0,
    startY: 0,
    endY: 0
  } as Options,

  updateMidiOptions(key: string, value: any) {
    if (key === "key") {
      this.options.rootNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(value);
    } else if (key === "scale") {
      this.options.scale = value;
    } else if (key === "octaveOffset") {
      this.options.octaveOffset = value;
    }
    else if (key == "startCtrlX") {
      this.options.startCtrlX = value;
    }
    else if (key = "startCtrlY") {
      this.options.startCtrlY = value;
    }
    else if (key = "endCtrlX") {
      this.options.endCtrlX = value;
    }
    else if (key = "endCtrlY") {
      this.options.endCtrlY = value;
    }
    else if (key === "startY") {
      const originalStartMin = 0; 
      const originalStartMax = 100; 
      const targetMin = 0;
      const targetMax = 127;
      const scaledStartValue = ((value - originalStartMin) / (originalStartMax - originalStartMin)) * (targetMax - targetMin) + targetMin;
      this.options.startY = Math.round(scaledStartValue); 
    } else if (key === "endY") {
      const originalEndMin = 0; 
      const originalEndMax = 100; 
      const targetMin = 0;
      const targetMax = 127;
      const scaledEndValue = ((value - originalEndMin) / (originalEndMax - originalEndMin)) * (targetMax - targetMin) + targetMin;
    
      this.options.endY = Math.round(scaledEndValue); 
    }
    
    this.regenerateMidi();
  },

  regenerateMidi(): Number[] {

    // const curve = new Bezier(
    //   startX,
    //   this.options.startY,
    //   this.options.startCtrlX,
    //   this.options.startCtrlY,
    //   this.options.endCtrlX,
    //   this.options.endCtrlY,
    //   endX,
    //   this.options.endY
    // );

        const curve = new Bezier(
      0,
      startY,
      16,
      0,
      0,
      127,
      16,
      127
    );

    console.log(curve, "curveee")
    
    let curvePointsX: number[] = [];
    let curvePointsY: number[] = [];
    for (let t = 0; t <= 1; t += 0.001) {
      const point = curve.get(t);
      curvePointsX.push(point.x);
      curvePointsY.push(point.y);
    }
    const scaleNotes = generateNoteArray(this.options.rootNote, this.options.scale);
    const octaveShift =  (this.options.octaveOffset ?? 0) * 12;
    const incrementedArray = curvePointsY.map((value) => value + octaveShift);
    const newCurve = incrementedArray.map((note) =>
      quantizeToScale(parseInt(note.toString()), scaleNotes)
    );

    const midi = new Midi();
    const track = midi.addTrack();
    let time = 0;
    const noteDuration = clipLength / steps;
    const generatedNotes: number[] = [];


    for (let step = 0; step < steps; step++) {
      console.log(newCurve, "newcurve")
      const midiNote = newCurve[findClosestIndex(curvePointsX, time)];
      const closestIndex = findClosestIndex(curvePointsX, time);
      console.log("Closest Index:", closestIndex, "Value:", curvePointsX[closestIndex]);

      generatedNotes.push(parseInt(midiNote.toString()))
      track.addNote({
        midi: midiNote,
        time: time,
        duration: noteDuration,
        velocity: 0.8,
      });
      time += noteDuration;
    }
    console.log("MIDI regenerated!");
    // console.log("generated_notes", generatedNotes)

    const midiData = midi.toArray();
    fs.writeFile("custom-quantized-midi-test-1.mid", Buffer.from(midiData));
    return generatedNotes;
  },
};


// const midi = new Midi();



export default synthPlaybackTest;
