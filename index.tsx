import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("CreatorFlow AI: Booting up...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CreatorFlow AI: Failed to find root element!");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("CreatorFlow AI: Mount successful.");
} catch (err) {
  console.error("CreatorFlow AI: Critical mount error:", err);
}
