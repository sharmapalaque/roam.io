// Header.tsx
import React, { useState, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import './Header.css';

// Define interface for user data
interface UserData {
  name: string;
  avatar_id: string;
}

// Define interface for avatar options
interface AvatarOption {
  id: string;
  src: string;
  name: string;
}

interface NavigationLink {
  text: string;
  href: string;
  row: number;
}

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State for user data (will come from backend)
  const [userData, setUserData] = useState<UserData | null>(null);
  // State for current avatar
  const [currentAvatar, setCurrentAvatar] = useState<AvatarOption | null>(null);
  // State for loading
  const [isLoading, setIsLoading] = useState(true);

  const avatarOptions: AvatarOption[] = [
    { id: 'Bluey', src: '../../../public/avatars/Bluey.png', name: 'Bluey' },
    { id: 'Marshmallow', src: '../../../public/avatars/Marshmallow.png', name: 'Marshmallow' },
    { id: 'Mocha', src: '../../../public/avatars/Mocha.png', name: 'Mocha' },
    { id: 'Nugget', src: '../../../public/avatars/Nugget.png', name: 'Nugget' },
    { id: 'Pearl', src: '../../../public/avatars/Pearl.png', name: 'Pearl' },
    { id: 'Pebbles', src: '../../../public/avatars/Pebbles.png', name: 'Pebbles' },
    { id: 'Pip', src: '../../../public/avatars/Pip.png', name: 'Pip' },
    { id: 'Rusty', src: '../../../public/avatars/Rusty.png', name: 'Rusty' },
    { id: 'Sirius', src: '../../../public/avatars/Sirius.png', name: 'Sirius' },
    { id: 'Snuffles', src: '../../../public/avatars/Snuffles.png', name: 'Snuffles' },
    { id: 'Stripe', src: '../../../public/avatars/Stripe.png', name: 'Stripe' },
    { id: 'Thumper', src: '../../../public/avatars/Thumper.png', name: 'Thumper' },
  ];

  const navigationLinks: NavigationLink[] = [
    { text: 'Accommodation', href: '/accommodation', row: 2 },
    { text: 'Events', href: '/events', row: 2 },
    { text: 'Support', href: '/support', row: 2 },
    { text: 'FAQ', href: '/faq', row: 2 }
  ];

  // Simulate fetching user data from backend
  useEffect(() => {
    // In a real application, this would be an API call
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(
          `http://localhost:8080/users/profile?`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Ensure cookies (like session IDs) are sent
          }
        );

        // Check if response status is NOT ok
        if (!response.ok) {
          // Specifically handle 401 Unauthorized without an alert
          if (response.status === 401) {
            console.log("User not authenticated. Profile data not loaded.");
            setUserData(null); // Ensure user data is cleared
            setIsLoading(false); // Stop loading indicator
            return; // Exit the function early
          }
          // For other errors, throw the error to be caught below
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        // Log the raw response text before parsing
        const responseText = await response.text();
        console.log("Raw profile response text:", responseText);

        // Try to parse the response as JSON
        try {
          const result = JSON.parse(responseText);
          console.log("User profile response:", result);
          // Assuming the profile endpoint returns an object with name and avatarId
          setUserData({ name: result.name, avatar_id: result.avatar_id }); 
          setIsLoading(false);

        } catch (error) {
          console.error("Error parsing profile JSON:", error);
          // Optionally alert or handle JSON parsing error differently
          // alert("Failed to parse profile response"); 
          setIsLoading(false); 
        }
      } catch (error) {
        // This will now catch network errors or non-401 HTTP errors
        console.error("Error fetching user profile:", error);
        // Avoid alerting for general fetch errors unless needed
        // alert(error); 
        setUserData(null);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Find avatar by ID from userData
  useEffect(() => {
    if (userData && userData.avatar_id) {
      const avatar = avatarOptions.find(avatar => avatar.id === userData.avatar_id);
      setCurrentAvatar(avatar || null);
    }
  }, [userData]);

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
              {isLoading ? (
                <User className="user-icon" />
              ) : (
                currentAvatar ? (
                  <div className="header-avatar-wrapper">
                    <img 
                      src={currentAvatar.src} 
                      alt={currentAvatar.name}
                      className="header-avatar-image" 
                    />
                  </div>
                ) : (
                  <div className="header-avatar-wrapper">
                    <div className="header-avatar-placeholder">
                      {userData?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                )
              )}
              <span className="user-greeting">
                {isLoading ? 'Hi, User' : `Hi, ${userData?.name?.split(' ')[0] || 'User'}`}
              </span>
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