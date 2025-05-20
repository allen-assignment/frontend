import {Button, Container} from "react-bootstrap";
import Login from "./pages/login/Login";
import {useState} from "react";
import './App.css';
import Profile from "./pages/profile/Profile";

function App() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <Container fluid className="auth-bg d-flex justify-content-center align-items-center">
            {/*<Login isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)}/>*/}
            <Profile userId={3}></Profile>
        </Container>
    );
}

export default App;
