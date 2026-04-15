import WebSocket, { WebSocketServer } from "ws";

let wss: WebSocketServer;

export function initWS(server: any) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("📡 Dashboard connected to WebSocket");
    ws.on("close", () => console.log("❌ Dashboard disconnected"));
  });

  console.log("🔗 WebSocket Server initialized on /ws");
}

interface AlertPayload {
  alertId: string;
  visitor: {
    name: string;
    phone: string;
    photoDataUrl: string;
  };
  requestedFloor: number;
  detectedFloor: number;
  type: string;
  createdAt: Date;
}

export function pushAlert(alert: AlertPayload) {
  if (!wss) return;

  // ✅ send everything, including visitor name and floor info
  const data = {
    type: alert.type,
    visitor: alert.visitor,
    requestedFloor: alert.requestedFloor,
    detectedFloor: alert.detectedFloor,
    createdAt: alert.createdAt,
  };

  const msg = JSON.stringify(data);

  let count = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
      count++;
    }
  });

  console.log(
    `📢 Pushed alert to ${count} dashboards: ${alert.visitor.name} | Type: ${alert.type} | Floor: ${alert.detectedFloor} (requested ${alert.requestedFloor})`
  );
}
