import BezierCurve from "./components/BezierCurve";
import ChucKPlayer from "./components/Chuck";

function App() {
  return (
    <main className='h-screen bg-slate-900 w-full text-slate-400 border-slate-700'>
      <div className='p-4'>
        <h1 className='font-mono'>scurvee</h1>
        <section className='pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh_-_4rem)]'>
          {/* Upload image, show image, remove image */}
          <div className='border overflow-hidden flex items-center justify-center'>
            <ChucKPlayer></ChucKPlayer>
          </div>

          {/* MIDI visualizations? */}
          <div className='border'>
            <BezierCurve></BezierCurve>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
