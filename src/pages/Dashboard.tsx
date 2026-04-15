// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// export default function Dashboard() {
//   const [stats, setStats] = useState({
//     activeVisitors: 0,
//     totalVisitors: 0,
//     pendingAlerts: 0,
//     activeCameras: 0,
//   });

//   const [connected, setConnected] = useState(false);

//   // 🔁 Fetch dashboard stats from backend
//   async function fetchStats() {
//     try {
//       const res = await fetch("/api/dashboard/stats");
//       const data = await res.json();

//       if (data && typeof data === "object") {
//         setStats({
//           activeVisitors: data.activeVisitors || 0,
//           totalVisitors: data.totalVisitors || 0,
//           pendingAlerts: data.pendingAlerts || 0,
//           activeCameras: data.activeCameras || 0,
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching dashboard stats:", err);
//     }
//   }

//   // ⏳ Load stats once
//   useEffect(() => {
//     fetchStats();
//   }, []);

//   // 🌐 Live updates via WebSocket
//   useEffect(() => {
//     const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//     const hostname =
//       window.location.hostname === "localhost"
//         ? "192.168.0.102"
//         : window.location.hostname;

//     const wsUrl = `${protocol}://${hostname}:4000/ws`;
//     const ws = new WebSocket(wsUrl);

//     ws.onopen = () => {
//       console.log("✅ WebSocket connected");
//       setConnected(true);
//     };

//     ws.onclose = () => {
//       console.warn("⚠️ WebSocket closed");
//       setConnected(false);
//     };

//     ws.onerror = (err) => console.error("❌ WebSocket error:", err);

//     ws.onmessage = (msg) => {
//       try {
//         const data = JSON.parse(msg.data);
//         console.log("📡 WS message:", data);

//         // Refresh stats automatically when new alert or visitor update happens
//         if (["violation", "ok", "visitor-update"].includes(data.type)) {
//           fetchStats();
//         }
//       } catch (err) {
//         console.error("Failed to parse WS message:", err);
//       }
//     };

//     return () => ws.close();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       {/* Header */}
//       <header className="flex justify-between items-center mb-10">
//         <div className="flex items-center gap-3">
//           <div className="bg-blue-600 text-white p-3 rounded-full">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 11c0 .828-.895 1.5-2 1.5S8 11.828 8 11m4 0V9a4 4 0 10-8 0v2m4 0v6m6 0h6M3 21h18"
//               />
//             </svg>
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">SecureVisit Pro</h1>
//             <p className="text-gray-500 text-sm">
//               AI-Powered Visitor Security System
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-3">
//           <Link
//             to="/"
//             className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
//           >
//             + Register Visitor
//           </Link>
//           <Link
//             to="/station"
//             className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
//           >
//             👁️ Live Monitor
//           </Link>
//         </div>
//       </header>

//       {/* WebSocket status */}
//       <div className="flex items-center gap-2 mb-6">
//         <div
//           className={`w-3 h-3 rounded-full ${
//             connected ? "bg-green-500 animate-pulse" : "bg-red-500"
//           }`}
//         ></div>
//         <span
//           className={`font-medium ${
//             connected ? "text-green-600" : "text-red-600"
//           }`}
//         >
//           {connected ? "Live WebSocket Connected" : "WebSocket Disconnected"}
//         </span>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <StatCard
//           title="Active Visitors"
//           value={stats.activeVisitors}
//           subtitle="Currently in building"
//           icon="👥"
//           color="blue"
//         />
//         <StatCard
//           title="Total Visitors"
//           value={stats.totalVisitors}
//           subtitle="All time"
//           icon="📈"
//           color="green"
//         />
//         <StatCard
//           title="Pending Alerts"
//           value={stats.pendingAlerts}
//           subtitle="Requires attention"
//           icon="⚠️"
//           color="red"
//         />
//         <StatCard
//           title="Active Cameras"
//           value={stats.activeCameras}
//           subtitle="Online & monitoring"
//           icon="📷"
//           color="teal"
//         />
//       </div>

//       {/* Actions */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//         <ActionCard
//           title="New Registration"
//           description="Register a new visitor with face capture and authorization details."
//           button="Start Registration"
//           link="/"
//           color="blue"
//         />
//         <ActionCard
//           title="Live Monitoring"
//           description="View real-time camera feeds and detection events across all floors."
//           button="Open Monitor"
//           link="/station"
//           color="green"
//         />
//         <ActionCard
//           title="Security Alerts"
//           description="Review and manage security violations and suspicious activities."
//           button="View Alerts"
//           link="/alerts"
//           color="red"
//         />
//       </div>
//     </div>
//   );
// }

// function StatCard({
//   title,
//   value,
//   subtitle,
//   icon,
//   color,
// }: {
//   title: string;
//   value: number;
//   subtitle: string;
//   icon: string;
//   color: string;
// }) {
//   const colors: any = {
//     blue: "bg-blue-100 text-blue-600",
//     green: "bg-green-100 text-green-600",
//     red: "bg-red-100 text-red-600",
//     teal: "bg-teal-100 text-teal-600",
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
//       <div className={`p-3 rounded-full text-2xl ${colors[color]}`}>{icon}</div>
//       <div>
//         <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//         <p className="text-2xl font-bold">{value}</p>
//         <p className="text-sm text-gray-500">{subtitle}</p>
//       </div>
//     </div>
//   );
// }

// function ActionCard({
//   title,
//   description,
//   button,
//   link,
//   color,
// }: {
//   title: string;
//   description: string;
//   button: string;
//   link: string;
//   color: string;
// }) {
//   const buttonColors: any = {
//     blue: "bg-blue-600 hover:bg-blue-700 text-white",
//     green: "bg-green-600 hover:bg-green-700 text-white",
//     red: "bg-red-600 hover:bg-red-700 text-white",
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//       <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
//       <p className="text-sm text-gray-500 mb-5">{description}</p>
//       <Link
//         to={link}
//         className={`px-4 py-2 rounded-lg text-sm font-medium transition ${buttonColors[color]}`}
//       >
//         {button}
//       </Link>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeVisitors: 0,
    totalVisitors: 0,
    pendingAlerts: 0,
    activeCameras: 0,
  });

  const [connected, setConnected] = useState(false);

  // 🔁 Fetch dashboard stats from backend
  async function fetchStats() {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();

      if (data && typeof data === "object") {
        setStats({
          activeVisitors: data.activeVisitors || 0,
          totalVisitors: data.totalVisitors || 0,
          pendingAlerts: data.pendingAlerts || 0,
          activeCameras: data.activeCameras || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  }

  // ⏳ Load stats initially
  useEffect(() => {
    fetchStats();
  }, []);

  // 🌐 WebSocket connection for live updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const hostname =
      window.location.hostname === "localhost"
        ? "localhost"
        : window.location.hostname;

    const wsUrl = `${protocol}://${hostname}:4000/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      setConnected(false);
    };

    ws.onerror = (err) => console.error("❌ WebSocket error:", err);

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        console.log("📡 WS message:", data);

        // Refresh stats when events occur
        if (["violation", "ok", "visitor-update"].includes(data.type)) {
          fetchStats();
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-3 rounded-full shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11c0 .828-.895 1.5-2 1.5S8 11.828 8 11m4 0V9a4 4 0 10-8 0v2m4 0v6m6 0h6M3 21h18"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              SecureVisit Pro
            </h1>
            <p className="text-gray-500 text-sm">
              AI-Powered Visitor Security System
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Register Visitor
          </Link>
          <Link
            to="/station"
            className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            👁️ Live Monitor
          </Link>
        </div>
      </header>

      {/* WebSocket Status */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className={`w-3 h-3 rounded-full ${
            connected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        ></div>
        <span
          className={`font-medium ${
            connected ? "text-green-600" : "text-red-600"
          }`}
        >
          {connected ? "Live WebSocket Connected" : "WebSocket Disconnected"}
        </span>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Active Visitors"
          value={stats.activeVisitors}
          subtitle="Currently in building (not expired)"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total Visitors"
          value={stats.totalVisitors}
          subtitle="All time registered"
          icon="📈"
          color="green"
        />
        <StatCard
          title="Pending Alerts"
          value={stats.pendingAlerts}
          subtitle="Unresolved alerts"
          icon="⚠️"
          color="red"
        />
        <StatCard
          title="Active Cameras"
          value={stats.activeCameras}
          subtitle="Online & monitoring"
          icon="📷"
          color="teal"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActionCard
          title="New Registration"
          description="Register a new visitor with face capture and authorization details."
          button="Start Registration"
          link="/register"
          color="blue"
        />
        <ActionCard
          title="Live Monitoring"
          description="View real-time camera feeds and detection events across all floors."
          button="Open Monitor"
          link="/station"
          color="green"
        />
        <ActionCard
          title="Security Alerts"
          description="Review and manage security violations and suspicious activities."
          button="View Alerts"
          link="/alerts"
          color="red"
        />
      </div>
    </div>
  );
}

/* ---------------------- UI Components ---------------------- */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
}) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    teal: "bg-teal-100 text-teal-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-full text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  button,
  link,
  color,
}: {
  title: string;
  description: string;
  button: string;
  link: string;
  color: string;
}) {
  const buttonColors: any = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-5">{description}</p>
      <Link
        to={link}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${buttonColors[color]}`}
      >
        {button}
      </Link>
    </div>
  );
}

