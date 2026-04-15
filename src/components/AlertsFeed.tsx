import React from "react";

export default function AlertsFeed({ items }:{ items:any[] }) {
  return (
    <div style={{ display:"grid", gap:12 }}>
      {items.map((a, i) => (
        <div key={i} style={{
          border:"1px solid #ddd", borderRadius:12, padding:12,
          background: a.type === "violation" ? "#ffe8e8" : "#eaffe8"
        }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            {a.visitor?.photoDataUrl && (
              <img src={a.visitor.photoDataUrl} alt="" width={64} height={64} style={{borderRadius:8, objectFit:"cover"}}/>
            )}
            <div>
              <div><b>{a.visitor?.name || "Unknown"}</b> — {a.visitor?.phone}</div>
              <div>Requested: <b>{a.requestedFloor}</b> | Detected: <b>{a.detectedFloor}</b> | <i>{a.type}</i></div>
              <div style={{opacity:0.7, fontSize:12}}>{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
