import axios from 'axios';

const GET_INVITATIONS_API_URL = 'http://localhost:3000/api/professors/invitations';
const ACCEPT_INVITATION_API_URL = 'http://localhost:3000/api/professors/invitations/accept';
const REJECT_INVITATION_API_URL = 'http://localhost:3000/api/professors/invitations/reject';

// Configure axios for protected routes
const config = () => ({
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Allow cookies to be sent with requests
});

const InvitationService = {
    getInvitations: async () => {
        const response = await axios.get(GET_INVITATIONS_API_URL, config());
        return response.data;
    },

    acceptInvitation: async (invitationData) => {
        const response = await axios.post(ACCEPT_INVITATION_API_URL, invitationData, config());
        return response.data;
    },

    rejectInvitation: async (invitationId) => {
        const response = await axios.post(REJECT_INVITATION_API_URL, { invitationId }, config());
        return response.data;
    },
};

export default InvitationService;
