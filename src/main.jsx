import React from 'react';
import ReactDOM from 'react-dom/client';
import router from './modules/router/index.jsx';
import { RouterProvider } from 'react-router-dom';
import './index.css';

console.log(window.location);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
