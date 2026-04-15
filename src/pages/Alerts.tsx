// import React, { useEffect, useState } from "react";

// interface Alert {
//   _id?: string;
//   type: string;
//   visitor?: {
//     name: string;
//     phone?: string;
//     photoDataUrl?: string;
//   };
//   requestedFloor?: number | null;
//   detectedFloor?: number;
//   createdAt: string;
//   resolved?: boolean;
// }

// export default function Alerts() {
//   const [alerts, setAlerts] = useState<Alert[]>([]);
//   const [connected, setConnected] = useState(false);
//   const [audioAllowed, setAudioAllowed] = useState(false);

//   useEffect(() => {
//     const alertAudio = new Audio("/alert-tone.mp3");

//     const unlockAudio = () => {
//       alertAudio.play().catch(() => {});
//       alertAudio.pause();
//       alertAudio.currentTime = 0;
//       setAudioAllowed(true);
//       document.removeEventListener("click", unlockAudio);
//       console.log("🔓 Audio playback unlocked by user click");
//     };
//     document.addEventListener("click", unlockAudio);

//     const wsUrl = `ws://${window.location.hostname}:4000/ws`;
//     const ws = new WebSocket(wsUrl);

//     ws.onopen = () => {
//       console.log("✅ Connected to alert WebSocket");
//       setConnected(true);
//     };
//     ws.onerror = (err) => console.error("❌ WebSocket error:", err);
//     ws.onclose = () => {
//       console.warn("⚠️ WebSocket closed");
//       setConnected(false);
//     };

//     ws.onmessage = (msg) => {
//       try {
//         const data = JSON.parse(msg.data);

//         if (data.type === "violation" || data.type === "ok") {
//           setAlerts((prev) => [data, ...prev]);

//           if (data.type === "violation" && audioAllowed) {
//             alertAudio.currentTime = 0;
//             alertAudio
//               .play()
//               .then(() => console.log("🔊 Alert sound played"))
//               .catch((err) =>
//                 console.warn("⚠️ Audio play blocked by browser:", err)
//               );
//           }
//         }
//       } catch (err) {
//         console.error("❌ Error parsing WS message:", err);
//       }
//     };

//     fetch("/api/recognitions/alerts")
//       .then((r) => r.json())
//       .then((data) => {
//         const normalized = data.map((a: any) => ({
//           _id: a._id,
//           type: a.type,
//           visitor: {
//             name: a.visitorId?.name || "Unknown",
//             photoDataUrl: a.visitorId?.photoDataUrl || "",
//           },
//           requestedFloor: a.visitId?.requestedFloor ?? a.requestedFloor ?? null,
//           detectedFloor: a.detectedFloor,
//           createdAt: a.createdAt,
//           resolved: a.resolved || false,
//         }));
//         setAlerts(normalized);
//       })
//       .catch((err) => console.error("Failed to load alerts:", err));

//     return () => ws.close();
//   }, [audioAllowed]);

//   const handleResolve = async (id?: string) => {
//     if (!id) return;
//     try {
//       const res = await fetch(`/api/recognitions/alerts/${id}/resolve`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//       });
//       const data = await res.json();
//       if (data.success) {
//         setAlerts((prev) =>
//           prev.map((a) =>
//             a._id === id ? { ...a, resolved: true } : a
//           )
//         );
//       }
//     } catch (err) {
//       console.error("Failed to resolve alert:", err);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
//       <h2>
//         🚨 Security Alerts{" "}
//         <span
//           style={{
//             color: connected ? "green" : "red",
//             fontSize: 14,
//             marginLeft: 8,
//           }}
//         >
//           {connected ? "🟢 Live" : "🔴 Offline"}
//         </span>
//       </h2>

//       {!audioAllowed && (
//         <div
//           style={{
//             background: "#fff3cd",
//             color: "#856404",
//             padding: "8px 12px",
//             borderRadius: 6,
//             marginBottom: 10,
//             border: "1px solid #ffeeba",
//           }}
//         >
//           🔇 Click anywhere on the page to enable alert sound.
//         </div>
//       )}

//       {alerts.filter((a) => !a.resolved).length === 0 ? (
//         <p>No active alerts</p>
//       ) : (
//         alerts
//           .filter((a) => !a.resolved)
//           .map((a, i) => {
//             const isViolation = a.type === "violation";
//             const name = a.visitor?.name || "Unknown";
//             const requested = a.requestedFloor ?? "?";
//             const detected = a.detectedFloor ?? "?";

//             let message = "";
//             if (name === "Unknown") {
//               message = `🚨 Unknown person detected on floor ${detected}.`;
//             } else if (isViolation) {
//               message = `${name} detected on floor ${detected} instead of ${requested}.`;
//             } else {
//               message = `${name} validated correctly on floor ${detected}.`;
//             }

//             return (
//               <div
//                 key={a._id || i}
//                 style={{
//                   background:
//                     name === "Unknown"
//                       ? "#ffe6cc"
//                       : isViolation
//                       ? "#ffe6e6"
//                       : "#e6ffe6",
//                   border:
//                     name === "Unknown"
//                       ? "1px solid orange"
//                       : isViolation
//                       ? "1px solid red"
//                       : "1px solid green",
//                   padding: 12,
//                   borderRadius: 8,
//                   marginBottom: 10,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 12,
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                   {a.visitor?.photoDataUrl && (
//                     <img
//                       src={a.visitor.photoDataUrl}
//                       alt="visitor"
//                       style={{
//                         width: 60,
//                         height: 60,
//                         borderRadius: "50%",
//                         objectFit: "cover",
//                         border: "1px solid #ccc",
//                       }}
//                     />
//                   )}
//                   <div>
//                     <b>{message}</b>
//                     <br />
//                     <small>{new Date(a.createdAt).toLocaleString()}</small>
//                   </div>
//                 </div>

//                 {isViolation && (
//                   <button
//                     onClick={() => handleResolve(a._id)}
//                     style={{
//                       background: "#4caf50",
//                       color: "white",
//                       border: "none",
//                       borderRadius: 6,
//                       padding: "6px 10px",
//                       cursor: "pointer",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     ✅ Resolve
//                   </button>
//                 )}
//               </div>
//             );
//           })
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";

interface Alert {
  _id?: string;
  type: string;
  visitor?: {
    name: string;
    phone?: string;
    photoDataUrl?: string;
  };
  requestedFloor?: number | null;
  detectedFloor?: number;
  createdAt: string;
  resolved?: boolean;
  reason?: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);
  const [audioAllowed, setAudioAllowed] = useState(false);

  useEffect(() => {
    const alertAudio = new Audio("/alert-tone.mp3");

    const unlockAudio = () => {
      alertAudio.play().catch(() => {});
      alertAudio.pause();
      alertAudio.currentTime = 0;
      setAudioAllowed(true);
      document.removeEventListener("click", unlockAudio);
      console.log("🔓 Audio playback unlocked by user click");
    };
    document.addEventListener("click", unlockAudio);

    const wsUrl = `ws://${window.location.hostname}:4000/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ Connected to alert WebSocket");
      setConnected(true);
    };
    ws.onerror = (err) => console.error("❌ WebSocket error:", err);
    ws.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      setConnected(false);
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        // include all alert types
        if (
          [
            "violation",
            "time_violation",
            "floor_violation",
            "ok",
          ].includes(data.type)
        ) {
          setAlerts((prev) => [data, ...prev]);

          // play sound only on violation-type alerts
          if (
            ["violation", "time_violation", "floor_violation"].includes(
              data.type
            ) &&
            audioAllowed
          ) {
            alertAudio.currentTime = 0;
            alertAudio
              .play()
              .then(() => console.log("🔊 Alert sound played"))
              .catch((err) =>
                console.warn("⚠️ Audio play blocked by browser:", err)
              );
          }
        }
      } catch (err) {
        console.error("❌ Error parsing WS message:", err);
      }
    };

    // initial fetch for previous alerts
    fetch("/api/recognitions/alerts")
      .then((r) => r.json())
      .then((data) => {
        const normalized = data.map((a: any) => ({
          _id: a._id,
          type: a.type,
          visitor: {
            name: a.visitorId?.name || "Unknown",
            photoDataUrl: a.visitorId?.photoDataUrl || "",
          },
          requestedFloor:
            a.visitId?.requestedFloor ?? a.requestedFloor ?? null,
          detectedFloor: a.detectedFloor,
          createdAt: a.createdAt,
          resolved: a.resolved || false,
          reason: a.reason || "",
        }));
        setAlerts(normalized);
      })
      .catch((err) => console.error("Failed to load alerts:", err));

    return () => ws.close();
  }, [audioAllowed]);

  const handleResolve = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/recognitions/alerts/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, resolved: true } : a))
        );
      }
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>
        🚨 Security Alerts{" "}
        <span
          style={{
            color: connected ? "green" : "red",
            fontSize: 14,
            marginLeft: 8,
          }}
        >
          {connected ? "🟢 Live" : "🔴 Offline"}
        </span>
      </h2>

      {!audioAllowed && (
        <div
          style={{
            background: "#fff3cd",
            color: "#856404",
            padding: "8px 12px",
            borderRadius: 6,
            marginBottom: 10,
            border: "1px solid #ffeeba",
          }}
        >
          🔇 Click anywhere on the page to enable alert sound.
        </div>
      )}

      {alerts.filter((a) => !a.resolved).length === 0 ? (
        <p>No active alerts</p>
      ) : (
        alerts
          .filter((a) => !a.resolved)
          .map((a, i) => {
            const name = a.visitor?.name || "Unknown";
            const requested = a.requestedFloor ?? "?";
            const detected = a.detectedFloor ?? "?";

            let message = "";
            if (a.type === "time_violation")
              message = `⏰ ${name} exceeded allowed time and was seen on floor ${detected}.`;
            else if (
              a.type === "floor_violation" ||
              a.type === "violation"
            )
              message = `🚨 ${name} detected on floor ${detected} instead of ${requested}.`;
            else if (name === "Unknown")
              message = `🚨 Unknown person detected on floor ${detected}.`;
            else
              message = `${name} validated correctly on floor ${detected}.`;

            return (
              <div
                key={a._id || i}
                style={{
                  background:
                    a.type === "time_violation"
                      ? "#fff3cd"
                      : a.type === "floor_violation" ||
                        a.type === "violation"
                      ? "#ffe6e6"
                      : "#e6ffe6",
                  border:
                    a.type === "time_violation"
                      ? "1px solid #ffcc00"
                      : a.type === "floor_violation" ||
                        a.type === "violation"
                      ? "1px solid red"
                      : "1px solid green",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {a.visitor?.photoDataUrl && (
                    <img
                      src={a.visitor.photoDataUrl}
                      alt="visitor"
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                      }}
                    />
                  )}
                  <div>
                    <b>{message}</b>
                    <br />
                    <small>{new Date(a.createdAt).toLocaleString()}</small>
                  </div>
                </div>

                {a.type !== "ok" && (
                  <button
                    onClick={() => handleResolve(a._id)}
                    style={{
                      background: "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ✅ Resolve
                  </button>
                )}
              </div>
            );
          })
      )}
    </div>
  );
}

