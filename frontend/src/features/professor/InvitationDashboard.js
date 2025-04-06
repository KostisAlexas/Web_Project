import React, { useEffect, useState } from 'react';
import InvitationService from './InvitationService';
import InvitationPreview from '../../components/InvitationPreview';
import InvitationDetails from '../../components/InvitationDetails';
import './InvitationDashboard.css';

const InvitationDashboard = ({ token }) => {
    const [invitations, setInvitations] = useState([]);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const data = await InvitationService.getInvitations(token);
                setInvitations(data);
            } catch (error) {
                console.error('Error fetching invitations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvitations();
    }, [token]);

    const handleAccept = async () => {
        if (!selectedInvitation) return;
        try {
            const response = await InvitationService.acceptInvitation({
                invitationId: selectedInvitation.id,
                diplomaId: selectedInvitation.diploma_id,
                studentId: selectedInvitation.student_id,
                //professorId: selectedInvitation.supervisor_id, // Κανονικά το professorId θα είναι από το token
            });
            alert(response.message);
            setInvitations((prev) => prev.filter((inv) => inv.id !== selectedInvitation.id));
            setSelectedInvitation(null);
        } catch (error) {
            console.error('Error accepting invitation:', error.response?.data || error.message);
        }
    };

    const handleReject = async () => {
        if (!selectedInvitation) return;
        try {
            const response = await InvitationService.rejectInvitation(selectedInvitation.id);
            alert(response.message);
            setInvitations((prev) => prev.filter((inv) => inv.id !== selectedInvitation.id));
            setSelectedInvitation(null);
        } catch (error) {
            console.error('Error rejecting invitation:', error.response?.data || error.message);
        }
    };

    return (
      <div className="invitation-dashboard">
        <div className="invitation-list">
          {loading ? (
            <p>Loading...</p>
          ) : (
            invitations.map((invitation) => (
              <InvitationPreview
                key={invitation.id}
                invitation={invitation}
                isSelected={selectedInvitation?.id === invitation.id}
                onClick={() => setSelectedInvitation(invitation)}
              />
            ))
          )}
        </div>
        <div className="invitation-details">
          {selectedInvitation ? (
            <InvitationDetails
              invitation={selectedInvitation}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ) : (
            <div className="default-image-container">
              <img 
                src="/invitation_detail_default.webp" 
                alt="Default view" 
                className="default-image"
              />
            </div>
          )}
        </div>
      </div>
    );
}

export default InvitationDashboard;
