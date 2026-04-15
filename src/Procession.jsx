import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Upload, Footprints, Eye } from 'lucide-react'

const communalTraces = [
  { type: 'gesture' },
  { type: 'image' },
  { type: 'glance' },
]

export default function Procession() {
  const [step, setStep] = useState(-1)
  const [entries, setEntries] = useState([])

  const prompts = [
    'You are entering. Others are already here.',
    'Offer an image or a trace of presence.',
    'Mark a gesture. It may not be yours alone.',
    'Remain with what has been left.'
  ]

  const addEntry = (type) => {
    setEntries([...entries, { id: Date.now(), type }])
  }

  const blurredArchive = [...communalTraces, ...entries].sort(() => Math.random() - 0.5)

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'#e5e5e5',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <Card>
        <CardContent>
          {step === -1 && (
            <>
              <p>Before you, there were others.</p>
              {communalTraces.map((t,i)=>(<div key={i}>• {t.type}</div>))}
              <Button onClick={()=>setStep(0)}>Enter</Button>
            </>
          )}

          {step >= 0 && (
            <>
              <AnimatePresence mode="wait">
                <motion.p key={step} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {prompts[step]}
                </motion.p>
              </AnimatePresence>

              {step===1 && (
                <>
                  <Button onClick={()=>addEntry('image')}><Upload size={14}/> Image</Button>
                  <Button onClick={()=>addEntry('glance')}><Eye size={14}/> Glance</Button>
                </>
              )}

              {step===2 && (
                <Button onClick={()=>addEntry('gesture')}><Footprints size={14}/> Record Gesture</Button>
              )}

              <Button onClick={()=>setStep(Math.min(step+1,3))}>Continue</Button>

              {step===3 && blurredArchive.map((e,i)=>(<div key={i}>• {e.type}</div>))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
