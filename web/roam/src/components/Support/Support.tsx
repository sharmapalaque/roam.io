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
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert
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

  // New state for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google Sheet script URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzOt79ETPK9Is4c9XHYYTHRMZn0XR4GCt5T9KVAPB7h36Mwc9501rV88_rbJUTyCRlwA/exec";

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

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSubmitSuccess(false);
    setSubmitError(false);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Add timestamp to form data
      const formData = {
        ...contactForm,
        timestamp: new Date().toISOString()
      };
      
      // Prepare form data for submission
      const formDataForSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        formDataForSubmit.append(key, formData[key as keyof typeof formData]);
      });
      
      // Send data to Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formDataForSubmit,
        mode: 'no-cors'
      });
      
      // Due to CORS, we can't actually check the response status
      // But we can assume it worked if no error was thrown
      setSubmitSuccess(true);
      
      // Reset form
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(true);
      setErrorMessage('There was an error submitting your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Typography
              variant="h4"
              className="support-section-title"
              sx={{ color: "#008080" }}
            >
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
            <Typography
              variant="h4"
              className="support-section-title"
              sx={{ color: "#008080" }}
            >
              Our Offices
            </Typography>

            <Grid container spacing={3} className="office-locations">
              <Grid item xs={12} md={4}>
                <Card className="location-card">
                  <Box
                    className="location-image"
                    sx={{
                      backgroundImage: `url('/support/ny.jpg')`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  />
                  <CardContent className="location-content">
                    <Typography variant="h6" className="location-title">
                      New York
                    </Typography>
                    <Box className="location-address">
                      <LocationOn className="location-icon" />
                      <Typography variant="body2">
                        123 Broadway, Suite 400
                        <br />
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
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  />
                  <CardContent className="location-content">
                    <Typography variant="h6" className="location-title">
                      Miami
                    </Typography>
                    <Box className="location-address">
                      <LocationOn className="location-icon" />
                      <Typography variant="body2">
                        456 Ocean Drive
                        <br />
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
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  />
                  <CardContent className="location-content">
                    <Typography variant="h6" className="location-title">
                      San Francisco
                    </Typography>
                    <Box className="location-address">
                      <LocationOn className="location-icon" />
                      <Typography variant="body2">
                        789 Market Street, Suite 300
                        <br />
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
            <Typography
              variant="h4"
              className="support-section-title"
              sx={{ color: "#008080" }}
            >
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
                        onChange={handleFormChange("name")}
                        className="form-field"
                        disabled={isSubmitting}
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
                        onChange={handleFormChange("email")}
                        className="form-field"
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl
                        variant="outlined"
                        fullWidth
                        className="form-field category-select"
                        disabled={isSubmitting}
                      >
                        <InputLabel id="category-label">
                          Inquiry Category
                        </InputLabel>
                        <Select
                          labelId="category-label"
                          label="Inquiry Category"
                          value={contactForm.category}
                          onChange={handleSelectChange("category")}
                          required
                        >
                          <MenuItem value="booking">Booking Issues</MenuItem>
                          <MenuItem value="cancel">
                            Cancellation & Refunds
                          </MenuItem>
                          <MenuItem value="account">My Account</MenuItem>
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
                        onChange={handleFormChange("subject")}
                        className="form-field"
                        disabled={isSubmitting}
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
                        onChange={handleFormChange("message")}
                        className="form-field message-field"
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12} className="submit-container">
                      <Button
                        type="submit"
                        variant="contained"
                        className="submit-button"
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Send />
                          )
                        }
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
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
                    textAlign: "center !important",
                    margin: "0 auto",
                    display: "block",
                    paddingTop: "15px",
                  }}
                >
                  For urgent matters such as canceled flights, lost documents,
                  or medical emergencies while traveling, contact our dedicated
                  24/7 emergency line.
                </Typography>
                <Box className="emergency-contact">
                  <Phone
                    className="emergency-icon"
                    style={{ color: "#e57373" }}
                  />
                  <Typography
                    variant="h6"
                    className="emergency-number"
                    style={{ color: "#e57373" }}
                  >
                    +1 (800) 999-8888
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Success/Error Messages */}
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // This centers the Snackbar horizontally
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{
            width: "100%",
            "& .MuiAlert-message": {
              // This centers the text inside the Alert
              width: "100%",
              textAlign: "center",
            },
          }}
        >
          Thank you for your message. Our support team will get back to you
          shortly.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Support;