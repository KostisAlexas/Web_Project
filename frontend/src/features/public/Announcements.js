import React, { useState, useEffect } from 'react';
import AnnouncementObject from '../../components/announcementObject';
import AnnouncementService from './AnnouncementService';

const Announcements = ({ startDate, endDate }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAnnouncements = async () => {
            try {
                setLoading(true);
                const data = await AnnouncementService.fetchAnnouncements();
                if (Array.isArray(data)) {
                    setAnnouncements(data);
                    setFilteredAnnouncements(data);
                } else {
                    setAnnouncements([]);
                    setFilteredAnnouncements([]);
                }
            } catch (err) {
                console.error('Error fetching announcements:', err);
                setError('Failed to load announcements.');
            } finally {
                setLoading(false);
            }
        };

        loadAnnouncements();
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            const filtered = announcements.filter(announcement => {
                const createdDate = new Date(announcement.when).getTime();
                return createdDate >= start && createdDate <= end;
            });
            setFilteredAnnouncements(filtered);
        } else {
            setFilteredAnnouncements(announcements);
        }
    }, [startDate, endDate, announcements]);

    useEffect(() => {
        const handleGenerateFeed = (event) => {
            const { outputFormat } = event.detail;
            let content = '';
            if (outputFormat === 'xml') {
                content = `
                    <announcements>
                        ${filteredAnnouncements.map(a => `
                            <announcement>
                                <id>${a.id}</id>
                                <who>${a.who}</who>
                                <what>${a.what}</what>
                                <when>${a.when}</when>
                            </announcement>
                        `).join('')}
                    </announcements>
                `;
            } else {
                content = JSON.stringify(filteredAnnouncements, null, 2);
            }
            window.dispatchEvent(new CustomEvent('feed-generated', { detail: { content } }));
        };

        window.addEventListener('generate-feed', handleGenerateFeed);
        return () => {
            window.removeEventListener('generate-feed', handleGenerateFeed);
        };
    }, [filteredAnnouncements]);

    if (loading) {
        return <div>Loading announcements...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="announcements-list">
            {filteredAnnouncements.map(announcement => (
                <AnnouncementObject
                    key={announcement.id}
                    who={announcement.who || 'Unknown'}
                    photo={announcement.photo || '/profilePicks/default-profile-pick.png'}
                    what={announcement.what || 'No details provided'}
                    when={announcement.when || 'Unknown date'}
                />
            ))}
        </div>
    );
};

export default Announcements;
