import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#111827",
            color: "#fff",
            borderRadius: "14px",
            padding: "14px 16px",
          },
          success: {
            style: {
              background: "#16a34a",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "#dc2626",
              color: "#fff",
            },
          },
        }}
      />
    </>
  </React.StrictMode>
);