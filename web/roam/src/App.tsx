import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import AccomodationList from './components/ListView/AccomodationList'
import AccommodationDetails from './components/ListView/AccomodationDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accomodation" element={<AccomodationList />} />
        <Route path="/details/:id" element={<AccommodationDetails />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
      </Routes>
    </Router>
  );
}

export default App;
