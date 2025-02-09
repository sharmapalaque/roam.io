import "./App.css";
import Register from "./components/Register/Register";
import { Layout, Typography } from "antd";
const { Header, Content } = Layout
const {Title} = Typography

function App() {
  return (
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
