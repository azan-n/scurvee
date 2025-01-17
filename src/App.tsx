import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className='p-4 bg-slate-900 h-svh w-full text-slate-400'>
      <h1 className='text-sm text-mono'>scurvee</h1>
    </main>
  )
}

export default App
