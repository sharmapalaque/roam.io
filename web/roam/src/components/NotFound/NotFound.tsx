import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css"; // Import the dedicated CSS file

const NotFound: React.FC = () => {
  return (
    <div className="background">
      <div className="overlay-image"></div>
      <div className="container">
        <div className="not-found-container">
          <h1 className="error-code">404</h1>
          <h2 className="error-message">Oops! Page Not Found</h2>
          <div className="map-illustration"></div>
          <p className="error-description">
            The page you're looking for doesn't exist or has been moved.
            You might have mistyped the address or the page may have moved.
          </p>
          
          <div className="action-buttons">
            <Link to="/">
              <button className="primary-button">GO HOME</button>
            </Link>
            <Link to="/accommodation">
              <button className="secondary-button">FIND STAYS</button>
            </Link>
          </div>
          
          <div className="support-link">
            <p>Need help? <Link to="/Support" className="link">Contact Support</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;