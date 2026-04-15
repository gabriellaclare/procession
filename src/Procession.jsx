
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Upload } from 'lucide-react'

const communalTraces = [
  { type: 'offering' },
  { type: 'gesture' },
  { type: 'offering' },
]

const blessings = [
  'You leave carrying what cannot be shown.',
  'What was given does not return with you.',
  'You have joined what continues.',
  'Go, and keep what remains unseen.',
  'The trace passes beyond you.'
]

export default function Procession() {
  const [step, setStep] = useState(-1)
  const [entries, setEntries] = useState([])
  const [ghost, setGhost] = useState(null)
  const [fadeWhite, setFadeWhite] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const audioCtxRef = useRef(null)
  const noiseRef = useRef(null)
  const murmurGainRef = useRef(null)

  const prompts = [
    'You are entering. Others are already here.',
    'Make an offering.',
    'Perform a gesture.',
    ''
  ]

  const advance = () => {
    setStep(prev => Math.min(prev + 1, 3))
  }

  /* ------------------ AMBIENT SOUND ------------------ */
  const startAmbient = async () => {
    if (soundOn) return
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    // Footstep-like noise (filtered noise pulses)
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 400

    const stepGain = ctx.createGain()
    stepGain.gain.value = 0.0

    noise.connect(bandpass).connect(stepGain).connect(ctx.destination)

    // Murmur (low sine cluster)
    const murmurGain = ctx.createGain()
    murmurGain.gain.value = 0.05
    murmurGainRef.current = murmurGain

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 90
    osc.connect(murmurGain).connect(ctx.destination)

    noise.start()
    osc.start()
    noiseRef.current = stepGain

    // Pulse footsteps
a
    let on = false
    setInterval(() => {
      if (!noiseRef.current) return
      noiseRef.current.gain.setValueAtTime(on ? 0.12 : 0.0, ctx.currentTime)
      on = !on
    }, 450)

    setSoundOn(true)
  }

  /* ------------------ OFFERING ------------------ */
  const handleOffering = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setGhost(url)
    setEntries(prev => [...prev, { id: Date.now(), type: 'offering' }])

    setTimeout(() => {
      URL.revokeObjectURL(url)
      setGhost(null)
      advance()
    }, 1500)
  }

  /* ------------------ GESTURE (AUTO-START) ------------------ */
  useEffect(() => {
    if (step !== 2) return

    const run = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = stream
        videoRef.current.play()

        setTimeout(() => {
          const canvas = canvasRef.current
          const video = videoRef.current
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          canvas.getContext('2d').drawImage(video, 0, 0)

          const dataUrl = canvas.toDataURL('image/jpeg')
          setGhost(dataUrl)
          setEntries(prev => [...prev, { id: Date.now(), type: 'gesture' }])

          stream.getTracks().forEach(track => track.stop())

          setTimeout(() => {
            setGhost(null)
            advance()
          }, 1500)
        }, 6000)
      } catch (e) {}
    }

    run()
  }, [step])

  const blessing = blessings[Math.floor(Math.random() * blessings.length)]

  /* Delay → fade to white */
  useEffect(() => {
    if (step === 3) {
      setTimeout(() => setFadeWhite(true), 5000)
    }
  }, [step])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e5e5e5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      textAlign: 'center'
    }}>
      <Card>
        <CardContent style={{ alignItems: 'center' }}>

          {step === -1 && (
            <>
              <p>Before you, there were others.</p>
              {communalTraces.map((t, i) => (
                <div key={i}>• {t.type}</div>
              ))}
              <Button onClick={() => { startAmbient(); advance() }}>Enter</Button>
            </>
          )}

          {step >= 0 && step < 3 && (
            <>
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                >
                  {prompts[step]}
                </motion.p>
              </AnimatePresence>

              {step === 0 && (
                <Button onClick={advance}>Continue</Button>
              )}

              {step === 1 && (
                <>
                  <Button onClick={() => fileInputRef.current.click()}>
                    <Upload size={14} /> Offering
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleOffering}
                  />
                </>
              )}

              {step === 2 && (
                <p style={{ opacity: 0.6 }}>
                  Remain present. The gesture is witnessed.
                </p>
              )}
            </>
          )}

          {step === 3 && (
            <p style={{ opacity: 0.8, lineHeight: '1.6em' }}>{blessing}</p>
          )}

        </CardContent>
      </Card>

      <AnimatePresence>
        {ghost && (
          <motion.img
            src={ghost}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '80vw',
              maxHeight: '80vh',
              pointerEvents: 'none',
              filter: 'grayscale(100%) blur(1px)'
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fadeWhite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#ffffff'
            }}
          />
        )}
      </AnimatePresence>

      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
