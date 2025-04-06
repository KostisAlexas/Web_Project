import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoutes from '../components/ProtectedRoutes';
import NavBar from '../components/NavBar';
import SecretariatDashboard from '../features/secretariat/dashboard';


const SecretariatRouteWrapper = () => (
    <div>
              <NavBar />
        {/* Στο μέλλον μπορούμε να προσθέσουμε components όπως Sidebar */}
        <ProtectedRoutes requiredRole="professor">
            <Outlet />
        </ProtectedRoutes>
    </div>
);


function SecretariatRoutes() {
    return (
      <Routes>
        <Route element={<SecretariatRouteWrapper />}>
          <Route path="/secretariat/dashboard" element={<SecretariatDashboard />} />
          {/* Εδώ μπορούμε να προσθέσουμε επιπλέον routes για τη Γραμματεία */}
        </Route>
      </Routes>
    );
}

export default SecretariatRoutes;
