export function Card({children}){
  return <div style={{background:'#111',padding:'24px',maxWidth:'420px',width:'100%'}}>{children}</div>
}
export function CardContent({children}){
  return <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>{children}</div>
}
