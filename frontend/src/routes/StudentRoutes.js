import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoutes from '../components/ProtectedRoutes';
import NavBar from '../components/NavBar';
import StudentDashboard from '../features/student/Dashboard';

const StudentRouteWrapper = () => (
    <div>
            <NavBar />
        {/* Στο μέλλον μπορώ να προσθέσω components όπως Sidebar */}
        <ProtectedRoutes requiredRole="student">
            <Outlet />
        </ProtectedRoutes>

    </div>
);



function StudentRoutes() {
    return (
      <Routes>
        <Route element={<StudentRouteWrapper />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          {/* Εδώ μπορούμε να προσθέσουμε επιπλέον routes για τους φοιτητές */}
        </Route>
      </Routes>
    );
}

export default StudentRoutes;
