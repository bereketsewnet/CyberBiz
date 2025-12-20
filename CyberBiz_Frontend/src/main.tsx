import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress findDOMNode warning from react-quill (known library issue)
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('findDOMNode is deprecated')) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('findDOMNode is deprecated')) {
      return; // Suppress this specific error
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
