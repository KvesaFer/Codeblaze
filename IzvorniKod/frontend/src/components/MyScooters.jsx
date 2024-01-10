import React, {useEffect, useState} from 'react';
import ScooterCardHome from './ScooterCardHome';
import ScooterCard from './ScooterCard';
import RegisterScooterForm from './RegisterScooterForm';
import './MyScooters.css';
import {getNicknameFromToken} from "./RegisterScooterForm";

function MyScooters() {
    const [scooters, setScooters] = useState([]);
    const [listings, setListings] = useState([]);
    const [activeTab, setActiveTab] = useState('viewScooters'); // 'viewScooters' or 'addScooter' or 'viewListings'
    const [user, setUser] = useState('');

    useEffect(() => {
        handleUser();
    }, []);

    useEffect(() => {
        if (user && user.userId) {
            if (activeTab === 'viewScooters') {
                handleViewScooters(user);
            } else if (activeTab === 'viewListings') {
                handleViewListings(user);
            }
        }
    }, [user, activeTab]);

    const addScooter = (newScooter) => {
        setScooters([...scooters, newScooter]);
        setActiveTab('viewScooters'); // Switch back to the view tab after adding
    };

    const handleUser = async (event) => {
        try {
            const response = await fetch(`/api/users/by-nickname/${getNicknameFromToken()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            //console.log(data);
            setUser(data);

        } catch (error) {
            console.error("Failed to get users: ", error);
        }
    };

    const handleViewScooters = async (event) => {
        try {
            const response = await fetch(`/api/scooters/owner/${user.userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setScooters(data);

        } catch (error) {
            console.error("Failed to fetch scooters: ", error);
        }
    };
    const handleViewListings = async () => {
        try {
            const response = await fetch(`/api/scooters/listing/${user.userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setListings(data);
        } catch (error) {
            console.error("Failed to fetch listings: ", error);
        }
    };

    return (
        <div className="my-scooter-container">
            <h2>Moji romobili</h2>
            <div className="tabs">
                <button onClick={() => setActiveTab('viewScooters')}
                        className={activeTab === 'viewScooters' ? 'active' : ''}>
                    Prikaži vlastite romobile
                </button>
                <button onClick={() => setActiveTab('addScooter')}
                        className={activeTab === 'addScooter' ? 'active' : ''}>
                    Dodaj romobil
                </button>
                <button onClick={() => setActiveTab('viewListings')}
                        className={activeTab === 'viewListings' ? 'active' : ''}>
                    Moji oglasi
                </button>
            </div>

            {activeTab === 'viewScooters' && (
                <div className="scooter-list">
                    {scooters.map(scooter => (
                        <ScooterCardHome key={scooter.id} scooter={scooter}/>
                    ))}
                </div>
            )}

            {activeTab === 'addScooter' && (
                <RegisterScooterForm addScooter={addScooter}/>
            )}

            {activeTab === 'viewListings' && (
                <div className="scooter-list">
                    {listings.filter(listing => listing.status === "AVAILABLE").map((listing, index) => (
                        <ScooterCard key={index} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyScooters;
