import {Button, Container} from "react-bootstrap";
import Login from "./pages/login/Login";
import {useState} from "react";
import './App.css';

function App() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <Container fluid className="auth-bg d-flex justify-content-center align-items-center">
            <Login isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)}/>
        </Container>
    );
}

export default App;
