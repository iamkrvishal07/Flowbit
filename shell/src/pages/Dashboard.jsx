// src/pages/Dashboard.jsx
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { getDecodedToken } from '../utils/auth';

const RemoteSupportTicketsApp = lazy(() => import('supportTicketsApp/App'));

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const decoded = getDecodedToken();
    if (decoded) {
      setRole(decoded.role);
      setCustomerId(decoded.customerId);
      setEmail(decoded.email);
    }
  }, []);

  return (
    <div className="text-white text-center mt-10">
      <h1 className="text-3xl font-bold mb-2">Welcome to Dashboard</h1>
      {email && <p className="mb-2">Hello <strong>{email}</strong></p>}
      {customerId && <p className="text-sm mb-4 text-gray-400">Tenant: {customerId}</p>}

      {role === 'Admin' ? (
        <>
          <p className="text-lg mb-4">Loading Support Tickets...</p>
          <div id="microfrontend-container">
            <Suspense fallback={<div>Loading Support Tickets App...</div>}>
              <RemoteSupportTicketsApp />
            </Suspense>
          </div>
        </>
      ) : (
        <p className="text-lg text-red-400">You are a regular user. Support Tickets are not available.</p>
      )}
    </div>
  );
};

export default Dashboard;
