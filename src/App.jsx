import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Hero from './components/Hero';
import Bytes from './components/Bytes';
import Footer from './components/Footer';

const App = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5001/api/byte') // Make sure this URL is correct
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div className="app">
            <Header />
            <Hero />
            <Bytes data={data} /> {/* Passing the data to the Bytes component */}
            <Footer />
        </div>
    );
};

export default App;
