import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <h1>DailyByte</h1>
      <nav>
        <ul>
          <li>Bytes</li>
          <li>Quests</li>
          <li>Profile</li>
          <li><button>Logout</button></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
