// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ screens }) => (
  <div className="w-64 bg-gray-800 text-white h-full p-4">
    <h2 className="text-lg font-bold mb-4">Navigation</h2>
    <ul>
      {screens.map((screen, idx) => (
        <li key={idx} className="mb-2">
          <Link to={screen.path}>{screen.label}</Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Sidebar;
