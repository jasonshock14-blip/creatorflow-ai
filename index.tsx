import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("CreatorFlow AI: Initializing application mount...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  const msg = "Fatal Error: Root element #root not found in document.";
  console.error(msg);
  document.body.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif;">${msg}</div>`;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("CreatorFlow AI: React application mounted successfully.");
  } catch (error) {
    console.error("CreatorFlow AI: Failed to render application:", error);
    rootElement.innerHTML = `<div style="color: #f87171; padding: 20px; font-family: sans-serif;">
      <h1 style="font-size: 18px; font-weight: bold;">Application Error</h1>
      <p style="font-size: 14px;">The application failed to start. Check the browser console for details.</p>
    </div>`;
  }
}
