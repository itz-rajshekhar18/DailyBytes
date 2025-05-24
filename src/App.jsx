import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Bytes from './components/Bytes';
import BytesBrowser from './components/BytesBrowser';
import ByteDetail from './components/ByteDetail';
import Footer from './components/Footer';

const App = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                <Routes>
                    <Route path="/" element={
                        <>
                            <Hero />
                            <Bytes />
                            <BytesBrowser />
                        </>
                    } />
                    <Route path="/byte/:id" element={<ByteDetail />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
