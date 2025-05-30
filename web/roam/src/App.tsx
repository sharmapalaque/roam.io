import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import AccommodationList from './components/ListView/AccommodationList'
import AccommodationDetails from './components/ListView/AccommodationDetails';
import UserProfile from './components/UserProfile/UserProfile';
import EventList from './components/Events/EventList';
import FAQ from './components/FAQ/FAQ';
import Support from './components/Support/Support';
import NotFound from './components/NotFound/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accommodation" element={<AccommodationList />} />
        <Route path="/details/:id" element={<AccommodationDetails />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/Support" element={<Support />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
