


export class Video {

    constructor() {

        this.videoElement= document.createElement('video')
        this.canvas = document.createElement('canvas')
        this.context = this.canvas.getContext('2d')

        this.width= 640
        this.height= 480

        this.stream= null

        this.frameListeners= []

    }

    addFrameListener = (listener) => {

        this.frameListeners.push(listener)

    }

    removeFrameListener = (listener) => {
        
        this.frameListeners= this.frameListeners.filter(l => l !== listener)

    }

    start() {

        this.videoElement.play()
        this.videoElement.addEventListener('play', () => this.processVideo())

    }

    stop() {

        this.videoElement.pause()
        this.videoElement.srcObject= null

        while (this.videoElement.firstChild) {
            this.videoElement.removeChild(this.videoElement.firstChild)
        }

        if (this.stream){

            this.stream.getTracks().forEach(track => track.stop())


        }

        this.frameListeners= []
    }

    setStream(stream) {

        this.stream= stream
        this.videoElement.srcObject= stream
    }

    initStream = async () =>{

        this.stream= await navigator.mediaDevices.getUserMedia({video: true})
        this.videoElement.srcObject= this.stream
        this.videoElement.width= this.width
        this.videoElement.height= this.height
    }

    initVideo(url){

        this.videoElement.width= this.width
        this.videoElement.height= this.height
        this.videoElement.muted= true
        this.videoElement.loop= true
        this.videoElement.src= url

    }

    processVideo = async () => {

        const canvas= new OffscreenCanvas(this.videoElement.width, this.videoElement.height)
        const context= canvas.getContext('2d')

        const frame = () => {

            context.drawImage(this.videoElement, 0, 0, this.width, this.height)  
            const imageData= context.getImageData(0, 0, this.width, this.height)
            
            this.frameListeners.forEach(listener => listener(imageData))
            requestAnimationFrame(frame)

        }
        requestAnimationFrame(frame)
    }


}