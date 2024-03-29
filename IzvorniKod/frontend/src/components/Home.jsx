import React, {useState, useEffect} from 'react';
import ScooterCard from "./ScooterCard";
import './Home.css';
import {getNicknameFromToken} from "./RegisterScooterForm";
import WelcomePage from "./WelcomePage";
import Scooter1 from '../assets/romobil1.jpg';
import Scooter2 from '../assets/romobil2.jpg';
import Scooter3 from '../assets/romobil3.jpg';

function Home() {
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState('') //client
    const [availableListings, setAvailableListings] = useState([]);
    const [rentedListings, setRentedListings] = useState([]);
    const text1 = "Dobrodošli na Codeblaze"
    const text2 = "Trenutačno su svi romobili iznajmljeni ili nema dostupnih oglasa!"


    useEffect(() => {
        handleAvailableListings();
    }, []);

    useEffect(() => {
        handleRentedListings();
    }, []);

    useEffect(() => {
        handleUser();
    }, []);


    const handleAvailableListings = async () => {
        setErrorMessage('');
        try {
            const response = await fetch("/api/listing/get-listings/AVAILABLE", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setAvailableListings(data);

        } catch (error) {
            console.error("Failed to fetch scooters: ", error);
            setErrorMessage(error.message);
        }
    };

    const handleRentedListings = async () => {
        setErrorMessage('');
        try {
            const response = await fetch("/api/listing/get-listings/RENTED", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            setRentedListings(data);

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
            <>
                {rentedListings.filter(listing => listing.user.userId === user.userId).length > 0 && (
                    <div className="in-use">
                        <h3>Trenutno koristite:</h3>
                        <div className="scooter-grid">
                            {rentedListings.map((listing, index) => (
                                <ScooterCard key={index} listing={listing}/>
                            ))}
                        </div>
                    </div>
                )}

                {availableListings.length > 0 && (
                    <div className="available">
                        <h3>Dostupni oglasi</h3>
                        <div className="scooter-grid">
                            {availableListings.map((listing, index) => (
                                <ScooterCard key={index} listing={listing}/>
                            ))}
                        </div>
                    </div>
                )}

                {availableListings.length === 0 && rentedListings.filter(listing => listing.user.userId === user.userId).length === 0 && (
                    <WelcomePage
                        photo1={Scooter1}
                        photo2={Scooter2}
                        photo3={Scooter3}
                        textBeforeBreak={text1}
                        textAfterBreak={text2}
                    />
                )}
            </>
        </div>
    );
}

export default Home;