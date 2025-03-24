import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Link
} from '@mui/material';
import {
  ExpandMore,
  Home,
  EventNote,
  Info,
  SupportAgent,
  Person
} from '@mui/icons-material';
import Header from '../Header/Header';
import './FAQ.css';

// FAQ categories and questions
interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ReactElement;
  faqs: FaqItem[];
}

// Main FAQ Component
const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  // Handle category tab change
  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveCategory(newValue);
    // Reset expanded state when changing categories
    setExpandedFaq(false);
  };

  // Handle FAQ accordion expansion
  const handleAccordionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  // FAQ categories with their respective questions and answers
  const faqCategories: FaqCategory[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Info fontSize="small" />,
      faqs: [
        {
          question: 'What is Roam.IO?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                Roam.IO is a premium travel booking platform offering accommodation, event tickets, and travel experiences worldwide. We focus on curating high-quality options that create memorable experiences for our users.
              </Typography>
              <Typography variant="body1" align="left">
                Founded in 2025, we're a new but rapidly growing service committed to exceptional travel experiences and unique opportunities for adventurous travelers.
              </Typography>
            </>
          )
        },
        {
          question: 'Which countries do you operate in?',
          answer: (
            <Typography variant="body1" align="left">
              Roam.IO operates globally with accommodation and event listings in over 190 countries. Our most popular destinations include the United States, United Kingdom, France, Italy, Spain, Japan, Australia, Thailand, Mexico, and Canada. We're continuously expanding our offerings to include more unique destinations around the world.
            </Typography>
          )
        }
      ]
    },
    {
      id: 'accommodations',
      label: 'Accommodations',
      icon: <Home fontSize="small" />,
      faqs: [
        {
          question: 'How do I book accommodation?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                Booking accommodation on Roam.IO is easy and secure. Follow these steps:
              </Typography>
              <Typography component="ol" align="left">
                <li>Enter your destination, dates, and number of guests in the search bar</li>
                <li>Browse through available options and use filters to narrow down your search</li>
                <li>Click on a property to view detailed information, photos, amenities, and reviews</li>
                <li>Select your room type and preferred rate</li>
                <li>Fill in your details and payment information</li>
                <li>Review your booking and confirm</li>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }} align="left">
                After booking, you'll receive an immediate confirmation email with all your reservation details.
              </Typography>
            </>
          )
        },
        {
          question: 'What is the cancellation policy for accommodations?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                Cancellation policies vary depending on the property and rate type you select. When booking, you'll see one of these policies:
              </Typography>
              <Typography variant="body1" paragraph align="left">
                <strong>Flexible (Full Refund):</strong> Free cancellation up to 24-48 hours before check-in.
              </Typography>
              <Typography variant="body1" paragraph align="left">
                <strong>Moderate:</strong> Free cancellation up to 5-7 days before check-in. Partial refund (usually 50%) for cancellations after that but before 24-48 hours of check-in.
              </Typography>
              <Typography variant="body1" paragraph align="left">
                <strong>Strict:</strong> Free cancellation within 48 hours of booking if the reservation is made at least 14 days before check-in. 50% refund up until 7 days before check-in.
              </Typography>
              <Typography variant="body1" paragraph align="left">
                <strong>Non-Refundable:</strong> No refunds for cancellations. These rates are typically discounted.
              </Typography>
              <Typography variant="body1" align="left">
                Always check the specific policy for your booking on the property page and in your confirmation email.
              </Typography>
            </>
          )
        },
        {
          question: 'Do you offer group bookings for accommodations?',
          answer: (
            <Typography variant="body1" align="left">
              Yes, we offer special arrangements for group bookings of 8 rooms or more. Our group booking service includes personalized assistance, potential group discounts, and simplified billing options. Contact our dedicated group reservations team at groups@roam.io or call +1 (800) 555-1234. Please provide your destination, dates, number of rooms needed, and any special requirements. We recommend making group bookings at least 3 months in advance for the best availability and rates.
            </Typography>
          )
        }
      ]
    },
    {
      id: 'events',
      label: 'Events',
      icon: <EventNote fontSize="small" />,
      faqs: [
        {
          question: 'What types of events can I book through Roam.IO?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                Roam.IO offers a diverse range of events to enhance your travel experience:
              </Typography>
              <Typography component="ul" align="left">
                <li>Cultural experiences (museum tours, cooking classes, art workshops)</li>
                <li>Adventure activities (hiking, diving, hot air balloon rides)</li>
                <li>Entertainment (concerts, theater shows, festivals)</li>
                <li>Sporting events (matches, tournaments, races)</li>
                <li>Guided city tours and day trips</li>
                <li>Food and wine experiences (tastings, food tours, dining events)</li>
                <li>Wellness activities (yoga retreats, spa packages)</li>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }} align="left">
                Our event offerings vary by destination, with both regular scheduled activities and seasonal special events available.
              </Typography>
            </>
          )
        },
        {
          question: 'Can I get a refund for event tickets?',
          answer: (
            <Typography variant="body1" align="left">
              Refund policies for events depend on the specific event organizer's terms. Generally, most event tickets are non-refundable, but some may allow cancellations up to a certain period before the event date. Each event listing clearly displays its cancellation policy during booking. In case of event cancellation by the organizer, you will typically receive a full refund automatically. For any special circumstances, please contact our customer support team who can assist with your specific situation and potentially reach out to event organizers on your behalf.
            </Typography>
          )
        },
        {
          question: 'How do I receive my event tickets?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                After booking an event, you'll receive your tickets in one of these formats:
              </Typography>
              <Typography component="ul" align="left">
                <li><strong>E-tickets:</strong> Sent to your email and available in your Roam.IO account</li>
                <li><strong>Mobile tickets:</strong> Available through the Roam.IO app with QR codes</li>
                <li><strong>Vouchers:</strong> To be exchanged for physical tickets at the venue</li>
                <li><strong>Confirmation codes:</strong> For events requiring reservation confirmation only</li>
              </Typography>
              <Typography variant="body1" paragraph sx={{ mt: 2 }} align="left">
                Most tickets are delivered immediately after purchase, but some specialty events may take up to 24 hours to process. You can always access your tickets by logging into your Roam.IO account and going to "My Events."
              </Typography>
            </>
          )
        },
        {
          question: 'What should I do if my event is canceled or rescheduled?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                In case of event cancellation or rescheduling:
              </Typography>
              <Typography component="ol" align="left">
                <li>You'll receive an automatic notification via email and app notification</li>
                <li>For canceled events, refunds are typically processed automatically within 7-10 business days</li>
                <li>For rescheduled events, your tickets will usually remain valid for the new date</li>
                <li>If you cannot attend the rescheduled date, you can request a refund through your account</li>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }} align="left">
                If you haven't received notification but believe your event has changed, please contact our support team for assistance.
              </Typography>
            </>
          )
        }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: <SupportAgent fontSize="small" />,
      faqs: [
        {
          question: 'How can I contact customer support?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                There are several ways to contact our customer support team:
              </Typography>
              <Typography component="ul" align="left">
                <li><strong>Email:</strong> support@roam.io (response within 24 hours)</li>
                <li><strong>Phone:</strong> +1 (800) 123-4567 (24/7 for urgent matters)</li>
                <li><strong>Social Media:</strong> Direct message us on Facebook or Twitter</li>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }} align="left">
                For the fastest assistance, please have your booking reference number ready when contacting us.
              </Typography>
            </>
          )
        },
        {
          question: 'What should I do if I encounter issues during my stay?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                If you encounter issues during your accommodation stay:
              </Typography>
              <Typography component="ol" align="left">
                <li>First, contact the property staff directly as most issues can be resolved immediately on-site</li>
                <li>If the issue persists, contact Roam.IO's 24/7 support line at +1 (800) 123-4567</li>
                <li>Our support team can mediate between you and the property</li>
                <li>Document any issues with photos if relevant</li>
                <li>Keep all communication in writing when possible</li>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }} align="left">
                For serious issues affecting your safety or if you cannot stay at the property, our emergency team can help find alternative accommodations.
              </Typography>
            </>
          )
        },
        {
          question: 'Do you offer customer support in different languages?',
          answer: (
            <Typography variant="body1" align="left">
              Yes, our customer support is available in multiple languages. We currently offer support in English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese (Mandarin), Arabic, and Russian. Our phone support line has language selection options. When emailing us, you can write in any of these languages, and we'll respond accordingly. For less common languages, we may use translation services with additional processing time.
            </Typography>
          )
        },
        {
          question: 'What is your customer satisfaction policy?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                At Roam.IO, customer satisfaction is our top priority. Our policy includes:
              </Typography>
              <Typography component="ul" align="left">
                <li><strong>Transparent communication:</strong> Clear information at all stages of booking</li>
                <li><strong>Quality assurance:</strong> Regular verification of our listings and partners</li>
                <li><strong>Fair resolution:</strong> Addressing issues promptly and reasonably</li>
                <li><strong>Goodwill compensation:</strong> In cases where services didn't meet standards</li>
                <li><strong>Continuous improvement:</strong> Using feedback to enhance our services</li>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }} align="left">
                If you're not satisfied with any aspect of our service, please contact our dedicated resolution team at resolution@roam.io with your concerns.
              </Typography>
            </>
          )
        }
      ]
    },
    {
      id: 'about',
      label: 'About Us',
      icon: <Person fontSize="small" />,
      faqs: [
        {
          question: 'Who created Roam.IO?',
          answer: (
            <>
              <Typography variant="body1" paragraph align="left">
                Hey there! We're the team behind Roam.IO – a bunch of passionate developers on a mission to make travel smoother, smarter, and way more fun.
              </Typography>
              <Typography variant="body1" paragraph align="left">
                Meet the crew:
              </Typography>
              <Typography component="ul" align="left">
                <li>
                  <Typography variant="body1" align="left">
                    🚀 <Link href="https://github.com/sharmapalaque" target="_blank" rel="noopener noreferrer" className="github-link">
                      Palaque Sharma
                    </Link>
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" align="left">
                    🔥 <Link href="https://github.com/sanket1305" target="_blank" rel="noopener noreferrer" className="github-link">
                      Sanket Deshmukh
                    </Link>
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" align="left">
                    💡 <Link href="https://github.com/sshaurya84" target="_blank" rel="noopener noreferrer" className="github-link">
                      Shaurya Singh
                    </Link>
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" align="left">
                    🎯 <Link href="https://github.com/Pragyna-Abhishek" target="_blank" rel="noopener noreferrer" className="github-link">
                      Abhi Titty
                    </Link>
                  </Typography>
                </li>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }} align="left">
                We're all about building an awesome platform that helps you explore the world with ease. Adventures should be exciting, not stressful—so we've got your back. Stay tuned, big things are coming! 🌍✨
              </Typography>
            </>
          )
        }
      ]
    }
  ];

  return (
    <div className="faq-page-wrapper">
      <Header />
      
      <Box className="faq-page">
        {/* Teal header background matching profile page */}
        <Box className="teal-header faq-header">
          <Container maxWidth="lg" className="faq-container">
            <Box className="faq-header-content">
              <Typography variant="h3" className="faq-page-title">
                Frequently Asked Questions
              </Typography>
              <Typography variant="h6" className="faq-subtitle">
                Find answers to common questions about using Roam.IO
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" className="faq-content-container">
          {/* FAQ Categories Tabs */}
          <Box className="faq-tabs-container">
            <Tabs
              value={activeCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="FAQ categories"
              className="category-tabs"
            >
              {faqCategories.map((category, index) => (
                <Tab
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  className="category-tab"
                  id={`faq-tab-${index}`}
                  aria-controls={`faq-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>
          
          {/* FAQ Content */}
          <Box className="faq-content" sx={{ mt: 0 }}>
            {/* Show the active category */}
            <Box className="category-faqs">
              <Typography variant="h6" className="active-category-title">
                {faqCategories[activeCategory].label} FAQs
              </Typography>
              
              {faqCategories[activeCategory].faqs.map((faq, faqIndex) => (
                <Accordion
                  key={faqIndex}
                  expanded={expandedFaq === `${faqCategories[activeCategory].id}-${faqIndex}`}
                  onChange={handleAccordionChange(`${faqCategories[activeCategory].id}-${faqIndex}`)}
                  className="faq-accordion"
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore className="expand-icon" />}
                    className="faq-question"
                  >
                    <Typography variant="subtitle1">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="faq-answer">
                    {faq.answer}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
          
          {/* Still Need Help Section */}
          <Box className="need-help-section">
            <Card className="need-help-card">
              <CardContent className="need-help-content">
                <Typography variant="h5" className="need-help-title">
                  Still Have Questions?
                </Typography>
                <Typography variant="body1" className="need-help-text">
                  Our customer support team is here to help you with any specific questions or issues you may have.
                </Typography>
                <Button
                  variant="contained"
                  className="contact-support-button"
                  onClick={() => window.location.href = '/support'}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

export default FAQ;