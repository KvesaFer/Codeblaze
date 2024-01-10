import React, {useCallback, useState, useEffect} from 'react';
import './ScooterCard.css'
import {useNavigate} from "react-router-dom";
import {getNicknameFromToken} from "./RegisterScooterForm";
//import { format } from 'date-fns';

function ScooterCardHome({ scooter }) {

    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState('');
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [newImage, setNewImage] = useState('');
    const [comments, setComments] = useState({
        comments: ''
    });
    const [listing, setListing] = useState({
        currentAddress: '',
        returnAddress: '',
        pricePerKilometer: 0.0,
        penaltyFee: 0.0,
        returnByTime: ''
    });

    const { userId, scooterId, imagePath, model, maxSpeed, batteryCapacity, yearOfManufacture, additionalInformation } = scooter;

    const handleButtonClick = (event, action) => {
        event.stopPropagation();
        if (action === 'uredi') {
            openEditModal();
        } else if (action === 'oglasi') {
            openAdModal();
        } else if (action == 'izbrisi') {
            handleDeleteScooter();
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

    const handleUpdateScooter = async (updatedScooter) => {
        try {
            const response = await fetch(`/api/scooters/edited-scooter/${scooterId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedScooter),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Updated scooter:', result);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleDeleteScooter = async () => {
        try {
            const response = await fetch(`/api/scooters/delete/${scooterId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            console.log('Scooter deleted successfully');
            window.location.reload();

        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Failed to delete scooter.');
        }
    };

    const buttons = [
        { text: 'Oglasi', onClick: (e) => handleButtonClick(e, 'oglasi') },
        { text: 'Uredi', onClick: (e) => handleButtonClick(e, 'uredi') },
        { text: 'Izbriši', onClick: (e) => handleButtonClick(e, 'izbrisi') }
    ];

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
            const data = {
                ...localListing,
                scooterData: scooter
            };
            console.log("LOCAL LISTING");
            console.log(localListing);
            try {
                const response = await fetch(`/api/scooters/update-availability/${scooterId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const result = await response.json();
                        console.log('Listing saved:', result);
                    } else {
                        const result = await response.text();
                        console.log('Non-JSON response:', result);
                    }

                    onClose();
                } else {
                    console.error('Error while saving:', response.statusText);
                }
                navigate('/home');
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
                            <input type="number" step="0.1" name="pricePerKilometer"
                                   value={localListing.pricePerKilometer}
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
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                        <button type="submit">Oglasi</button>
                        <button className="modal-close-button" onClick={onClose}>Zatvori</button>
                    </form>
                </div>
            </div>
        );
    };

    function EditScooterModal({ isOpen, onClose, scooter, onUpdate }) {
        const [editedScooter, setEditedScooter] = useState(scooter);

        useEffect(() => {
            if (isOpen) {
                setEditedScooter(scooter);
            }
        }, [isOpen, scooter]);

        const handleChange = (event) => {
            const { name, value } = event.target;
            setEditedScooter(prevScooter => ({
                ...prevScooter,
                [name]: value
            }));
        };


        const handleSubmit = async (event) => {
            event.preventDefault();
            await onUpdate(editedScooter);
            onClose();
        };

        if (!isOpen) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="ad-form">
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input type="text" name="manufacturer" value={editedScooter.manufacturer}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>Model</label>
                            <input type="text" name="model" value={editedScooter.model} onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>Battery Capacity</label>
                            <input type="number" name="batteryCapacity" value={editedScooter.batteryCapacity}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>Max Speed</label>
                            <input type="number" name="maxSpeed" value={editedScooter.maxSpeed}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>Max Range</label>
                            <input type="number" step="0.1" name="maxRange" value={editedScooter.maxRange}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>Year of Manufacture</label>
                            <input type="number" name="yearOfManufacture" value={editedScooter.yearOfManufacture}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>Additional Information</label>
                            <textarea name="additionalInformation" value={editedScooter.additionalInformation}
                                      onChange={handleChange}/>
                        </div>
                        <button type="submit">Spremi</button>
                        <button className="modal-close-button" onClick={onClose}>Zatvori</button>
                    </form>
                </div>
            </div>
        );
    }


    console.log("IsCUO: ", isCurrentUserOwner);
    if (!isCurrentUserOwner) {
        return null;
    }
    return (
        <div className={`scooter ${isExpanded ? 'expanded' : ''}`} onClick={isExpanded ? undefined : handleCardClick}>
            {isExpanded && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="expanded-content">
                            <img src={imagePath} alt={`${model} Scooter`} className="scooter-image"/>
                            <div className="scooter-details">
                                <h3>{model}</h3>
                                <p><strong>Brzina:</strong> {maxSpeed} km/h</p>
                                <p><strong>Kapacitet:</strong> {batteryCapacity} kWh</p>
                                <p><strong>Godina Proizvodnje:</strong> {yearOfManufacture} </p>
                                <p><strong>Dodatne informacije:</strong> {additionalInformation} </p>
                                <p><strong>Doseg:</strong> {scooter.maxRange} </p>
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
            <AdModal
                isOpen={isAdModalOpen}
                onClose={closeAdModal}
            />
            <EditScooterModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                scooter={scooter}
                onUpdate={handleUpdateScooter}
            />
        </div>
    );

}

export default ScooterCardHome;
