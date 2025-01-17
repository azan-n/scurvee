import { useEffect, useState } from 'react';
import { Chuck } from 'webchuck';

const ChucKPlayer: React.FC = () => {
    const [chuck, setChuck] = useState<Chuck | null>(null); // State to store the ChucK object
    const [isInitializing, setIsInitializing] = useState<boolean>(false); // State to track initialization
    const [isPlaying, setIsPlaying] = useState<number | null>(null); // State to track play/pause status

    const initializeChucK = async () => {
        setIsInitializing(true); // Set initializing state to true while ChucK is loading
        try {
            // Initialize the ChucK object
            const chuck = await Chuck.init([]);
            setChuck(chuck); // Store the ChucK object in state
        } catch (error) {
            alert(`Error initializing ChucK: ${error}`);
        } finally {
            setIsInitializing(false); // Set initializing state to false once initialization is done
        }
    };


    const run = async () => {
        if (chuck && !isPlaying) {
            chuck.setIntArray("mel", [0,2,3,1,4,2,6,3,4,4])
            // Run the ChucK code to produce sound if it's not already playing
            setIsPlaying(await chuck.runCode(`
global int mel[10]; //sequence data
StifKarp inst => dac;
[0,2,4,5,7,9,11,12] @=> int major[]; //major scale

for (0=>int i; true ; i++) { //infinite loop
  Std.mtof( 48 + major[mel[i%mel.cap()]] ) => inst.freq; //set the note
  inst.noteOn( 0.5 ); //play a note at half volume
  300::ms => now; //compute audio for 0.3 sec
}
      `));
        }
    };

    const stop = async () => {
        if (chuck && isPlaying) {
            // Stop the currently running ChucK code if it's playing
            await chuck.removeShred(isPlaying); // Disconnect from DAC to stop sound
            setIsPlaying(null); // Set the state to paused
        }
    };

    return (
        <div>
            {/* Button to initialize ChucK */}
            {!chuck ? (
                <button onClick={() => { initializeChucK() }}
                    disabled={isInitializing}>
                    {isInitializing ? 'Initializing' : 'Get started!'}
                </button>
            ) : (
                <>
                    {/* Play/Pause Button */}
                    <button
                        onClick={isPlaying != null ? stop : run}
                        disabled={isInitializing} // Disable when ChucK is being initialized
                    >
                        {isPlaying != null ? 'Pause' : 'Play'}
                    </button>
                </>
            )}
        </div>
    );
};

export default ChucKPlayer;
