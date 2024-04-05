'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Video } from "./Video.js";

export default function Home() {

  const [selected, setSelected] = useState(1)
  const [fileError, setFileError]= useState(false)
  const [asciiArt, setAsciiArt]= useState(null)
  const [videoIsPlaying, setVideoIsPlaying]= useState(false)
  const [toggleWebcam, setToggleWebcam]= useState("Start")
  const [fatalWebcamError, setFatalWebcamError]= useState(false)

  const videoProcessorRef= useRef(null)

  const isSelected= "border bg-zinc-600 rounded-md mx-2 p-1 border-purple-700 justify-center place-self-center text-white"
  const notSelected= "border border-zinc-900 rounded-md mx-2 p-1 justify-center place-self-center text-white"


  const title= `
   _____                .__.__ 
  /  _  \\   ______ ____ |__|__|
 /  /_\\  \\ /  ____/ ___\\|  |  |
/    |    \\\\___ \\\\  \\___|  |  |
\\____|__  /____  >\\___  |__|__|
        \\/     \\/     \\/        `




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

  const handleImageUpload = async (e) => {


    e.preventDefault()
    setToggleWebcam("Start")

    const file= e.target.files[0]
    const reader= new FileReader()

    if (!file) {

      setFileError("there was an error selecting your file")
      return

    } else if ((file.type !== 'image/jpeg' && file.type !== 'image/png') || file.size > 100000000 ) {

      setFileError("invalid file type or size")
      return 

    } else {
      
        if (videoIsPlaying) {
          
        videoProcessorRef.current.stop()
        videoProcessorRef.current= null
        setVideoIsPlaying(false)
      }

      setAsciiArt(null)
      setFileError(null);
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
    setToggleWebcam("Start")

    const file= e.target.files[0]

    if (!file) {

      setFileError("there was an error selecting your file")
      return
    } else if (file.type !== 'video/mp4') {

      setFileError("invalid file type or size")
      return

    }

    if (videoIsPlaying) {
        
        videoProcessorRef.current.stop()
        videoProcessorRef.current= null
        setVideoIsPlaying(false)
    }

    setFileError(null)

    const reader= new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (e) => {

      const videoPlayer= new Video()
      videoPlayer.initVideo(e.target.result)
      videoPlayer.addFrameListener((frame) => {
        
        const asciiString= convertToAscii(frame)
        setAsciiArt(asciiString)
      })
    
    setVideoIsPlaying(true)
    videoProcessorRef.current= videoPlayer
    videoPlayer.start()

    }

  }

  const handleWebCam = async (e) => {

    if (toggleWebcam === "Stop") {

        if (videoProcessorRef.current) {

          videoProcessorRef.current.stop()
          videoProcessorRef.current= null
          setVideoIsPlaying(false)
          setToggleWebcam("Start")
          setAsciiArt(null)
          return
        } else {

          setToggleWebcam("Start")
          setFileError("there was an error accessing your webcam, please refresh the page and try again")
          setAsciiArt(null)
          videoProcessorRef.current= null
          return
        }
          

      } else if (videoIsPlaying) {
          
          videoProcessorRef.current.stop()
          videoProcessorRef.current= null
          setVideoIsPlaying(false)
          setAsciiArt(null)
      }

    videoProcessorRef.current= null
    const webcamMedia= new Video()

    try {
      

      setToggleWebcam("Stop")
      await webcamMedia.initStream()
      webcamMedia.start()

      webcamMedia.addFrameListener((frame) => {

        const asciiString= convertToAscii(frame)
        setAsciiArt(asciiString)

      })

      setVideoIsPlaying(true)
      videoProcessorRef.current= webcamMedia

    } catch {
      setFatalWebcamError(true)
      setFileError("there was an error accessing your webcam, please refresh the page and try again")

    }

}
  



  return (
    <main className="flex grow min-h-screen min-w-screen flex-col items-center pt-2 px-14 bg-zinc-900 overflow-hidden">

      <pre className= "font-bold bg-gradient-to-r from-rose-400 to-pink-500 via-cyan-400 text-transparent bg-clip-text">{title}</pre>

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

              <button className= "text-white justify-center" onClick= {() => document.getElementById('image-input').click()}>
                Image
              </button>

            </li>

            <li className= "rounded-md m-2 px-3 py-1 justify-center text-center hover:bg-zinc-500">

              <button className= "text-white justify-center" onClick= {() => document.getElementById('video-input').click()}>
                Video
              </button>

            </li>

          </ul>

          {fileError && (<p className= "text-center text-red-500 text-sm italic font-semibold">{fileError}</p>)}

        </section>) : (
          <section className= "flex-row w-full h-full justify-evenly">

          <ul className= "flex flex-row justify-center place-items-center content-center items-center place-content-center">

            <li className= "rounded-md m-2 px-3 py-1 justify-center text-center hover:bg-zinc-500">
              {!fatalWebcamError ?
              <button className= "text-white" onClick= {(e) => handleWebCam(e)}>
                {toggleWebcam}
              </button>
              : <button className= "hidden" onClick= {(e) => handleWebCam(e)}>{toggleWebcam}</button>}
            </li>

          </ul>

          {fileError && (<p className= "text-center text-red-500 text-sm italic font-semibold">{fileError}</p>)}

        </section>)}
        {asciiArt && (<pre className= "text-white flex max-w-[40vw] max-h-[70vh] text-[3px] pt-5 m-5 justify-center overflow-auto">{asciiArt}</pre>)}

      </div>

    </main>
  );
}
