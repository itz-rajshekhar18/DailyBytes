import React from 'react';

const Footer = () => {
  return (
    <footer>
      <p>Empowering minds through daily psychological insights and growth.</p>
      <div className="footer-links">
        <a href="#">About Us</a>
        <a href="#">Contact</a>
        <a href="#">Privacy Policy</a>
      </div>
      <div className="newsletter">
        <input type="email" placeholder="Enter your email" />
        <button>Subscribe</button>
      </div>
      <p>&copy; 2025 DailyByte. All rights reserved.</p>
    </footer>
  );
};

export default Footer;