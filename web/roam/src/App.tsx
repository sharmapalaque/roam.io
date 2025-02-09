import './App.css';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Typography } from "antd";
const { Header, Content } = Layout
const {Title} = Typography
import Register from './components/Register/Register';
// import Login from './components/Login/Login';

function App() {
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/register" element={<Register />} />
    //     <Route path="/" element={<Login />} /> {/* Default route */}
    //   </Routes>
    // </Router>
    <>
      <Register />
      <Layout>
        <Header className="header">
          <Title
            level={3}
            style={{ color: "white", textAlign: "center", marginTop: "15px" }}
          >
            React Demo
          </Title>
        </Header>
        <Layout style={{padding:""}}></Layout>
      </Layout>
    </>
  );
}

export default App;
