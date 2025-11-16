import React, { useRef, useEffect } from 'react'


export default function WebcamCapture(){
const videoRef = useRef(null)


useEffect(()=>{
let mounted = true
async function start(){
try{
const s = await navigator.mediaDevices.getUserMedia({ video: true, audio:false })
if(mounted && videoRef.current){
videoRef.current.srcObject = s
}
}catch(e){
console.error('camera', e)
}
}
start()
return ()=>{ mounted=false; if(videoRef.current && videoRef.current.srcObject){ videoRef.current.srcObject.getTracks().forEach(t=>t.stop()) }}
},[])


return (
<div>
<video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', borderRadius:10 }} />
<div style={{ marginTop:10 }}>
<button className="btn btn-primary">Capture</button>
<button className="btn btn-outline" style={{ marginLeft:8 }}>Flip</button>
</div>
</div>
)
}