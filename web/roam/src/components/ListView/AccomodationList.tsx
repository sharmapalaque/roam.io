import React from "react";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Header from '../Header/Header';
import '../Header/Header.css';
import "./AccomodationList.css"; // Import the CSS file


type Accommodation = {
  id: number;
  name: string;
  location: string;
  image: string;
  description: string;
};

const accommodations: Accommodation[] = [
  {
    id: 1,
    name: "Ocean View Apartment",
    location: "Miami, FL",
    image: "../../../public/Pasted image.png",
    description: "A beautiful ocean view apartment located in Miami, FL.",
  },
  {
    id: 2,
    name: "Mountain Cabin",
    location: "Aspen, CO",
    image: "../../../public/Pasted image.png",
    description: "A cozy mountain cabin surrounded by nature in Aspen, Colorado.",
  },
  {
    id: 3,
    name: "City Center Studio",
    location: "New York, NY",
    image: "../../../public/Pasted image.png",
    description: "A modern studio apartment located in the heart of New York City.",
  },
];

const AccommodationList: React.FC = () => {
  const navigate = useNavigate();
  const handleItemClick = (id: number) => {
    navigate(`/details/${id}`);
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <h1 className="page-title">Available Accommodations</h1>
        <List className="accommodations-list">
          {accommodations.map((accommodation) => (
            <React.Fragment key={accommodation.id}>
              <ListItem
                button
                className="accommodation-item"
                onClick={() => handleItemClick(accommodation.id)}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={accommodation.name}
                    src={accommodation.image}
                    className="accommodation-avatar"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={accommodation.name}
                  secondary={accommodation.location}
                  classes={{
                    primary: "item-title",
                    secondary: "item-location",
                  }}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </main>
    </div>
  );
};

export default AccommodationList;
