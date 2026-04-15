import React, { useEffect, useRef, useState } from "react";
import CameraCapture from "../components/CameraCapture";
import { useFaceApi } from "../hooks/useFaceApi";
import { postRecognition, registerStation } from "../api";

export default function FloorStation() {
  const { ready, getDescriptor } = useFaceApi();
  const [station, setStation] = useState<{ id?: string; token?: string; floor?: number }>({});
  const [setup, setSetup] = useState({ name: "Floor-3 Camera", floor: "3" });
  const [status, setStatus] = useState("Setup not completed");
  const [last, setLast] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 🔁 Recognition Loop
  useEffect(() => {
    let interval: any;
    (async () => {
      if (!station.token || !ready) return;
      const video = document.querySelector("video");
      if (!video) return;

      interval = setInterval(async () => {
        const desc = await getDescriptor(video as HTMLVideoElement);
        if (!desc) return;
        const res = await postRecognition(station.token!, desc);
        setLast(res);

        // 🚨 Play beep for any type of violation or unknown
        if (
          res.matched === false ||
          res.type === "violation" ||
          res.type === "floor_violation" ||
          res.type === "time_violation"
        ) {
          new Audio(
            "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABY..."
          )
            .play()
            .catch(() => {});
        }
      }, 1500);
    })();

    return () => clearInterval(interval);
  }, [station.token, ready]);

  // 🧩 Station Registration Screen
  if (!station.token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
            📷 Floor Station Setup
          </h2>
          <p className="text-gray-600 text-sm mb-6 text-center">
            Register this device as a monitoring station for a specific floor.
            Once registered, it will start detecting and reporting visitors in real time.
          </p>

          <div className="space-y-4">
            <input
              placeholder="Station Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={setup.name}
              onChange={(e) => setSetup({ ...setup, name: e.target.value })}
            />
            <input
              placeholder="Floor Number (e.g. 3)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={setup.floor}
              onChange={(e) => setSetup({ ...setup, floor: e.target.value })}
            />

            <button
              onClick={async () => {
                const { station } = await registerStation(setup.name, Number(setup.floor));
                setStation({ id: station._id, token: station.token, floor: station.floor });
                setStatus(`✅ Registered for Floor ${station.floor}`);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Register Station
            </button>

            <div className="text-center text-gray-600 text-sm mt-2">{status}</div>
          </div>
        </div>
      </div>
    );
  }

  // 🎥 Once Registered — Live Monitoring
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-3 rounded-full">
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
            <h1 className="text-2xl font-bold text-gray-800">SecureVisit Pro — Station</h1>
            <p className="text-gray-500 text-sm">Monitoring Floor {station.floor}</p>
          </div>
        </div>

        <div className="text-sm text-gray-600 font-medium">
          Models:{" "}
          <span
            className={ready ? "text-green-600 font-semibold" : "text-red-600"}
          >
            {ready ? "Loaded ✅" : "Loading…"}
          </span>
        </div>
      </header>

      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🎦 Live Floor Monitoring
        </h3>
        <CameraCapture facingMode="environment" />

        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <b className="text-gray-800">Last Result:</b>{" "}
          <span
            className={`font-medium ${
              !last
                ? "text-gray-500"
                : last.matched === false
                ? "text-orange-600"
                : last.type === "floor_violation"
                ? "text-red-600"
                : last.type === "time_violation"
                ? "text-yellow-600"
                : last.type === "violation"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {last
              ? last.matched === false
                ? "🚨 Unknown person detected"
                : last.type === "floor_violation"
                ? `🚨 Floor Violation — Detected on ${last.detectedFloor}, Expected ${last.requestedFloor}`
                : last.type === "time_violation"
                ? `⏰ Time Violation — Stay exceeded on floor ${last.detectedFloor}`
                : last.type === "violation"
                ? `⚠️ General Violation — Check logs`
                : `✅ Floor match — Correct floor ${last.detectedFloor}`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
