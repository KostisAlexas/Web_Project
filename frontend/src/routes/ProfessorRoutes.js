import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoutes from '../components/ProtectedRoutes';
import ProfessorDashboard from '../features/professor/dashboard';
import ProfessorInvitations from '../features/professor/InvitationDashboard';
import ProfessorStats from '../features/professor/StatsDashboard';
import ProfessorSidebar from '../components/ProfessorSidebar';
import NavBar from '../components/NavBar';
import './ProfessorLayout.css';


const ProfessorRouteWrapper = () => (
  <div className="professor-layout">
      <ProfessorSidebar />
      <main className="professor-content">
        {/*Τα protected routes μπαίνουν γύρω απο το outlet αλλιώς δεν θα συμπεριληφθούν τα άλλα components*/}
          <ProtectedRoutes requiredRole="professor">
              <Outlet />
          </ProtectedRoutes>
      </main>
      <NavBar />
  </div>
);


function ProfessorRoutes() {
  return (
    <Routes>
      <Route element={<ProfessorRouteWrapper />}>
        <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        <Route path="/professor/invitations" element={<ProfessorInvitations />} />
        <Route path="/professor/stats" element={<ProfessorStats />} />
        {/* Εδώ μπορούμε να προσθέσουμε επιπλέον routes για τον καθηγητή */}

      </Route>
    </Routes>
  );
}

export default ProfessorRoutes;