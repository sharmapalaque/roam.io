// Header.tsx
import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import './Header.css';

interface NavigationLink {
  text: string;
  href: string;
  row: number;
}

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigationLinks: NavigationLink[] = [
    { text: 'Accommodation', href: '/accommodation', row: 2 },
    { text: 'Events', href: '/events', row: 2 },
    { text: 'Support', href: '/support', row: 2 },
    { text: 'FAQ', href: '/faq', row: 2 }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img 
            src="https://i.imgur.com/KJStl0F.png" 
            alt="Logo" 
            className="header-logo"
          />
        </div>

        <nav className="header-nav">
          <div className="nav-rows">
            <div className="nav-row">
              <span className="header-slogan">Dream. Explore. Discover.</span>
            </div>
            <div className="nav-row">
              {navigationLinks.map(link => (
                <a key={link.text} href={link.href} className="nav-link">
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="user-section">
          <div 
            className="user-menu"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="user-button">
              <User className="user-icon" />
              <span className="user-greeting">Hi, User</span>
              <ChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} />
            </button>
            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <a href="/profile" className="dropdown-item">Your Profile</a>
              <a href="/login" className="dropdown-item">Log Out</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;