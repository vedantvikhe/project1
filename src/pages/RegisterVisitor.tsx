// import React, { useRef, useState } from "react";
// import CameraCapture from "../components/CameraCapture";
// import { useFaceApi } from "../hooks/useFaceApi";
// import { createVisitor } from "../api";

// export default function RegisterVisitor() {
//   const { ready, error, getDescriptor } = useFaceApi();
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [photo, setPhoto] = useState<string>("");
//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     idNumber: "",
//     requestedFloor: "",
//     allowedDuration: "", // ⏱️ NEW FIELD
//   });
//   const [msg, setMsg] = useState<string>("");

//   const handleRegister = async () => {
//     try {
//       if (!ready) {
//         setMsg("❌ Models not loaded yet. Please wait...");
//         return;
//       }
//       if (!photo) {
//         setMsg("⚠️ Please capture a photo first.");
//         return;
//       }
//       if (
//         !form.name.trim() ||
//         !form.phone.trim() ||
//         !form.requestedFloor.trim() ||
//         !form.allowedDuration.trim()
//       ) {
//         setMsg("⚠️ All fields except ID are required.");
//         return;
//       }

//       setMsg("🧠 Detecting face…");

//       const img = new Image();
//       img.src = photo;
//       await img.decode();

//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d")!;
//       ctx.drawImage(img, 0, 0);

//       const descriptor = await getDescriptor(canvas);
//       if (!descriptor) {
//         setMsg("❌ No face detected. Please retake the photo.");
//         return;
//       }

//       // ✅ include allowedDuration
//       const payload = {
//         name: form.name.trim(),
//         phone: form.phone.trim(),
//         idNumber: form.idNumber.trim(),
//         requestedFloor: Number(form.requestedFloor),
//         allowedDuration: Number(form.allowedDuration), // ⏱️ send to backend
//         photoDataUrl: photo,
//         descriptor: { data: descriptor },
//       };

//       const { visitor, visit } = await createVisitor(payload);
//       setMsg(`✅ ${visitor.name} registered successfully! Visit ID: ${visit._id}`);
//       setPhoto("");
//       setForm({
//         name: "",
//         phone: "",
//         idNumber: "",
//         requestedFloor: "",
//         allowedDuration: "",
//       });
//     } catch (err: any) {
//       console.error("Registration error:", err);
//       setMsg(`❌ Failed to register visitor: ${err.message || err}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
//       <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Register Visitor</h1>
//             <p className="text-gray-500 text-sm">
//               Capture face data and store visitor details for secure building access.
//             </p>
//           </div>
//           <div
//             className={`px-4 py-1 rounded-full text-sm font-medium ${
//               ready
//                 ? "bg-green-100 text-green-700"
//                 : error
//                 ? "bg-red-100 text-red-700"
//                 : "bg-yellow-100 text-yellow-700"
//             }`}
//           >
//             {ready
//               ? "✅ Models Loaded"
//               : error
//               ? "❌ Model Load Error"
//               : "⏳ Loading Models"}
//           </div>
//         </div>

//         {/* Hidden video */}
//         <video ref={videoRef} id="hidden-video" style={{ display: "none" }} />

//         {/* Main Form */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Camera Section */}
//           <div className="flex flex-col items-center gap-4">
//             <CameraCapture onShot={setPhoto} />
//             {photo && (
//               <img
//                 src={photo}
//                 alt="Captured"
//                 className="w-full rounded-xl border border-gray-200 shadow-sm object-cover"
//               />
//             )}
//           </div>

//           {/* Form Section */}
//           <div className="flex flex-col gap-4">
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="text"
//               placeholder="Phone Number"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="text"
//               placeholder="ID Number (optional)"
//               value={form.idNumber}
//               onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="number"
//               placeholder="Requested Floor (e.g. 4)"
//               value={form.requestedFloor}
//               onChange={(e) => setForm({ ...form, requestedFloor: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="number"
//               placeholder="Allowed Duration (minutes)"
//               value={form.allowedDuration}
//               onChange={(e) => setForm({ ...form, allowedDuration: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />

//             <button
//               disabled={!ready}
//               onClick={handleRegister}
//               className={`mt-4 px-6 py-3 rounded-lg font-semibold text-white transition shadow-sm ${
//                 ready
//                   ? "bg-blue-600 hover:bg-blue-700"
//                   : "bg-gray-400 cursor-not-allowed"
//               }`}
//             >
//               {ready ? "Save Registration" : "Loading Models..."}
//             </button>
//           </div>
//         </div>

//         {/* Status Message */}
//         {msg && (
//           <div
//             className={`mt-6 p-4 rounded-lg text-sm font-medium text-center ${
//               msg.startsWith("✅")
//                 ? "bg-green-50 text-green-700 border border-green-200"
//                 : msg.startsWith("❌")
//                 ? "bg-red-50 text-red-700 border border-red-200"
//                 : "bg-yellow-50 text-yellow-700 border border-yellow-200"
//             }`}
//           >
//             {msg}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import React, { useRef, useState } from "react";
// import CameraCapture from "../components/CameraCapture";
// import { useFaceApi } from "../hooks/useFaceApi";
// import { createVisitor } from "../api";

// export default function RegisterVisitor() {
//   const { ready, error, getDescriptor } = useFaceApi();
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [photo, setPhoto] = useState<string>("");
//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     idNumber: "",
//     requestedFloor: "",
//     allowedDuration: "", // ⏱️ duration in minutes
//   });
//   const [msg, setMsg] = useState<string>("");

//   const handleRegister = async () => {
//     try {
//       if (!ready) {
//         setMsg("❌ Models not loaded yet. Please wait...");
//         return;
//       }
//       if (!photo) {
//         setMsg("⚠️ Please capture a photo first.");
//         return;
//       }

//       if (
//         !form.name.trim() ||
//         !form.phone.trim() ||
//         !form.requestedFloor.trim() ||
//         !form.allowedDuration.trim()
//       ) {
//         setMsg("⚠️ All fields except ID are required.");
//         return;
//       }

//       const requestedFloorNum = Number(form.requestedFloor);
//       const allowedDurationNum = Number(form.allowedDuration);

//       if (isNaN(requestedFloorNum) || requestedFloorNum <= 0) {
//         setMsg("⚠️ Requested floor must be a valid number.");
//         return;
//       }
//       if (isNaN(allowedDurationNum) || allowedDurationNum <= 0) {
//         setMsg("⚠️ Allowed duration must be a positive number.");
//         return;
//       }

//       setMsg("🧠 Detecting face…");

//       const img = new Image();
//       img.src = photo;
//       await img.decode();

//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       // ✅ Fix Chrome warning about frequent readback
//       const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
//       ctx.drawImage(img, 0, 0);

//       const descriptor = await getDescriptor(canvas);
//       if (!descriptor) {
//         setMsg("❌ No face detected. Please retake the photo.");
//         return;
//       }

//       // ✅ Include allowedDuration properly
//       const payload = {
//         name: form.name.trim(),
//         phone: form.phone.trim(),
//         idNumber: form.idNumber.trim(),
//         requestedFloor: requestedFloorNum,
//         allowedDuration: allowedDurationNum, // ⏱️ send to backend
//         photoDataUrl: photo,
//         descriptor: { data: descriptor },
//       };

//       const { visitor, visit } = await createVisitor(payload);
//       setMsg(`✅ ${visitor.name} registered successfully! Visit ID: ${visit._id}`);

//       // reset form
//       setPhoto("");
//       setForm({
//         name: "",
//         phone: "",
//         idNumber: "",
//         requestedFloor: "",
//         allowedDuration: "",
//       });
//     } catch (err: any) {
//       console.error("Registration error:", err);
//       setMsg(`❌ Failed to register visitor: ${err.message || err}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
//       <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Register Visitor</h1>
//             <p className="text-gray-500 text-sm">
//               Capture face data and store visitor details for secure building access.
//             </p>
//           </div>
//           <div
//             className={`px-4 py-1 rounded-full text-sm font-medium ${
//               ready
//                 ? "bg-green-100 text-green-700"
//                 : error
//                 ? "bg-red-100 text-red-700"
//                 : "bg-yellow-100 text-yellow-700"
//             }`}
//           >
//             {ready
//               ? "✅ Models Loaded"
//               : error
//               ? "❌ Model Load Error"
//               : "⏳ Loading Models"}
//           </div>
//         </div>

//         {/* Hidden video */}
//         <video ref={videoRef} id="hidden-video" style={{ display: "none" }} />

//         {/* Main Form */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Camera Section */}
//           <div className="flex flex-col items-center gap-4">
//             <CameraCapture onShot={setPhoto} />
//             {photo && (
//               <img
//                 src={photo}
//                 alt="Captured"
//                 className="w-full rounded-xl border border-gray-200 shadow-sm object-cover"
//               />
//             )}
//           </div>

//           {/* Form Section */}
//           <div className="flex flex-col gap-4">
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="text"
//               placeholder="Phone Number"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="text"
//               placeholder="ID Number (optional)"
//               value={form.idNumber}
//               onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="number"
//               placeholder="Requested Floor (e.g. 4)"
//               value={form.requestedFloor}
//               onChange={(e) => setForm({ ...form, requestedFloor: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//             <input
//               type="number"
//               placeholder="Allowed Duration (minutes)"
//               value={form.allowedDuration}
//               onChange={(e) => setForm({ ...form, allowedDuration: e.target.value })}
//               className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//             />

//             <button
//               disabled={!ready}
//               onClick={handleRegister}
//               className={`mt-4 px-6 py-3 rounded-lg font-semibold text-white transition shadow-sm ${
//                 ready
//                   ? "bg-blue-600 hover:bg-blue-700"
//                   : "bg-gray-400 cursor-not-allowed"
//               }`}
//             >
//               {ready ? "Save Registration" : "Loading Models..."}
//             </button>
//           </div>
//         </div>

//         {/* Status Message */}
//         {msg && (
//           <div
//             className={`mt-6 p-4 rounded-lg text-sm font-medium text-center ${
//               msg.startsWith("✅")
//                 ? "bg-green-50 text-green-700 border border-green-200"
//                 : msg.startsWith("❌")
//                 ? "bg-red-50 text-red-700 border border-red-200"
//                 : "bg-yellow-50 text-yellow-700 border border-yellow-200"
//             }`}
//           >
//             {msg}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useRef, useState } from "react";
import CameraCapture from "../components/CameraCapture";
import { useFaceApi } from "../hooks/useFaceApi";
import { createVisitor } from "../api";
import Navbar from "../components/Navbar";

export default function RegisterVisitor() {
  const { ready, error, getDescriptor } = useFaceApi();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photo, setPhoto] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"camera" | "upload">("camera");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    idNumber: "",
    requestedFloor: "",
    allowedDuration: "",
  });
  const [msg, setMsg] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    try {
      if (!ready) {
        setMsg("❌ Models not loaded yet. Please wait...");
        return;
      }
      if (!photo) {
        setMsg("⚠️ Please capture or upload a photo first.");
        return;
      }

      if (
        !form.name.trim() ||
        !form.phone.trim() ||
        !form.requestedFloor.trim() ||
        !form.allowedDuration.trim()
      ) {
        setMsg("⚠️ All fields except ID are required.");
        return;
      }

      const requestedFloorNum = Number(form.requestedFloor);
      const allowedDurationNum = Number(form.allowedDuration);

      if (isNaN(requestedFloorNum) || requestedFloorNum <= 0) {
        setMsg("⚠️ Requested floor must be a valid number.");
        return;
      }
      if (isNaN(allowedDurationNum) || allowedDurationNum <= 0) {
        setMsg("⚠️ Allowed duration must be a positive number.");
        return;
      }

      setMsg("🧠 Detecting face…");

      const img = new Image();
      img.src = photo;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);

      const descriptor = await getDescriptor(canvas);
      if (!descriptor) {
        setMsg("❌ No face detected. Please try again or choose another image.");
        return;
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        idNumber: form.idNumber.trim(),
        requestedFloor: requestedFloorNum,
        allowedDuration: allowedDurationNum,
        photoDataUrl: photo,
        descriptor: { data: descriptor },
      };

      const { visitor, visit } = await createVisitor(payload);
      setMsg(`✅ ${visitor.name} registered successfully! Visit ID: ${visit._id}`);

      // reset form
      setPhoto("");
      setForm({
        name: "",
        phone: "",
        idNumber: "",
        requestedFloor: "",
        allowedDuration: "",
      });
      setUploadMode("camera");
    } catch (err: any) {
      console.error("Registration error:", err);
      setMsg(`❌ Failed to register visitor: ${err.message || err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Register Visitor</h1>
            <p className="text-gray-500 text-sm">
              Capture or upload a photo to register visitor access securely.
            </p>
          </div>
          <div
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              ready
                ? "bg-green-100 text-green-700"
                : error
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {ready
              ? "✅ Models Loaded"
              : error
              ? "❌ Model Load Error"
              : "⏳ Loading Models"}
          </div>
        </div>

        {/* Hidden video */}
        <video ref={videoRef} id="hidden-video" style={{ display: "none" }} />

        {/* Capture / Upload Toggle */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setUploadMode("camera")}
            className={`flex-1 p-2 rounded-lg font-semibold border ${
              uploadMode === "camera"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            📸 Use Camera
          </button>
          <button
            onClick={() => setUploadMode("upload")}
            className={`flex-1 p-2 rounded-lg font-semibold border ${
              uploadMode === "upload"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            🖼️ Upload Photo
          </button>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera or Upload Section */}
          <div className="flex flex-col items-center gap-4">
            {uploadMode === "camera" ? (
              <CameraCapture onShot={setPhoto} />
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="p-3 w-full border border-gray-300 rounded-lg"
              />
            )}
            {photo && (
              <img
                src={photo}
                alt="Captured or Uploaded"
                className="w-full rounded-xl border border-gray-200 shadow-sm object-cover"
              />
            )}
          </div>

          {/* Form Section */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <input
              type="text"
              placeholder="ID Number (optional)"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <input
              type="number"
              placeholder="Requested Floor (e.g. 4)"
              value={form.requestedFloor}
              onChange={(e) => setForm({ ...form, requestedFloor: e.target.value })}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <input
              type="number"
              placeholder="Allowed Duration (minutes)"
              value={form.allowedDuration}
              onChange={(e) => setForm({ ...form, allowedDuration: e.target.value })}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            <button
              disabled={!ready}
              onClick={handleRegister}
              className={`mt-4 px-6 py-3 rounded-lg font-semibold text-white transition shadow-sm ${
                ready
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {ready ? "Save Registration" : "Loading Models..."}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {msg && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm font-medium text-center ${
              msg.startsWith("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : msg.startsWith("❌")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
