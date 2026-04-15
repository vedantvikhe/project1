import * as faceapi from "@vladmandic/face-api";
import { useEffect, useState } from "react";

export function useFaceApi() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const base = "/models"; // ✅ models folder at public/models
        console.log("🔍 Loading models from", base);

        await Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
]);


        console.log("✅ All models loaded successfully");
        setReady(true);
      } catch (err: any) {
        console.error("❌ Error loading models:", err);
        setError(err.message || "Failed to load models");
      }
    })();
  }, []);

  async function getDescriptor(videoOrCanvas: HTMLVideoElement | HTMLCanvasElement) {
    const det = await faceapi
      .detectSingleFace(
        videoOrCanvas,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!det) return null;
    return Array.from(det.descriptor);
  }

  return { ready, error, getDescriptor };
}
