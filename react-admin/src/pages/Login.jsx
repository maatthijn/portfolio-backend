import "../css/Login.css";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function Login() {
    const { handleNavClick } = useOutletContext();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (res.ok) {
            fetch('http://localhost:5000/api/ping').catch(() => { });
            localStorage.setItem("token", data.token);
            handleNavClick(e, "/menu");
        } else {
            alert("Login failed.");
        }
    };

    useEffect(() => {
        document.title = "Login | HAFIDH MAULANA MATIN";
    });

    return (
        <div id="login-content" className="page-root contents d-flex flex-column min-vh-100 min-vw-100 justify-content-center align-items-center">
            <div className="seq-anim login-container">
                <p className="display-6 seq-anim" id="salut" translate="yes">Welcome to Admin Page!</p>
                <p className="display-6 seq-anim" id="login-instruction">Please enter your email and password to log in.</p>
                <form className="login-form seq-anim" id="login-form" onSubmit={handleSubmit}>
                    <div className="login-content seq-anim">
                        <label>Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="login-content seq-anim">
                        <label>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </div>
                    <button type="submit" className="seq-anim">Login</button>
                </form>
            </div>
        </div>
    )
}