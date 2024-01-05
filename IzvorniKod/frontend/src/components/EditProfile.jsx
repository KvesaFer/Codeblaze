import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Make sure this import is correct, usually it's import jwtDecode from 'jwt-decode';
import './MyProfile.css';


export const getNicknameFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return null;
    }
    try {
        const decodedToken = jwtDecode(token);
        return decodedToken.nickname; // Make sure the token structure has 'nickname'
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

function EditProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [privacySettings, setPrivacySettings] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const nickname = getNicknameFromToken();
            if (nickname) {
                try {
                    const response = await fetch(`/api/users/by-nickname/${nickname}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        //console.log("OVO JE NAS USER");
                        //console.log(userData);
                        setUser(userData);

                        fetchPrivacySettings(userData.userId);
                    } else {
                        setErrorMessage('Unable to fetch user data.');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setErrorMessage('An error occurred while fetching user data.');
                }
            } else {
                setErrorMessage('No user token found. Please log in.');
            }
        };

        const fetchPrivacySettings = async (userId) => {
            try {
                //console.log("USER ID: ", userId);
                const response = await fetch(`/api/privacy-settings/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const settings = await response.json();
                    //console.log("privacy settings pri kliku na account: ");
                    //console.log(settings);
                    setPrivacySettings(settings);
                } else {
                    setErrorMessage('Unable to fetch privacy settings.');
                }
            } catch (error) {
                console.error('Error fetching privacy settings:', error);
                setErrorMessage('An error occurred while fetching privacy settings.');
            }
        };




        fetchUserData();
    }, []);

    const handlePrivacyChange = (field, value) => {
        setPrivacySettings({
            ...privacySettings,
            [field]: value,
        });
    };



    if (errorMessage) {
        return <div>Error: {errorMessage}</div>;
    }

    if (!user || !privacySettings) {
        return <div>Loading user data...</div>;
    }




    return (
        <div>
            <div className="container">
                <div className="title">Osobne informacije</div>
                <div className="infoSection">
                    <div className="infoRow">
                        <span className="infoLabel">Ime:</span>
                        <span className="infoValue">{user.firstName}</span>
                    </div>
                    <div className="infoRow">
                        <span className="infoLabel">Prezime:</span>
                        <span className="infoValue">{user.lastName}</span>
                    </div>
                    <div className="infoRow">
                        <span className="infoLabel">Nadimak:</span>
                        <span className="infoValue">{user.nickname}</span>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="title">Kontakt podaci</div>
                <div className="infoSection">
                    <div className="infoRow">
                        <span className="infoLabel">Email:</span>
                        <span className="infoValue">{user.email}</span>
                    </div>
                    <div className="infoRow">
                        <span className="infoLabel">Broj mobitela:</span>
                        <span className="infoValue">{user.phoneNumber}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default EditProfile;