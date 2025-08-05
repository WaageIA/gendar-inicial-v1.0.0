import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Run diagnostics in development
if (import.meta.env.DEV) {
  import('./utils/diagnostics').then(({ runDiagnostics }) => {
    runDiagnostics();
  });
  
  // Load logout diagnostic tools
  import('./utils/logoutDiagnostic');
}

createRoot(document.getElementById("root")!).render(<App />);
