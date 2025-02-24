// Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import './Header.css';

interface NavigationLink {
  text: string;
  href: string;
  row: 2;
}

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const navigationLinks: NavigationLink[] = [
    { text: 'Accommodation', href: '/accommodation', row: 2 },
    { text: 'Events', href: '/events ', row: 2 },
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
              <span className="header-slogan">DREAM. EXPLORE. DISCOVER.</span>
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
            <button 
              ref={buttonRef}
              className="user-button"
            >
              <User className="user-icon" />
              <span className="user-greeting">Hi, User</span>
            </button>
            {isDropdownOpen && (
              <div 
                ref={dropdownRef}
                className="dropdown-menu"
              >
                <a href="/profile" className="dropdown-item">Your Profile</a>
                <a href="/login" className="dropdown-item">Log Out</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;