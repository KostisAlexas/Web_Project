import React, { useState } from 'react';
import Announcements from './Announcements';
import './PublicPage.css';

const PublicPage = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [outputFormat, setOutputFormat] = useState('json');
    const [generatedContent, setGeneratedContent] = useState('');

    const generateFeed = () => {
        const event = new CustomEvent('generate-feed', {
            detail: { startDate, endDate, outputFormat },
        });

        // Ακούμε το αποτέλεσμα και το αποθηκεύουμε
        window.dispatchEvent(event);
        window.addEventListener('feed-generated', (e) => {
            setGeneratedContent(e.detail.content);
        });
    };

    const downloadContent = () => {
        const blob = new Blob([generatedContent], { type: outputFormat === 'json' ? 'application/json' : 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `announcements.${outputFormat}`;
        link.click();
    };

    return (
        <div className="public-page">
            {/* Announcements Section */}
            <div className="announcements-section">
                <Announcements
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            {/* Filters and Feed Section */}
            <div className="filters-container">
                <div className="filters-section">
                    <h3>Filters</h3>
                    <label>
                        Start Date:
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                        />
                    </label>
                    <label>
                        End Date:
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                        />
                    </label>
                    <select 
                        value={outputFormat} 
                        onChange={e => setOutputFormat(e.target.value)}
                    >
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                    </select>
                    <button onClick={generateFeed}>Generate Feed</button>
                    <button onClick={downloadContent} disabled={!generatedContent}>Download</button>
                </div>

                {/* Feed Display Section */}
                <div className="feed-section">
                    <h3>Generated {outputFormat.toUpperCase()}:</h3>
                    <textarea 
                        value={generatedContent} 
                        readOnly 
                        className="feed-output"
                    />
                    <button onClick={() => navigator.clipboard.writeText(generatedContent)}>Copy to Clipboard</button>
                </div>
            </div>
        </div>
    );
};

export default PublicPage;
