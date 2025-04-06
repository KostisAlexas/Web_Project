import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Login from '../features/auth/Login';

const AuthRouteWrapper = () => (
    <>
        {/* Το Outlet είναι απαραίτητο για τα nested routes */}
        <Outlet />
    </>
);

function AuthRoutes() {
  return (
    <Routes>
      <Route element={<AuthRouteWrapper />}>
        <Route path="/login" element={<Login />} />
        {/*<Route path="/logout" element={<Logout />} /> */}
        {/* Εδώ μπορείτε να προσθέσετε επιπλέον routes για την αυθεντικοποίηση */}
      </Route>
    </Routes>
  );
}

export default AuthRoutes;
