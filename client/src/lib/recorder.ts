export interface RecorderResult {
  blob: Blob
  filename: string
  durationMs: number
  hasScreen: boolean
  hasScreenAudio: boolean
  mimeType: string
  sizeBytes: number
}

export class InterviewRecorder {
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private audioContext: AudioContext | null = null
  private animationFrame = 0
  private canvasStream: MediaStream | null = null
  private mixedAudioStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private screenVideo: HTMLVideoElement | null = null
  private startedAt = 0
  private canvas = document.createElement('canvas')
  private hasScreen = false
  private screenWasSelected = false
  private screenHasAudio = false

  async start(
    localStream: MediaStream,
    remoteStream: MediaStream,
    localVideo: HTMLVideoElement,
    remoteVideo: HTMLVideoElement,
    screenStream: MediaStream | null,
    localName: string,
    remoteName: string,
    isLocalCameraOn: () => boolean = () => true,
    isRemoteCameraOn: () => boolean = () => true,
    localFilterCss = 'none',
  ) {
    if (!localStream.getVideoTracks().length && !remoteStream.getVideoTracks().length) {
      throw new Error('At least one video track is required to start recording.')
    }

    const context = this.canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D recording context is not supported in this browser.')

    try {
      this.canvas.width = 1920
      this.canvas.height = 1080
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      this.screenStream = screenStream
      this.hasScreen = Boolean(screenStream?.getVideoTracks().length)
      this.screenWasSelected = this.hasScreen
      this.screenHasAudio = Boolean(screenStream?.getAudioTracks().length)

      // Setup Web Audio Graph
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioContext = new AudioCtx()
      const destination = this.audioContext.createMediaStreamDestination()

      const compressor = this.audioContext.createDynamicsCompressor()
      compressor.threshold.value = -12
      compressor.knee.value = 18
      compressor.ratio.value = 3
      compressor.attack.value = 0.003
      compressor.release.value = 0.25
      compressor.connect(destination)

      const addAudioSource = (stream: MediaStream, gainValue = 0.85) => {
        const liveTracks = stream.getAudioTracks().filter(t => t.readyState === 'live')
        if (!liveTracks.length || !this.audioContext) return
        const source = this.audioContext.createMediaStreamSource(new MediaStream(liveTracks))
        const gainNode = this.audioContext.createGain()
        gainNode.gain.value = gainValue
        source.connect(gainNode).connect(compressor)
      }

      // Mix local mic, remote mic, and screen audio (if provided)
      addAudioSource(localStream, 0.85)
      addAudioSource(remoteStream, 0.85)
      if (screenStream && screenStream.getAudioTracks().length > 0) {
        addAudioSource(screenStream, 0.70)
      }

      await this.audioContext.resume()
      this.mixedAudioStream = destination.stream

      // Handle screen video element if screen is shared
      if (this.hasScreen && screenStream) {
        this.screenVideo = document.createElement('video')
        this.screenVideo.srcObject = screenStream
        this.screenVideo.muted = true
        this.screenVideo.playsInline = true
        await this.screenVideo.play().catch(() => undefined)

        const videoTrack = screenStream.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.addEventListener(
            'ended',
            () => {
              this.hasScreen = false
              if (this.screenVideo) {
                this.screenVideo.pause()
                this.screenVideo.srcObject = null
              }
            },
            { once: true },
          )
        }
      }

      // Drawing Helper: Avatar / Camera Off Placeholder
      const drawPlaceholder = (name: string, x: number, y: number, width: number, height: number) => {
        context.save()
        context.beginPath()
        context.roundRect(x, y, width, height, 20)
        context.clip()

        // Background gradient
        const bgGrad = context.createLinearGradient(x, y, x + width, y + height)
        bgGrad.addColorStop(0, '#121829')
        bgGrad.addColorStop(1, '#0b0f19')
        context.fillStyle = bgGrad
        context.fillRect(x, y, width, height)

        // Subtle circle icon backdrop
        const centerX = x + width / 2
        const centerY = y + height / 2 - 16
        const radius = Math.min(width, height) * 0.16
        context.beginPath()
        context.arc(centerX, centerY, radius, 0, Math.PI * 2)
        context.fillStyle = '#1e2842'
        context.fill()

        // Initials or placeholder character
        const initial = (name.trim().charAt(0) || '?').toUpperCase()
        context.fillStyle = '#60a5fa'
        context.font = `600 ${Math.round(radius * 1.1)}px Arial, sans-serif`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(initial, centerX, centerY + 2)

        // Subtitle "Camera Off"
        context.fillStyle = '#94a3b8'
        context.font = '500 20px Arial, sans-serif'
        context.textAlign = 'center'
        context.fillText('Camera Off', centerX, centerY + radius + 32)

        context.restore()
      }

      // Drawing Helper: Rounded Video Tile
      const drawRoundedVideo = (
        video: HTMLVideoElement,
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
        isCameraOn: boolean,
        mirrored = false,
        filterCss = 'none',
      ) => {
        const hasLiveVideo =
          isCameraOn &&
          video &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.videoWidth > 0

        if (!hasLiveVideo) {
          drawPlaceholder(name, x, y, width, height)
          return
        }

        const scale = Math.max(width / video.videoWidth, height / video.videoHeight)
        const drawWidth = video.videoWidth * scale
        const drawHeight = video.videoHeight * scale

        context.save()
        context.beginPath()
        context.roundRect(x, y, width, height, 20)
        context.clip()

        if (filterCss && filterCss !== 'none') {
          context.filter = filterCss
        }

        if (mirrored) {
          context.translate(x + width, 0)
          context.scale(-1, 1)
          context.drawImage(video, (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
        } else {
          context.drawImage(video, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
        }
        context.restore()
      }

      // Drawing Helper: Name Badge Overlay
      const drawName = (name: string, x: number, y: number, width: number) => {
        context.save()
        context.beginPath()
        context.roundRect(x, y, width, 52, [0, 0, 20, 20])
        context.clip()
        context.fillStyle = 'rgba(7, 11, 22, 0.82)'
        context.fillRect(x, y, width, 52)

        context.fillStyle = '#ffffff'
        context.font = '600 22px Arial, sans-serif'
        context.textAlign = 'left'
        context.textBaseline = 'middle'
        context.fillText(name.slice(0, 32), x + 20, y + 26)
        context.restore()
      }

      // Canvas Rendering Loop
      const draw = () => {
        context.fillStyle = '#060a15'
        context.fillRect(0, 0, 1920, 1080)

        const currentScreen = this.screenVideo
        const screenReady =
          this.hasScreen &&
          currentScreen &&
          currentScreen.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          currentScreen.videoWidth > 0

        if (screenReady && currentScreen) {
          // Screen Share as Main Stage + PiP tiles in bottom right
          const scale = Math.min(1920 / currentScreen.videoWidth, 1080 / currentScreen.videoHeight)
          const w = currentScreen.videoWidth * scale
          const h = currentScreen.videoHeight * scale

          context.fillStyle = '#090d18'
          context.fillRect(0, 0, 1920, 1080)
          context.drawImage(currentScreen, (1920 - w) / 2, (1080 - h) / 2, w, h)

          // Subtle gradient overlay behind PiP cards
          const grad = context.createLinearGradient(0, 680, 0, 1080)
          grad.addColorStop(0, 'rgba(3, 7, 16, 0)')
          grad.addColorStop(1, 'rgba(3, 7, 16, 0.85)')
          context.fillStyle = grad
          context.fillRect(0, 680, 1920, 400)

          const pipW = 400
          const pipH = 225
          const gap = 20
          const pipY = 820
          const x1 = 1920 - (pipW * 2 + gap) - 36
          const x2 = x1 + pipW + gap

          drawRoundedVideo(localVideo, localName || 'Interviewer', x1, pipY, pipW, pipH, isLocalCameraOn(), true, localFilterCss)
          drawRoundedVideo(remoteVideo, remoteName || 'Participant', x2, pipY, pipW, pipH, isRemoteCameraOn(), false, 'none')

          drawName(localName || 'Interviewer', x1, pipY + pipH - 52, pipW)
          drawName(remoteName || 'Participant', x2, pipY + pipH - 52, pipW)
        } else {
          // Standard Side-by-Side Layout
          const pad = 36
          const gap = 24
          const tileW = 912
          const tileH = 1008
          const tileY = 36

          drawRoundedVideo(localVideo, localName || 'Interviewer', pad, tileY, tileW, tileH, isLocalCameraOn(), true, localFilterCss)
          drawRoundedVideo(remoteVideo, remoteName || 'Participant', pad + tileW + gap, tileY, tileW, tileH, isRemoteCameraOn(), false, 'none')

          drawName(localName || 'Interviewer', pad, tileY + tileH - 52, tileW)
          drawName(remoteName || 'Participant', pad + tileW + gap, tileY + tileH - 52, tileW)
        }

        this.animationFrame = requestAnimationFrame(draw)
      }

      draw()

      this.canvasStream = this.canvas.captureStream(30)
      const combinedTracks = [
        ...this.canvasStream.getVideoTracks(),
        ...this.mixedAudioStream.getAudioTracks(),
      ]

      const outputStream = new MediaStream(combinedTracks)

      // Determine optimal supported WebM mime type
      const mimeCandidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
      ]

      const selectedMime = mimeCandidates.find(type => MediaRecorder.isTypeSupported(type))
      if (!selectedMime) {
        throw new Error('This browser does not support WebM recording. Please use current Chrome, Edge, or Firefox.')
      }

      this.chunks = []
      this.recorder = new MediaRecorder(outputStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6_000_000,
        audioBitsPerSecond: 192_000,
      })

      this.startedAt = Date.now()
      this.recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          this.chunks.push(event.data)
        }
      }

      this.recorder.start(1000)
    } catch (err) {
      this.cleanup()
      throw err
    }
  }

  stop(): Promise<RecorderResult> {
    return new Promise((resolve, reject) => {
      if (!this.recorder || this.recorder.state === 'inactive') {
        reject(new Error('There is no active recording to stop.'))
        return
      }

      const recorder = this.recorder
      recorder.onerror = () => {
        this.cleanup()
        reject(new Error('The browser reported an error during recording. Try a shorter interview or close other heavy tabs.'))
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'video/webm'
        const blob = new Blob(this.chunks, { type: mimeType })
        const durationMs = Date.now() - this.startedAt
        const hasScreen = this.screenWasSelected
        const hasScreenAudio = this.screenHasAudio
        const sizeBytes = blob.size

        const dateStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const filename = `InterviewCapture_${dateStamp}.webm`

        this.cleanup()
        resolve({
          blob,
          filename,
          durationMs,
          hasScreen,
          hasScreenAudio,
          mimeType,
          sizeBytes,
        })
      }

      recorder.stop()
    })
  }

  private cleanup() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = 0
    }

    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach(track => track.stop())
      this.canvasStream = null
    }

    if (this.mixedAudioStream) {
      this.mixedAudioStream.getTracks().forEach(track => track.stop())
      this.mixedAudioStream = null
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())
      this.screenStream = null
    }

    if (this.screenVideo) {
      this.screenVideo.pause()
      this.screenVideo.srcObject = null
      this.screenVideo = null
    }

    if (this.audioContext) {
      void this.audioContext.close()
      this.audioContext = null
    }

    this.hasScreen = false
    this.screenWasSelected = false
    this.screenHasAudio = false
    this.recorder = null
  }
}

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string
    types: { description: string; accept: Record<string, string[]> }[]
  }) => Promise<{
    createWritable: () => Promise<{ write: (blob: Blob) => Promise<void>; close: () => Promise<void> }>
  }>
}

/**
 * Saves a recorded video file locally.
 * Prefers File System Access API (showSaveFilePicker) on Chromium browsers.
 * Seamlessly falls back to anchor download if picker is unavailable, unsupported, or rejected.
 */
export async function saveRecording(blob: Blob, filename: string): Promise<'saved' | 'downloaded' | 'cancelled'> {
  const pickerWindow = window as SavePickerWindow

  if (typeof pickerWindow.showSaveFilePicker === 'function') {
    try {
      const handle = await pickerWindow.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'WebM Video', accept: { 'video/webm': ['.webm'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return 'saved'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled'
      }
      // If permission is denied or picker is blocked, gracefully fall through to standard download
      console.warn('[Recorder] showSaveFilePicker failed, using fallback download anchor:', err)
    }
  }

  // Fallback anchor download
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
  return 'downloaded'
}
