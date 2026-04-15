
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Upload, Footprints } from 'lucide-react'

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
  const [fadeOut, setFadeOut] = useState(false)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const prompts = [
    'You are entering. Others are already here.',
    'Make an offering.',
    'Perform a gesture.',
    ''
  ]

  const advance = () => {
    setStep(prev => Math.min(prev + 1, 3))
  }

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

  const handleGesture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      videoRef.current.play()

      // time for the gesture
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
    } catch (e) {
      // permission denied
    }
  }

  const blessing = blessings[Math.floor(Math.random() * blessings.length)]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e5e5e5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <AnimatePresence>
        {!fadeOut && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ width: '100%' }}
          >
            <Card>
              <CardContent>

                {step === -1 && (
                  <>
                    <p>Before you, there were others.</p>
                    {communalTraces.map((t, i) => (
                      <div key={i}>• {t.type}</div>
                    ))}
                    <Button onClick={advance}>Enter</Button>
                  </>
                )}

                {step >= 0 && step < 3 && (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
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
                      <>
                        <p style={{ opacity: 0.6, fontSize: '0.9em' }}>
                          The camera remains open. Perform the gesture.
                        </p>
                        <Button onClick={handleGesture}>
                          <Footprints size={14} /> Gesture
                        </Button>
                      </>
                    )}
                  </>
                )}

                {step === 3 && (
                  <p style={{
                    opacity: 0.75,
                    textAlign: 'center',
                    lineHeight: '1.6em'
                  }}>
                    {blessing}
                  </p>
                )}

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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

      {step === 3 && !fadeOut && (
        setTimeout(() => setFadeOut(true), 3000) || null
      )}

      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
