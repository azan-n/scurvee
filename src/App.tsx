import { useState } from "react"
import ColorThief, { RGBColor } from 'colorthief';

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [dominantColors, setDominantColors] = useState<RGBColor[]>([])

  // Handle image upload
  const handleImageUpload = (event: any) => {
    const file = event.target.files[0]
    if (file) {
      const imgFile = URL.createObjectURL(file)
      setImage(imgFile)
      extractDominantColors(file)
    }
  }

  const extractDominantColors = (file: Blob | MediaSource) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const colorThief = new ColorThief()
      const colors = colorThief.getPalette(img)
      if (!colors) {
        throw Error('Palette generation failed.')
      } else {
        setDominantColors(colors)
        console.log(dominantColors);
      }
    }
  }

  return (
    <main className='h-screen bg-slate-900 w-full text-slate-400 border-slate-700'>
      <div className='p-4'>
        <h1 className='font-mono'>scurvee</h1>
        <section className='pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh_-_4rem)]'>
          {/* Upload image, show image, remove image */}
          <div className='border overflow-hidden flex items-center justify-center'>
            {!image ?
              (<label htmlFor="file-upload" className='cursor-pointer'>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className='absolute inset-0 opacity-0'  // Hide the default input
                />
                <div className='bg-slate-700 cursor-pointer text-slate-200 py-3 px-6 rounded-lg hover:bg-slate-600 transition duration-300'>
                  Upload Image
                </div>
              </label>) : null}


            {image ? (
              <img className="object-cover w-full h-full" src={image} alt="" />)
              : (
                null
              )}
          </div>

          {/* MIDI visualizations? */}
          <div className='border'>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
