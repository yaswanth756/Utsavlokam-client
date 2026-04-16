import { StrictMode, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { GoogleOAuthProvider } from '@react-oauth/google'; // 🔥 NEW
import { HelmetProvider } from 'react-helmet-async';

// Ref guard to prevent double rendering in StrictMode
const AppWithRefGuard = () => {
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    if (hasRenderedRef.current) return;
    hasRenderedRef.current = true;
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
          <ToastContainer position="top-right" autoClose={3000} newestOnTop />
        </BrowserRouter>
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithRefGuard />
  </StrictMode>,
);
