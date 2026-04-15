// const API = "/api";

// export async function createVisitor(payload: any) {
//   const res = await fetch(`${API}/visitors`, {
//     method: "POST",
//     headers: { "Content-Type":"application/json" },
//     body: JSON.stringify(payload)
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export async function registerStation(name: string, floor: number) {
//   const res = await fetch(`${API}/stations`, {
//     method: "POST",
//     headers: { "Content-Type":"application/json" },
//     body: JSON.stringify({ name, floor })
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json(); // { station }
// }

// export async function postRecognition(token: string, descriptor: number[]) {
//   const res = await fetch(`${API}/recognitions`, {
//     method: "POST",
//     headers: {
//       "Content-Type":"application/json",
//       "Authorization": `Bearer ${token}`
//     },
//     body: JSON.stringify({ descriptor: { data: descriptor } })
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export function wsConnect(onAlert: (a:any)=>void) {
//   const ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
//   ws.onmessage = (ev) => {
//     const msg = JSON.parse(ev.data);
//     if (msg.type === "alert") onAlert(msg.data);
//   };
//   return ws;
// }

// export async function getAlerts() {
//   const res = await fetch(`${API}/recognitions/alerts`);
//   return res.json();
// }

const API = "/api";

/* 🧠 Utility to get stored JWT token */
function getToken() {
  return localStorage.getItem("token");
}

/* 🧍‍♂️ Admin Login */
export async function loginAdmin(payload: { username: string; password: string }) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");

  return data; // { token, username, ... }
}

/* 👤 Create Visitor */
export async function createVisitor(payload: any) {
  const token = getToken();
  const res = await fetch(`${API}/visitors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* 🏢 Register Station */
export async function registerStation(name: string, floor: number) {
  const token = getToken();
  const res = await fetch(`${API}/stations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, floor }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* 🧠 Post Recognition (Face Detection) */
export async function postRecognition(token: string, descriptor: number[]) {
  const res = await fetch(`${API}/recognitions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ descriptor: { data: descriptor } }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* 🌐 WebSocket Connection for Live Alerts */
export function wsConnect(onAlert: (a: any) => void) {
  const ws = new WebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`
  );
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === "alert") onAlert(msg.data);
  };
  return ws;
}

/* 🚨 Fetch All Alerts */
export async function getAlerts() {
  const token = getToken();
  const res = await fetch(`${API}/recognitions/alerts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}
