import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import Home from './components/Home';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import ProfilePending from './components/ProfilePending';
import ProfileBlocked from './components/ProfileBlocked';
import MyScooter from './components/MyScooter';
import RegisterScooterForm from './components/RegisterScooterForm';
import NavBar from "./components/NavBar";
import AdminHome from "./components/AdminHome";
import AdminDashboard from "./components/AdminDashboard";
import ImageChange from "./components/ImageChange";
import MyProfile from "./components/MyProfile";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoutes from "./components/ProtectedRoutes"
import Unauthorized from "./components/Unauthorized";
import ChatPanel from "./components/ChatPanel";
import ChatWindow from "./components/ChatWindow";
import ChatMessage from "./components/ChatMessage";

/* Import for ScooterCard test
import ScooterCard from "./components/ScooterCard";*/

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
                <Route path="/chat-panel" element={<ChatPanel/>}/>
                <Route path="/chat-window" element={<ChatWindow/>}/>
                <Route path="/chat-message" element={<ChatMessage/>}/>

                <Route path="/profile-pending" element={
                    <ProtectedRoutes>
                        <ProfilePending/>
                    </ProtectedRoutes>
                }/>
                <Route path="/profile-blocked" element={
                    <ProtectedRoutes>
                        <ProfileBlocked/>
                    </ProtectedRoutes>
                }/>
                <Route path="/scooters" element={
                    <ProtectedRoutes>
                        <MyScooter/>
                    </ProtectedRoutes>
                }/>
                <Route path="/add-scooter" element={
                    <ProtectedRoutes>
                        <RegisterScooterForm/>
                    </ProtectedRoutes>
                }/>
                <Route path="/profile" element={
                    <ProtectedRoutes>
                        <MyProfile/>
                    </ProtectedRoutes>
                }/>
                <Route path="/admin-home" element={
                    <AdminRoute>
                        <AdminHome/>
                    </AdminRoute>
                }/>
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
                {/* Test for just 1 ScooterCard - uncomment import and route to test
                <Route path="/scooter" element={<ScooterCard/>}/>
                */}


                {/* TODO add all possible routes   */}
            </Routes>
        </Router>
    );
}

export default App;
