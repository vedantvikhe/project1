import React, { useEffect, useRef, useState } from "react";

type Props = { facingMode?: "user" | "environment", onShot?: (dataUrl:string)=>void };
export default function CameraCapture({ facingMode="user", onShot }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }, audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    })();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [facingMode]);

  const snap = () => {
    const v = videoRef.current!;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    onShot?.(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div style={{ display:"grid", gap:8 }}>
      <video ref={videoRef} playsInline muted style={{ width:"100%", borderRadius:12, background:"#000" }} />
      <button onClick={snap}>Capture Photo</button>
    </div>
  );
}
