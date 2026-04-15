
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

export default function Procession() {
  const [step, setStep] = useState(-1)
  const [entries, setEntries] = useState([])
  const [ghost, setGhost] = useState(null)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const prompts = [
    'You are entering. Others are already here.',
    'Make an offering.',
    'Perform a gesture.',
    'Remain with what has been left.',
  ]

  const advance = () => {
    setStep(prev => Math.min(prev + 1, 3))
  }

  const handleOffering = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setGhost(url)
    setEntries([...entries, { id: Date.now(), type: 'offering' }])

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

      setTimeout(() => {
        const canvas = canvasRef.current
        const video = videoRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)

        const dataUrl = canvas.toDataURL('image/jpeg')
        setGhost(dataUrl)
        setEntries([...entries, { id: Date.now(), type: 'gesture' }])

        stream.getTracks().forEach(track => track.stop())

        setTimeout(() => {
          setGhost(null)
          advance()
        }, 1500)
      }, 600)
    } catch {
      // permission denied
    }
  }

  const archive = [...communalTraces, ...entries].sort(() => Math.random() - 0.5)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e5e5e5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
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

          {step >= 0 && (
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
                <Button onClick={handleGesture}>
                  <Footprints size={14} /> Gesture
                </Button>
              )}

              {step === 3 && (
                <>
                  {archive.map((e, i) => (
                    <div key={i}>• {e.type}</div>
                  ))}
                </>
              )}
            </>
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
              filter: 'grayscale(100%) blur(1px)',
            }}
          />
        )}
      </AnimatePresence>

      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

    </div>
  )
}
