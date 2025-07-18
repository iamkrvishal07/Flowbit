// src/federation/SupportTicketsApp.jsx
import React, { lazy, Suspense } from 'react';
const RemoteSupportTicketsApp = lazy(() => import('supportTicketsApp/App'));

const SupportTicketsApp = () => (
  <Suspense fallback={<div>Loading Support Tickets...</div>}>
    <RemoteSupportTicketsApp />
  </Suspense>
);

export default SupportTicketsApp;
