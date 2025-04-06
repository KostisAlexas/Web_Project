import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import PublicPage from '../features/public/PublicPage';

const PublicRouteWrapper = () => (
    <>
        <NavBar />
        {/* Το Outlet είναι απαραίτητο για να φορτώνονται τα nested routes */}
        <Outlet />
    </>
);

function PublicRoutes() {
    return (
      <Routes>
        <Route element={<PublicRouteWrapper />}>
          <Route path="/" element={<PublicPage />} />
          {/* Εδώ μπορείτε να προσθέσετε επιπλέον routes για το Public */}
        </Route>
      </Routes>
    );
}

export default PublicRoutes;
