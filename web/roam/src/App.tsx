import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import AccommodationList from './components/ListView/AccommodationList'
import AccommodationDetails from './components/ListView/AccommodationDetails';
import UserProfile from './components/UserProfile/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accommodation" element={<AccommodationList />} />
        <Route path="/details/:id" element={<AccommodationDetails />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
      </Routes>
    </Router>
  );
}

export default App;
