import axios from 'axios';

const API_URL = 'http://localhost:3000/api/fetchAnnouncements';

const fetchAnnouncements = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export default {
    fetchAnnouncements,
};
