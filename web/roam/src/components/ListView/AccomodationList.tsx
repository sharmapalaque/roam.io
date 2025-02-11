import React from "react";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import "./AccomodationList.css"; // Import the CSS file

// Define the type for accommodation data
type Accommodation = {
  id: number;
  name: string;
  location: string;
  image: string;
  description: string; // Added description for details page
};

// Dummy data for accommodations
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
    description:
      "A cozy mountain cabin surrounded by nature in Aspen, Colorado.",
  },
  {
    id: 3,
    name: "City Center Studio",
    location: "New York, NY",
    image: "../../../public/Pasted image.png",
    description:
      "A modern studio apartment located in the heart of New York City.",
  },
];

const AccommodationList: React.FC = () => {
  const navigate = useNavigate();

  // Handle click event to navigate to details page
  const handleItemClick = (id: number) => {
    navigate(`/details/${id}`);
  };

  return (
    <div className="list-container">
      <h1 className="list-title">Available Accommodations</h1>
      <List>
        {accommodations.map((accommodation) => (
          <React.Fragment key={accommodation.id}>
            <ListItem
              alignItems="flex-start"
              button
              className="list-item"
              onClick={() => handleItemClick(accommodation.id)}
            >
              <ListItemAvatar>
                <Avatar
                  alt={accommodation.name}
                  src={accommodation.image}
                  className="avatar"
                />
              </ListItemAvatar>
              <ListItemText
                primary={accommodation.name}
                secondary={accommodation.location}
                classes={{
                  primary: "list-item-primary",
                  secondary: "list-item-secondary",
                }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};

export default AccommodationList;
