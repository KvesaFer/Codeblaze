import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './RegisterForm.css'
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {FaEye, FaEyeSlash} from 'react-icons/fa';

function RegisterForm() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [criminalRecord, setCriminalRecord] = useState(null);
    const [identificationDocument, setIdentificationDocument] = useState(null);

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    const handleFileChange = (event, setFileState) => {
        setFileState(event.target.files[0]);
    }
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setErrorMessage('');

        const user = {
            email,
            nickname,
            firstName,
            lastName,
            cardNumber,
            phoneNumber,
            password
        };

        try {
            const formDataCR = new FormData();
            formDataCR.append('file', criminalRecord);
            formDataCR.append('userkey', "fgJxNmfTGEu8wVx8yi21OVuUxeDefFXn");

            const responseCR = await fetch('https://vgy.me/upload', {
                method: 'POST',
                body: formDataCR,
            });

            if (responseCR.ok) {
                const imageUploadCR = await responseCR.json();

                const photoUrlCR = imageUploadCR.image;


                const formDataID = new FormData();
                formDataID.append('file', identificationDocument);
                formDataID.append('userkey', "fgJxNmfTGEu8wVx8yi21OVuUxeDefFXn");

                const responseID = await fetch('https://vgy.me/upload', {
                    method: 'POST',
                    body: formDataID,
                });

                    if (responseID.ok) {
                        const imageUploadId = await responseID.json();

                        const photoUrlID = imageUploadId.image;
                        const registrationFormData = new FormData();

                        registrationFormData.append("photoUrlCR", new Blob([JSON.stringify(photoUrlCR)], {type: "application/json"}));
                        registrationFormData.append("photoUrlID", new Blob([JSON.stringify(photoUrlID)], {type: "application/json"}));
                        registrationFormData.append('user', new Blob([JSON.stringify(user)], {type: "application/json"}));

                        const response = await fetch('/api/registration/complete', {
                            method: 'POST',
                            body: registrationFormData,
                        });

                        if (response.ok) {
                            const result = await response.json();
                            localStorage.setItem('userStatus', 'registered'); // Update as needed
                            navigate('/login');
                        } else {
                            console.error("Registration API failed");
                            setShowNotification(true);
                        }
                    } else {
                        console.error('ResponseId failed to upload');
                    }
            } else {

                setErrorMessage('Registration failed.');
                console.error('Registration failed:', responseCR.statusText);
            }
        } catch (error) {

            setErrorMessage('Registration failed.');
            console.error('An error occurred:', error);
        }
    };

    return (
        <div className="register-form-container">
            <h2 className="form-title">Registracija</h2>
            <form onSubmit={handleSubmit} className="register-form">

                {/* Personal Information Section */}
                <div className="section-container">
                    <div className="section-title">Osobni podaci</div>
                    <div className="form-group">
                        <label>Ime:</label>
                        <input type="text" value={firstName}
                               onChange={(e) => setFirstName(e.target.value)}
                               placeholder="Upišite vlastito ime"
                               required/>
                    </div>
                    <div className="form-group">
                        <label>Prezime:</label>
                        <input type="text" value={lastName}
                               onChange={(e) => setLastName(e.target.value)}
                               placeholder="Upišite vlastito prezime"
                               required/>
                    </div>
                    <div className="form-group">
                        <label>Nadimak:</label>
                        <input type="text" value={nickname}
                               onChange={(e) => setNickname(e.target.value)}
                               placeholder="Upišite željeni nadimak"
                               required/>
                    </div>
                </div>


                <div className="section-container">
                    <div className="section-title">Kontakt podaci</div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               placeholder="Upišite vlastitu e-mail adresu"
                               required/>
                    </div>
                    <div className="form-group">
                        <label>Broj mobitela:</label>
                        <PhoneInput defaultCountry="HR" value={phoneNumber}
                                    onChange={setPhoneNumber}
                                    placeholder="Upišite vlastiti broj mobitela"
                                    required/>
                    </div>
                </div>


                <div className="section-container">
                    <div className="section-title">Dokumenti</div>
                    <div className="form-group">
                        <label>Kaznena Evidencija:</label>
                        <input type="file" onChange={(e) => handleFileChange(e, setCriminalRecord)} required/>
                    </div>
                    <div className="form-group">
                        <label>Dokument Identifikacije:</label>
                        <input type="file" onChange={(e) => handleFileChange(e, setIdentificationDocument)} required/>
                    </div>
                </div>

                <div className="section-container">
                    <div className="section-title">Plaćanje i sigurnost</div>
                    <div className="form-group">
                        <label>Broj kartice:</label>
                        <input type="number" value={cardNumber}
                               onChange={(e) => setCardNumber(e.target.value)}
                               placeholder="Upišite broj kartice"
                               required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Lozinka:</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Upišite lozinku"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password-button"
                            >
                                {showPassword ? <FaEyeSlash/> : <FaEye/>}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Potvrdi lozinku:</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Upišite ponovno istu lozinku"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password-button"
                            >
                                {showPassword ? <FaEyeSlash/> : <FaEye/>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <button type="submit" className="register-form-button">Register</button>
                </div>

                {errorMessage && <div className="form-group error-message">{errorMessage}</div>}
            </form>
            {showNotification && (
                <div className="notification-bubble" id="red-notification">
                    Uneseni e-mail,nadimak ili broj mobitela su već iskorišteni.
                    Unesite drugačiju e-mail,nadimak ili broj mobitela te pokušajte ponovno!
                </div>
            )}
        </div>
    );
}

export default RegisterForm;