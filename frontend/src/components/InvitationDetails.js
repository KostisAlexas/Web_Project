import React from 'react';
import './InvitationDetails.css';

const InvitationDetails = ({ invitation, onAccept, onReject }) => {
    const isLocked = invitation.status !== 'Pending';

    return (
    <div className="invitation-details-container">
      <div className="invitation-card">
        <div className={`invitation-details ${isLocked ? 'locked' : ''}`}>
            <h2>Πρόσκληση συμμετοχής σε τριμελή</h2>
            <div className="sender-info">
                <img
                    src="/profilePicks/default-profile-pick.png"
                    alt="Profile"
                    className="profile-pic"
                />
                <p>{invitation.student_name}</p>
            </div>
            <div className="message">
                <p>
                    Ο/Η φοιτητής/α <strong>{invitation.student_name}</strong>{' '}
                    σας προσκαλεί να συμμετάσχετε ως μέλος της τριμελούς
                    επιτροπής για την παρακολούθηση και εξέταση της εργασίας του{' '}
                    <strong>{invitation.diploma_title}</strong>, με επιβλέποντα
                    καθηγητή τον/την{' '}
                    <strong>{invitation.supervisor_name}</strong>.
                </p>
                <p>
                    Μέλος είναι επίσης O/H{' '}
                    {invitation.first_member_name ? (
                        <strong>{invitation.first_member_name}</strong>
                    ) : (
                        'δεν έχει οριστεί ακόμα.'
                    )}
                </p>
                <p>
                    {invitation.first_member_name
                        ? 'Θα θέλατε να συμμετάσχετε και εσείς?'
                        : 'Θα θέλατε να είστε ο πρώτος που θα αποδεχτεί τη πρόσκληση?'}
                </p>
            </div>
            {!isLocked && (
                <div className="action-buttons">
                <button onClick={onAccept} className="accept-btn">
                    Δέχομαι! <span>✔</span>
                </button>
                <button onClick={onReject} className="reject-btn">
                    Όχι, ευχαριστώ! <span>✖</span>
                </button>
            </div>
            
            )}
        </div>
      </div>
    </div>
    );
};

export default InvitationDetails;
