import React, {useCallback, useState, useEffect} from 'react';
import './ScooterCard.css'
import {useNavigate} from "react-router-dom";
import {getNicknameFromToken} from "./RegisterScooterForm";
//import { format } from 'date-fns';

function ScooterCard({ listing }) {

    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState('');
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAdvertised, setIsAdvertised] = useState(false);
    const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [newImage, setNewImage] = useState('');
    const [curUser, setCurUser] = useState('');
    const [comments, setComments] = useState({
        comments: ''
    });

    const { scooter, clientId, status, listingId} = listing;
    const { userId, scooterId, imagePath, model, maxSpeed, batteryCapacity } = scooter;

    useEffect(() => {
        const checkOwnership = async () => {
            const nickname = getNicknameFromToken();
            try {
                const response = await fetch(`/api/users/by-nickname/${nickname}`);
                if (response.ok) {
                    var fetchedUserId = await response.json();
                    fetchedUserId = fetchedUserId.userId;
                    console.log("Fetched User ID: ", fetchedUserId);
                    console.log("OBJEKTNI User ID: ", scooter.user.userId)
                    console.log(scooter.userId == fetchedUserId);
                    setIsCurrentUserOwner(scooter.user.userId == fetchedUserId);
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        checkOwnership();
    }, [scooter.userId]);

    console.log("IsCUO: ", isCurrentUserOwner);
    const determineButtons = () => {
        if (curUser.userId === clientId && status === "RENTED") {
            return [
                { text: 'Vrati', onClick: (e) => handleButtonClick(e, 'vrati') },
                { text: 'Prijavi', onClick: (e) => handleButtonClick(e, 'prijavi') }
            ];
        }
        else if (isCurrentUserOwner) {
            return [
                { text: 'Uredi', onClick: (e) => handleButtonClick(e, 'uredi') },
                { text: 'Izbriši', onClick: (e) => handleButtonClick(e, 'izbrisi') }
            ];
        } else {
            return [
                { text: 'Unajmi', onClick: (e) => handleButtonClick(e, 'unajmi') },
                { text: 'Prijavi', onClick: (e) => handleButtonClick(e, 'prijavi') }
            ];
        }
    };

    const buttons = determineButtons();
    const handleButtonClick = (event, action) => {
        event.stopPropagation();

        if (action === 'prijavi') {
            openRequestModal(imagePath);
        } else if (action === 'uredi') {
            openAdModal();
        } else if (action === 'izbrisi') {
            handleDeleteListing();
        } else if (action === 'unajmi') {
            handleRequest(listingId);
        } else if (action === 'vrati') {
            handleReturn(listingId);
        }
    };

    const openEditModal = useCallback(() => {
        setIsEditModalOpen(true);
    }, []);

    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
    }, []);

    const openImageModal = useCallback((imageSrc) => {
        setCurrentImageSrc(imageSrc);
        setIsImageOpen(true);
    }, []);

    const closeImageModal = useCallback(() => {
        setIsImageOpen(false);
    }, []);

    const openAdModal = useCallback(() => {
        setIsAdModalOpen(true);
    }, []);

    const closeAdModal = useCallback(() => {
        setIsAdModalOpen(false);
    }, []);


    const openRequestModal = useCallback((imageSrc) => {
        setCurrentImageSrc(imageSrc);
        setIsRequestOpen(true);
    }, []);

    const closeRequestModal = useCallback(() => {
        setIsRequestOpen(false);
    }, []);

    const handleCardClick = () => {
        setIsExpanded(true);
    };

    const ImageModal = ({isOpen, onClose, imageSrc, altText }) => {
        if (!isOpen) return null;
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="image-container">
                        <img src={imageSrc} alt={altText} />
                    </div>
                    <div className="modal-close-btn-container">
                        <button className="modal-close-button" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    };

    const handleFileChange = (event, setFileState) => {
        setFileState(event.target.files[0]);
    }

    const handleChange = (event) => {
        setComments({
            ...comments,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const nickname = getNicknameFromToken();
        console.log(nickname);
        if (!nickname) {
            setErrorMessage('User not authenticated.');
            return;
        }

        try {
            // First, make a GET request to fetch the user by nickname
            const userResponse = await fetch(`/api/users/by-nickname/${nickname}`);
            if (!userResponse.ok) {
                console.log(userResponse);
                setErrorMessage('User not found.');
                console.error('User not found:', userResponse.statusText);
                return;
            }
            const user = await userResponse.json();

            const formDataNewImage = new FormData();
            formDataNewImage.append('file', newImage);
            formDataNewImage.append('userkey', "fgJxNmfTGEu8wVx8yi21OVuUxeDefFXn");

            const imageResponse = await fetch('https://vgy.me/upload', {
                method: 'POST',
                body: formDataNewImage,
            });

            if (imageResponse.ok) {
                const imageUploadData = await imageResponse.json();
                const photoUrlCR = imageUploadData.image;

                const newImageFormData = new FormData();
                newImageFormData.append("photoUrlNewImage", new Blob([JSON.stringify(photoUrlCR)], { type: "application/json" }));
                newImageFormData.append('user', new Blob([JSON.stringify(user)], { type: "application/json" }));

                const registrationResponse = await fetch('/api/registration/complete', {
                    method: 'POST',
                    body: newImageFormData,
                });

                if (registrationResponse.ok) {
                    const result = await registrationResponse.json();
                    localStorage.setItem('userStatus', 'registered');
                    navigate('/login');
                } else {
                    console.error("Registration API failed: " + registrationResponse.statusText);
                    setErrorMessage('Registration failed.');
                }
            } else {
                console.error('Image upload failed: ' + imageResponse.statusText);
                setErrorMessage('Image upload failed.');
            }
        } catch (error) {
            console.error('An error occurred: ', error);
            setErrorMessage('Registration failed.');
        }
    };

    /*const fetchScooterAvailability = async () => {
        try {
            const response = await fetch(`/api/scooters/update-availability/${scooterId}`);
            if (response.ok) {
                var data = await response.json();
                console.log(data)
                setIsAdvertised(data.availability);
            } else {
                console.error("Error fetching scooter availability");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchScooterAvailability();
    }, [scooter.scooterId]);*/

    const RequestChangeModal = ({isOpen, onClose, imageSrc, altText }) => {
        if (!isOpen) return null;
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="register-form">
                        {/* File Upload Section */}
                        <div className="section-container">
                            <div className="form-group">
                                <label>Priložiti novu sliku</label>
                                <input type="file" onChange={(e) => handleFileChange(e, setNewImage)} required/>
                            </div>
                            <div className="form-group">
                                <label> Dodatni komentari </label>
                                <input type="text" value={comments.comments} onChange={handleChange}/>
                            </div>
                        </div>
                    </form>
                    <div className="modal-close-btn-container">
                        <button className="modal-close-button" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    };

    const handleDeleteListing = async () => {
        try {
            const response = await fetch(`/api/scooters/delete-listing/${listing.listingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            console.log('Listing deleted successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRequest = async (listingId) => {
        try {
            const data = {status:"REQUESTED"}

            const response = await fetch(`/api/scooters/update-listing-status/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            //tu se salje poruka
            window.location.reload();

            if (!response.ok) {
                throw new Error('Failed to update listing status');
            }

        } catch (error) {
            console.error('Error updating listing status:', error);
        }
    };

    const handleReturn = async (listingId) => {
        try {
            const data = {status:"RETURNED"}

            const response = await fetch(`/api/scooters/update-listing-status/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            navigate('/home');


            if (!response.ok) {
                throw new Error('Failed to update listing status');
            }

        } catch (error) {
            console.error('Error returning scooter:', error);
        }
    };

    const AdModal = ({ isOpen, onClose }) => {
        const [localListing, setLocalListing] = useState({ ...listing });

        useEffect(() => {
            if (isOpen) {
                setLocalListing({
                    ...listing,
                    returnByTime: new Date().toISOString().slice(0, 16) // Postavljanje minimalnog vremena povratka
                });
            }
        }, [isOpen, listing]);

        const handleAdChange = (event) => {
            const { name, value } = event.target;
            setLocalListing({ ...localListing, [name]: value });
        };
        const handleAdSubmit = async (event) => {
            event.preventDefault();
            try {
                const response = await fetch(`/api/scooters/edit-listing/${listing.listingId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(localListing),
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const result = await response.json();
                        console.log('Listing updated:', result);
                    } else {
                        const result = await response.text();
                        console.log('Error:', result);
                    }

                    onClose();
                } else {
                    console.error('Error:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (!isOpen) return null;
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleAdSubmit} className="ad-form">
                        <div className="form-group">
                            <label>Trenutna adresa</label>
                            <input type="text" name="currentAddress" value={localListing.currentAddress}
                                   onChange={handleAdChange}/>
                        </div>
                        <div className="form-group">
                            <label>Adresa povratka</label>
                            <input type="text" name="returnAddress" value={localListing.returnAddress}
                                   onChange={handleAdChange}/>
                        </div>
                        <div className="form-group">
                            <label>Cijena po kilometru</label>
                            <input type="number" step="0.1" name="pricePerKilometer" value={localListing.pricePerKilometer}
                                   onChange={handleAdChange}/>
                        </div>
                        <div className="form-group">
                            <label>Iznos kazne</label>
                            <input type="number" step="0.1" name="penaltyFee" value={localListing.penaltyFee}
                                   onChange={handleAdChange}/>
                        </div>
                        <div className="form-group">
                            <label>Vrijeme povratka</label>
                            <input
                                type="datetime-local"
                                name="returnByTime"
                                value={localListing.returnByTime}
                                onChange={handleAdChange}
                            />
                        </div>
                        <button type="submit">Spremi</button>
                    </form>
                    <button className="modal-close-button" onClick={onClose}>Zatvori</button>
                </div>
            </div>
        );
    };

    /*if (!isAdvertised) {
        return null;
    }*/

    return (
        <div className={`scooter ${isExpanded ? 'expanded' : ''}`} onClick={handleCardClick}>
            {isExpanded && (
                <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="expanded-content">
                            <img src={imagePath} alt={`${model} Scooter`} className="scooter-image"/>
                            <div className="scooter-details">
                                <h3>{model}</h3>
                                <p><strong>Brzina:</strong> {maxSpeed} km/h</p>
                                <p><strong>Kapacitet:</strong> {batteryCapacity} kWh</p>
                                <p><strong>Godina Proizvodnje:</strong> {scooter.yearOfManufacture} </p>
                                <p><strong>Dodatne informacije:</strong> {scooter.additionalInformation} </p>
                                <p><strong>Doseg:</strong> {scooter.maxRange} </p>
                                <p><strong>Trenutna adresa:</strong> {listing.currentAddress} </p>
                                <p><strong>Adresa povratka:</strong> {listing.returnAddress} </p>
                                <p><strong>Cijena po kilometru:</strong> {listing.pricePerKilometer} €/km</p>
                                <p><strong>Kazna:</strong> {listing.penaltyFee} €</p>
                                <p><strong>Vratiti do:</strong> {listing.returnByTime} </p>
                            </div>
                            <div className="scooter-buttons">
                                {buttons.map((button, index) => (
                                    <button key={index} className="scooter-button" onClick={button.onClick}>
                                        {button.text}
                                    </button>
                                ))}
                                <button className="scooter-button" onClick={() => setIsExpanded(false)}>Zatvori</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {!isExpanded && (
                <>
                    <img src={imagePath} alt={`${model} Scooter`} className="scooter-image"/>
                    <div className="scooter-details">
                        <h3>{model}</h3>
                        <p><strong>Brzina:</strong> {maxSpeed} km/h</p>
                        <p><strong>Kapacitet:</strong> {batteryCapacity} kWh</p>
                    </div>
                    <ul className="scooter-buttons">
                        {buttons.map((button, index) => (
                            <li key={index}>
                                <button className="scooter-button" onClick={button.onClick}>
                                    {button.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <ImageModal
                isOpen={isImageOpen}
                onClose={closeImageModal}
                imageSrc={currentImageSrc}
                altText="Romobil"
            />
            <RequestChangeModal
                isOpen={isRequestOpen}
                onClose={closeRequestModal}
                imageSrc={currentImageSrc}
                altText="Romobil"
            />
            <AdModal
                isOpen={isAdModalOpen}
                onClose={closeAdModal}
            />

        </div>
    );
}

export default ScooterCard;
