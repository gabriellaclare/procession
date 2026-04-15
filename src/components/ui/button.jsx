export function Button({children, ...props}){
  return <button style={{background:'transparent',color:'#e5e5e5',border:'1px solid #333',padding:'8px'}} {...props}>{children}</button>
}
