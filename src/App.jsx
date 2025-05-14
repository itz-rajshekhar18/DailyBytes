import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Bytes from './components/Bytes';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Bytes />
      <Footer />
    </div>
  );
};

export default App;
