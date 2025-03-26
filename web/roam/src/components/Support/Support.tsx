import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputLabel
} from '@mui/material';
import {
  Phone,
  LocationOn,
  Send,
  WhatsApp
} from '@mui/icons-material';
import Header from '../Header/Header';
import './Support.css';

// Support Page Component
const Support: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });

  // Handle contact form changes for text fields
  const handleFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm({
      ...contactForm,
      [field]: event.target.value
    });
  };
  
  // Handle contact form changes for select fields
  const handleSelectChange = (field: string) => (event: SelectChangeEvent) => {
    setContactForm({
      ...contactForm,
      [field]: event.target.value
    });
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, this would send the form data to a server
    console.log('Form submitted:', contactForm);
    alert('Thank you for your message. Our support team will get back to you shortly.');
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: ''
    });
  };

  return (
    <div className="support-page-wrapper">
      <Header />
      
      <Box className="support-page">
        {/* Teal header background matching profile page */}
        <Box className="teal-header support-header">
          <Container maxWidth="lg" className="support-container">
            <Box className="support-header-content">
              <Typography variant="h3" className="support-page-title">
                Customer Support
              </Typography>
              <Typography variant="h6" className="support-subtitle">
                We're here to help you with any questions or concerns
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" className="support-content-container">
          {/* Support Options */}
          <Box className="support-section">
            <Typography variant="h4" className="support-section-title" sx={{ color: '#008080' }}>
              Contact Us
            </Typography>
            
            <Grid container spacing={3} className="contact-options">
              <Grid item xs={12} md={6}>
                <Card className="contact-card">
                  <CardContent className="contact-card-content">
                    <Box className="contact-icon-wrapper">
                      <Phone className="contact-icon" />
                    </Box>
                    <Typography variant="h6" className="contact-title">
                      Call Us
                    </Typography>
                    <Typography variant="body1" className="contact-detail">
                      +1 (800) 123-4567
                    </Typography>
                    <Typography variant="body2" className="contact-hours">
                      Available 24/7 for emergency support
                    </Typography>
                    <Typography variant="body2" className="contact-hours">
                      Regular hours: Mon-Fri, 9am-6pm EST
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card className="contact-card">
                  <CardContent className="contact-card-content">
                    <Box className="contact-icon-wrapper">
                      <WhatsApp className="contact-icon" />
                    </Box>
                    <Typography variant="h6" className="contact-title">
                      WhatsApp
                    </Typography>
                    <Typography variant="body1" className="contact-detail">
                      +1 (800) 987-6543
                    </Typography>
                    <Typography variant="body2" className="contact-hours">
                      Perfect for international travelers
                    </Typography>
                    <Typography variant="body2" className="contact-hours">
                      Available 24/7 for text support
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* Office Locations */}
          <Box className="locations-section">
            <Typography variant="h4" className="support-section-title" sx={{ color: '#008080' }}>
              Our Offices
            </Typography>
            
            <Grid container spacing={3} className="office-locations">
              <Grid item xs={12} md={4}>
                <Card className="location-card">
                  <Box 
                    className="location-image" 
                    sx={{
                      backgroundImage: `url('/support/ny.jpg')`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />
                  <CardContent className="location-content">
                    <Typography variant="h6" className="location-title">
                      New York
                    </Typography>
                    <Box className="location-address">
                      <LocationOn className="location-icon" />
                      <Typography variant="body2">
                        123 Broadway, Suite 400<br />
                        New York, NY 10010
                      </Typography>
                    </Box>
                    <Typography variant="body2" className="location-hours">
                      Mon-Fri: 9:00am - 6:00pm EST
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card className="location-card">
                  <Box 
                    className="location-image" 
                    sx={{
                      backgroundImage: `url('/support/miami.jpg')`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />
                  <CardContent className="location-content">
                    <Typography variant="h6" className="location-title">
                      Miami
                    </Typography>
                    <Box className="location-address">
                      <LocationOn className="location-icon" />
                      <Typography variant="body2">
                        456 Ocean Drive<br />
                        Miami, FL 33139
                      </Typography>
                    </Box>
                    <Typography variant="body2" className="location-hours">
                      Mon-Fri: 9:00am - 6:00pm EST
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card className="location-card">
                  <Box 
                    className="location-image" 
                    sx={{
                      backgroundImage: `url('/support/sf.jpg')`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />
                  <CardContent className="location-content">
                    <Typography variant="h6" className="location-title">
                      San Francisco
                    </Typography>
                    <Box className="location-address">
                      <LocationOn className="location-icon" />
                      <Typography variant="body2">
                        789 Market Street, Suite 300<br />
                        San Francisco, CA 94103
                      </Typography>
                    </Box>
                    <Typography variant="body2" className="location-hours">
                      Mon-Fri: 9:00am - 6:00pm PST
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* Contact Form */}
          <Box className="contact-form-section">
            <Typography variant="h4" className="support-section-title" sx={{ color: '#008080' }}>
              Send us a Message
            </Typography>
            
            <Card className="contact-form-card">
              <CardContent className="contact-form-content">
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Your Name"
                        variant="outlined"
                        fullWidth
                        required
                        value={contactForm.name}
                        onChange={handleFormChange('name')}
                        className="form-field"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Your Email"
                        variant="outlined"
                        fullWidth
                        required
                        type="email"
                        value={contactForm.email}
                        onChange={handleFormChange('email')}
                        className="form-field"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth className="form-field category-select">
                        <InputLabel id="category-label">Inquiry Category</InputLabel>
                        <Select
                          labelId="category-label"
                          label="Inquiry Category"
                          value={contactForm.category}
                          onChange={handleSelectChange('category')}
                          required
                        >
                          <MenuItem value="booking">Booking Issues</MenuItem>
                          <MenuItem value="cancel">Cancellation & Refunds</MenuItem>
                          <MenuItem value="account">My Account</MenuItem>
                          <MenuItem value="payment">Payment Problems</MenuItem>
                          <MenuItem value="info">General Information</MenuItem>
                          <MenuItem value="feedback">Feedback</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Subject"
                        variant="outlined"
                        fullWidth
                        required
                        value={contactForm.subject}
                        onChange={handleFormChange('subject')}
                        className="form-field"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Your Message"
                        variant="outlined"
                        fullWidth
                        required
                        multiline
                        rows={6}
                        value={contactForm.message}
                        onChange={handleFormChange('message')}
                        className="form-field message-field"
                      />
                    </Grid>
                    
                    <Grid item xs={12} className="submit-container">
                      <Button
                        type="submit"
                        variant="contained"
                        className="submit-button"
                        startIcon={<Send />}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Box>
          
          {/* Emergency Support */}
          <Box className="emergency-section">
            <Card className="emergency-card">
              <CardContent className="emergency-content">
                <Typography variant="h5" className="emergency-title">
                  Need Emergency Travel Assistance?
                </Typography>
                <Typography 
                  variant="body1" 
                  className="emergency-description" 
                  sx={{ 
                    textAlign: 'center !important',
                    margin: '0 auto',
                    display: 'block',
                    paddingTop: '15px'
                  }}
                >
                  For urgent matters such as canceled flights, lost documents, or medical emergencies while traveling, contact our dedicated 24/7 emergency line.
                </Typography>
                <Box className="emergency-contact">
                  <Phone className="emergency-icon" style={{ color: '#e57373' }} />
                  <Typography variant="h6" className="emergency-number" style={{ color: '#e57373' }}>
                    +1 (800) 999-8888
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

export default Support;