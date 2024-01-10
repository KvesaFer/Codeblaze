import React, {useState, useEffect} from 'react';
import ScooterCard from "./ScooterCard";
import './Home.css';
import {getNicknameFromToken} from "./RegisterScooterForm";

function Home() {
    const [listings, setListings] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState('') //client
    const rentedListings = listings.filter(listing => (listing.status === "RENTED" && listing.clientId === user.userId));
    const availableListings = listings.filter(listing => (listing.status === "AVAILABLE" ));

    useEffect(() => {
        handleHome();
    }, []);

    useEffect(() => {
        handleUser();
    }, []);

    const handleHome = async () => {
        setErrorMessage('');
        try {
            const response = await fetch("/api/scooters/get-all-scooters", {
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
            console.error("Failed to fetch scooters: ", error);
            setErrorMessage(error.message);
        }
    };

    const handleUser = async () => {
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
            setUser(data);

        } catch (error) {
            console.error("Failed to get users: ", error);
        }
    };


    return (
        <div>
            {(rentedListings.length > 0) && (
                <div className="in-use">
                    <h2>Trenutno koristite:</h2>
                    <div className="scooter-grid">
                        {rentedListings.map((listing, index) => (
                            <ScooterCard key={index} listing={listing} />
                        ))}
                    </div>
                </div>
            )}

            {(availableListings.length > 0) && (
                <div className="available">
                    <h2>Dostupni oglasi:</h2>
                    <div className="scooter-grid">
                        {listings.filter(listing => listing.status === "AVAILABLE").map((listing, index) => (
                            <ScooterCard key={index} listing={listing} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;