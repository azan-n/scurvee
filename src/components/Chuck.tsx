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
            // Run the ChucK code to produce sound if it's not already playing
            setIsPlaying(await chuck.runCode(`
        SinOsc sin => dac;
        440 => sin.freq;
        1::week => now;
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
