import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import Home from './components/Home';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import ProfilePending from './components/ProfilePending';
import ProfileBlocked from './components/ProfileBlocked';
import MyScooters from './components/MyScooters';
import RegisterScooterForm from './components/RegisterScooterForm';
import NavBar from "./components/NavBar";
import AdminHome from "./components/AdminHome";
import AdminDashboard from "./components/AdminDashboard";
import ImageChange from "./components/ImageChange";
import MyProfile from "./components/MyProfile";
import Transactions from "./components/Transactions";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoutes from "./components/ProtectedRoutes"
import ProtectedRouteScooter from "./components/ProtectedRouteScooter"
import Unauthorized from "./components/Unauthorized";
import ChatPanel from "./components/ChatPanel";
import ChatWindow from "./components/ChatWindow";
import ChatMessage from "./components/ChatMessage";

/* Import for ScooterCardHome test
import ScooterCardHome from "./components/ScooterCardHome";*/

function App() {
    return (
        <Router>
            <header>
                <NavBar/>
            </header>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/login" element={<LoginForm/>}/>
                <Route path="/register" element={<RegisterForm/>}/>

                <Route path="/chat-panel" element={
                    <ProtectedRoutes>
                        <ChatPanel/>
                    </ProtectedRoutes>
                    }/>


                <Route path="/chat-window" element={
                    <ProtectedRoutes>
                        <ChatWindow/>
                    </ProtectedRoutes>
                }/>


                <Route path="/chat-message" element={
                    <ProtectedRoutes>
                        <ChatMessage/>
                    </ProtectedRoutes>
                }/>

                <Route path="/profile-pending" element={
                        <ProfilePending />
                }/>
                <Route path="/profile-blocked" element={
                        <ProfileBlocked />
                }/>
                <Route path="/scooters" element={
                    <ProtectedRoutes>
                        {/*pending se moze login, ali ne moze dodati scooter*/}
                        <ProtectedRouteScooter>
                            <MyScooters />
                        </ProtectedRouteScooter>
                    </ProtectedRoutes>
                }/>
                <Route path="/add-scooter" element={
                    <ProtectedRoutes>
                        <RegisterScooterForm />
                    </ProtectedRoutes>
                }/>
                <Route path="/my-transactions" element={
                    <ProtectedRoutes>
                        <Transactions />
                    </ProtectedRoutes>
                }/>
                <Route path="/profile" element={
                    <ProtectedRoutes>
                        <MyProfile/>
                    </ProtectedRoutes>
                }/>
                <Route path="/admin-home" element={
                    <AdminRoute>
                        <AdminHome />
                    </AdminRoute>
                } />
                <Route path="/admin-dashboard" element={
                    <AdminRoute>
                        <AdminDashboard/>
                    </AdminRoute>
                }/>
                <Route path="/admin-dashboard/imageChange" element={
                    <AdminRoute>
                        <ImageChange/>
                    </AdminRoute>
                }/>
                <Route path="/unauthorized" element={
                    <Unauthorized/>
                }/>
                {/* Test for just 1 ScooterCardHome - uncomment import and route to test
                <Route path="/scooter" element={<ScooterCardHome/>}/>
                */}


                {/* TODO add all possible routes   */}
            </Routes>
        </Router>
    );
}

export default App;
