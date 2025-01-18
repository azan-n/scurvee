import BezierCurve from "./components/BezierCurve";

function App() {
  return (
    <main className='h-screen bg-slate-900 w-full text-slate-400 border-slate-700'>
      <div className='p-4'>
        <h1 className='font-mono'>scurvee</h1>
        <section className='pt-4 h-[calc(100vh_-_4rem)]'>
          {/* MIDI visualizations? */}
          <BezierCurve/>
          <div className='border h-full'>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
