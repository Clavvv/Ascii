'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Video } from "./Video.js";

export default function Home() {

  const [selected, setSelected] = useState(1)
  const [fileError, setFileError]= useState(false)
  const [asciiArt, setAsciiArt]= useState(null)

  const videoProcessorRef= useRef(null)

  const isSelected= "border bg-zinc-600 rounded-md mx-2 p-1 border-purple-700 justify-center place-self-center text-white"
  const notSelected= "border border-zinc-900 rounded-md mx-2 p-1 justify-center place-self-center "

  const brightnessToAscii = (levels) => {

    const asciiChars= '@%#*+=-:. '.split('').reverse()

    const sum= (levels[0] * 0.299) + (levels[1] * 0.587) + (levels[2] * 0.114) //floats are perceived brightness for each color
    const brightness= sum / 255                                                 //normalizing the brightness to 0 and 1

    return asciiChars[Math.floor(brightness * (asciiChars.length - 1))]         //selecting the ascii char based on brightness

  }
  const convertToAscii = (imageData) => {

    let asciiImage= ''

    const { data, width, height }= imageData

    for (let i= 0; i < height; i += 4){                                       //We skip every other row because ascii chars too tall

      for (let j= 0; j < width; j += 2) {

        const offset= (i * width + j) * 4                                     //image array is 1-dimensional. So i = row, j = column, * 4 bc there are 4 values per pixel
        const r= data[offset]
        const g= data[offset + 1]
        const b= data[offset + 2]
        const values= [r, g, b]

        asciiImage+= brightnessToAscii(values)

    }
    asciiImage+= '\n'

  }
  return asciiImage
}

  
  const handleSelected = (e) => {

    e.preventDefault()

    if (e.target.id === "Upload") {
      setSelected(1)
    } else {
      setSelected(2)
    }

  }

  const handleImageUpload = (e) => {


    e.preventDefault()

    const file= e.target.files[0]
    const reader= new FileReader()

    if (!file) {

      setFileError(true)
      return

    } else if ((file.type !== 'image/jpeg' && file.type !== 'image/png') || file.size > 100000000 ) {

      setFileError(true)
      return 

    } else {

      setAsciiArt(null)
      setFileError(false);
        reader.onload = async (e) => {
            const image = new Image()
            image.onload = async () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')


                canvas.width = image.width
                canvas.height = image.height

                ctx.drawImage(image, 0, 0)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const asciiImage = convertToAscii(imageData)

                setAsciiArt(asciiImage)
            }
            image.src = e.target.result
        };
        reader.readAsDataURL(file)

    }
  }

  const handleVideoUpload = async (e) => {

    e.preventDefault()

    const file= e.target.files[0]

    if (!file) {

      setFileError(true)
      return
    } else if (file.type !== 'video/mp4') {

      setFileError(true)
      return

    }

    const reader= new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (e) => {

      console.log(e.target.result)
      const videoPlayer= new Video(e.target.result)

      videoPlayer.addFrameListener((frame) => {
        
        const asciiString= convertToAscii(frame)
        setAsciiArt(asciiString)
      })


    videoPlayer.start()

    }

  }
  



  return (
    <main className="flex grow min-h-screen min-w-screen flex-col items-center pt-14 px-14 bg-zinc-900 overflow-hidden">

      <p>
        <span className= "text-4xl tracking-widest font-bold italic font-system-ui bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          A
        </span>
        <span className= "text-2xl font-semibold tracking-widest font-system-ui bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          scii
        </span>
      </p>

      <div className= "flex-col grow items-center justify-center p-10">

        <div id= "types" className= 'flex flex-row my-5 justify-center'>

          {selected === 1 ? (<button id= "Upload" onClick= {(e) => handleSelected(e)} className= {isSelected}>Upload</button>) : (
          <button id= "Upload" onClick= {(e)=> handleSelected(e)} className= {notSelected}>Upload</button>)}

          {selected === 2 ? (<button id= "Webcam" onClick= {(e)=> handleSelected(e)} className= {isSelected}>Webcam</button>) : (<button id= "Webcam" onClick= {(e)=> handleSelected(e)} className= {notSelected}>Webcam</button>)}


        </div>
        {selected === 1 ? (
        <section className= "flex-row w-full h-full">
          
          
          <input className= "hidden" type= "file" id= "image-input" accept="image/*" onChange= {handleImageUpload}>
          </input>

          <input className= "hidden" type= "file" id= "video-input" accept="video/*" onChange= {handleVideoUpload}>
          </input>

          <ul className= "flex flex-row justify-center">

            <li className= "rounded-md m-2 px-3 py-1 justify-center text-center hover:bg-zinc-500">

              <button className= "justify-center" onClick= {() => document.getElementById('image-input').click()}>
                Image
              </button>

            </li>

            <li className= "rounded-md m-2 px-3 py-1 justify-center text-center hover:bg-zinc-500">

              <button className= "justify-center" onClick= {() => document.getElementById('video-input').click()}>
                Video
              </button>

            </li>

          </ul>

          {fileError && (<p className= "text-center text-red-500 text-sm italic font-semibold">invalid file type or size</p>)}

        </section>) : (
          <section className= "flex-row w-full h-full justify-evenly">

          <ul className= "flex flex-row justify-center place-items-center content-center items-center place-content-center">

            <li className= "rounded-md m-2 px-3 py-1 justify-center text-center hover:bg-zinc-500">

              <button>
                Start
              </button>

            </li>

          </ul>

        </section>)}
        {asciiArt && (<pre className= "text-white flex max-w-[40vw] max-h-[70vh] text-[3px] pt-5 m-5 justify-center overflow-auto">{asciiArt}</pre>)}

      </div>

    </main>
  );
}
