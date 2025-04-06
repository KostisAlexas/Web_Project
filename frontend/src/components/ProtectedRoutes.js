import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoutes = ({ requiredRole }) => {
    /*
    const cookies = document.cookie.split(';');
    const token = cookies.find(cookie => cookie.trim().startsWith('token=')); */
  
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await axios.get('/api/auth/verify');
                const { role } = response.data;

                if (role === requiredRole) {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error('Authorization error:', error.message);
            } finally {
                setIsLoading(false);
            }
        };

        verifyUser();
    }, [requiredRole]);

    if (isLoading) {
        return <div>Loading...</div>; // Εμφάνιση loading μέχρι να ολοκληρωθεί η επαλήθευση.
    }

    if (!isAuthorized) {
        return <Navigate to="/login" replace />; // Ανακατεύθυνση αν ο χρήστης δεν είναι εξουσιοδοτημένος.
    }
/*
    if (!token) {
        return <Navigate to="/login" replace />;
    }
*/
    return <Outlet />; // Φορτώνει το child route.
};

export default ProtectedRoutes;
