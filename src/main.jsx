import React from 'react';
import { createRoot } from 'react-dom/client';
import './fonts.css';
import './theme.css';
import { App } from './app.jsx';
import { ErrorBoundary } from './safety.jsx';

createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);
