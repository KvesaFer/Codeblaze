import React, {useState, useEffect, useCallback} from 'react';
import './AdminDashboard.css'
import {Link} from "react-router-dom";
import ImageNotFound from '../assets/ImageNotFound.png';
import {getNicknameFromToken} from "./RegisterScooterForm";

function AdminDashboard() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [acceptedUsers, setAcceptedUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [rejectedUsers, setRejectedUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [documents, setDocuments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState('');

    useEffect(() => {
        fetchUsers("/api/users/pendingUsers", setPendingUsers);
        fetchUsers("/api/users/acceptedUsers", setAcceptedUsers);
        fetchUsers("/api/users/admins", setAdmins);
        fetchUsers("/api/users/blockedUsers", setBlockedUsers);
        fetchUsers("/api/users/rejectedUsers", setRejectedUsers);
        handleDocument();

    }, []);

    const openModal = useCallback((imageSrc) => {
        setCurrentImageSrc(imageSrc);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleDocument = async () => {
        try {
            const response = await fetch(`/api/documents/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("dokumenti");
            console.log(data);
            setDocuments(data);

        } catch (error) {
            console.error("Failed to fetch documents: ", error);
        }
    };

    const handleStatusChange = async (userId, status) => {
        try {
            const response = await fetch(`/api/users/${userId}/update-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: status })
            });


            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            if (status === 'ACCEPTED') {
                let role = 'USER'
                handleRoleChange(userId, role);
                setPendingUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
                setBlockedUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
                const acceptedUser = pendingUsers.find(user => user.userId === userId) || blockedUsers.find(user => user.userId === userId);
                if (acceptedUser) {
                    setAcceptedUsers(prevUsers => [...prevUsers, { ...acceptedUser, status, role: role }]);
                }
            } else if (status === 'REJECTED') {
                const rejectedUser = pendingUsers.find(user => user.userId === userId);
                if (rejectedUser) {
                    // Add the rejected user to the rejectedUsers state
                    setRejectedUsers(prevUsers => [...prevUsers, { ...rejectedUser, status }]);
                    // Then remove the user from the pendingUsers state
                    setPendingUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
                }
            } else if (status === 'BLOCKED') {
                setAcceptedUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
                const blockedUser = acceptedUsers.find(user => user.userId === userId);
                if (blockedUser) {
                    setBlockedUsers(prevUsers => [...prevUsers, { ...blockedUser, status }]);
                }
            }

        } catch (error) {
            console.error('Error updating status in updating status:', error);
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            const response = await fetch(`/api/users/${userId}/update-role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: role })
            });


            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            if (role === 'ADMIN') {
                const adminUser = acceptedUsers.find(user => user.userId === userId);
                if (adminUser) {
                    // Add to admins list
                    setAdmins(prevAdmins => [...prevAdmins, { ...adminUser, role }]);
                    // Remove from accepted users list
                    setAcceptedUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
                }
            } else if ( role === 'USER') {
                const User = admins.find(user => user.userId === userId);
                if (User) {
                    // Add to admins list
                    setAcceptedUsers(prevAccepted => [...prevAccepted, { ...User, role }]);
                    // Remove from accepted users list
                    setAdmins(prevUsers => prevUsers.filter(user => user.userId !== userId));
                }
            }


        } catch (error) {
            console.error('Error updating role in updating status:', error);
        }
    };

    const fetchUsers = async (url, setState) => {
        setErrorMessage(''); // Resetting the error message

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error in AdminDashboard: ${response.status}`);
            }


            const data = await response.json();
            setState(data); // Setting the state with the fetched data

        } catch (error) {
            console.error("Failed to fetch users: ", error);
            setErrorMessage(error.message);
        }
    };

    const UserTable = ({ users, category, renderActions, id, documents }) => {
        return (
            <div id={id}>
                <h3>{category}</h3>
                {users.length > 0 ? (
                    <table>
                        <thead>
                        <tr>
                            <th>Nickname</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Criminal Record Picture</th>
                            <th>Identification Picture</th>
                            {renderActions && <th>Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => {
                            // Find the document for the current user
                            const document = documents.find(doc => doc.user.userId === user.userId);
                            return (
                                <tr key={user.userId}>
                                    <td>{user.nickname}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phoneNumber}</td>
                                    <td>{user.role}</td>
                                    <td>{user.status}</td>
                                    <td className="user-table-action-buttons">
                                        <button className="user-table-button" onClick={() => openModal(document?.pathCriminalRecord || ImageNotFound)}>View Criminal Record</button>
                                    </td>
                                    <td className="user-table-action-buttons">
                                        <button  className="user-table-button" onClick={() => openModal(document?.pathIdentification || ImageNotFound)}>View Identification</button>
                                    </td>
                                    <td className="action-buttons">{renderActions && renderActions(user)}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                ) : (
                    <p>No {category.toLowerCase()}.</p>
                )}
            </div>
        );
    };

    const ImageModal = ({ isOpen, onClose, imageSrc, altText }) => {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <img src={imageSrc} alt={altText} />
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    };


    const renderPendingActions = (user) => (
        <>
            <button className="approve" onClick={() => handleStatusChange(user.userId, 'ACCEPTED')}>Accept</button>
            <button className="reject" onClick={() => handleStatusChange(user.userId, 'REJECTED')}>Reject</button>
        </>
    );

    const renderAcceptedActions = (user) => (
        <>
            <button className="make-admin" onClick={() => handleRoleChange(user.userId, 'ADMIN')}>Make Admin</button>
            <button className="block" onClick={() => handleStatusChange(user.userId, 'BLOCKED')}>Block User</button>
        </>
    );

    const removeAdmin = (user) => {
        // Assuming getNicknameFromToken() gets the nickname of the currently logged-in user
        const currentUserNickname = getNicknameFromToken();

        return (
            <>
                {(user.nickname !== currentUserNickname && user.nickname !== "admin") ? (
                    <button className="block" onClick={() => handleRoleChange(user.userId, 'USER')}>
                        Remove Admin
                    </button>
                ):(<span>No possible actions</span>)
                }
            </>
        );
    };

    const unblockUser = (user) => (
        <>
            <button className="make-admin" onClick={() => handleStatusChange(user.userId, 'ACCEPTED')}>Unblock User</button>
        </>
    );


    // ...

    return (
        <div>
            <h1>ADMIN DASHBOARD</h1>
            <div className="adminNavBar">
                {/* Links */}
            </div>
            {documents && documents.length > 0 ? (
                <>
                    <UserTable users={pendingUsers} category="Pending Users" renderActions={renderPendingActions} id="pendingUsers" documents={documents}/>
                    <UserTable users={acceptedUsers} category="Accepted Users" renderActions={renderAcceptedActions} id="acceptedUsers" documents={documents}/>
                    <UserTable users={admins} category="ADMINS" id="admins" renderActions={removeAdmin} documents={documents}/>
                    <UserTable users={blockedUsers} category="BLOCKED USERS" id="blockedUsers" renderActions={unblockUser} documents={documents}/>
                    <UserTable users={rejectedUsers} category="Rejected Users" id="rejectedUsers" documents={documents}/>
                </>
            ) : (
                <p>Loading documents...</p> // Or some other placeholder content
            )}
            <ImageModal
                isOpen={isModalOpen}
                onClose={closeModal}
                imageSrc={currentImageSrc}
                altText="Document Image"
            />
        </div>
    );

}

export default AdminDashboard;