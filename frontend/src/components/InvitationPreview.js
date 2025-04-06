import React from 'react';
import './InvitationPreview.css';

const InvitationPreview = ({ invitation, isSelected, onClick }) => {
    const isDepricated = invitation.status === 'Depricated';

    return (
        <div
            className={`invitation-preview ${isSelected ? 'selected' : ''} ${
                isDepricated ? 'depricated' : ''
            }`}
            onClick={!isDepricated ? onClick : null}
        >
            <img
                src="/profilePicks/default-profile-pick.png"
                alt="Profile"
                className="profile-pic"
            />
            <div className="preview-text">
                <p className="sender-name">{invitation.student_name}</p>
                <p className="subject">Πρόσκληση σε τριμελή</p>
            </div>
            <p className="date">
                {new Date(invitation.created_at).toLocaleDateString('el-GR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
            </p>
            <p className="time">
                {new Date(invitation.created_at).toLocaleTimeString('el-GR', {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </p>

        </div>
    );
};

export default InvitationPreview;
