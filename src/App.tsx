// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import RegisterVisitor from "./pages/RegisterVisitor";
// import FloorStation from "./pages/FloorStation";
// import Dashboard from "./pages/Dashboard";
// import Alerts from "./pages/Alerts";
// import Login from "./pages/Login"; // ✅ new admin login page
// import Navbar from "./components/Navbar"; // ✅ global navbar
// import ProtectedRoute from "./components/ProtectedRoute"; // ✅ route guard

// export default function App() {
//   return (
//     <BrowserRouter>
//       {/* ✅ Global Navbar */}
//       <Navbar />

//       {/* ✅ App Routes */}
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<RegisterVisitor />} />
//         <Route path="/station" element={<FloorStation />} />

//         {/* 🔐 Protected admin routes */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/alerts"
//           element={
//             <ProtectedRoute>
//               <Alerts />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterVisitor from "./pages/RegisterVisitor";
import FloorStation from "./pages/FloorStation";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const token = localStorage.getItem("token"); // check login state

  return (
    <BrowserRouter>
      {/* ✅ Show Navbar only if logged in */}
      {token && <Navbar />}

      <Routes>
        {/* 🔐 Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🧍 Public Route */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 Protected Routes (require login) */}
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <RegisterVisitor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/station"
          element={
            <ProtectedRoute>
              <FloorStation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        {/* 🚫 Catch-All → redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
