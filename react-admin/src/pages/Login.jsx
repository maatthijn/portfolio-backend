import "../css/Login.css";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function Login() {
    const { handleNavClick } = useOutletContext();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [passwordAttempts, setPasswordAttempt] = useState(null);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (res.status === 429 && data.locked) {
            setShowWarning(true);
            setLockedUntil(data.lockedUntil);
        } else if (res.status === 401) {
            setPasswordAttempt(data.attemptsLeft);
            setShowWarning(true);
        } else {
            fetch('http://localhost:5000/api/ping').catch(() => {});
            localStorage.setItem("token", data.token);
            handleNavClick(e, "/menu");
        }
    };

    useEffect(() => {
        document.title = "Login | HAFIDH MAULANA MATIN";
    }, []);

    useEffect(() => {
        if (!lockedUntil) return;

        const updateTimeLeft = () => {
            const diff = lockedUntil - Date.now();
            setTimeLeft(diff > 0 ? diff : 0);
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [lockedUntil]);

    useEffect(() => {
        if (!lockedUntil || timeLeft > 0) return;
        const timeout = setTimeout(() => {
            setLockedUntil(null);
            setShowWarning(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [timeLeft, lockedUntil]);

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
                            type={"password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </div>
                    {showWarning && (
                        <h1 id="wrong-password" className="display-6 seq-anim">
                            {lockedUntil
                                ? `Your login access is locked. Try again in ${!(timeLeft < 60000) ? (`${Math.floor(timeLeft / 60000)}m`) : ""} ${Math.floor((timeLeft % 60000) / 1000)}s.`
                                : `Login failed. ${passwordAttempts} attempts left.`}
                        </h1>
                    )}
                    <button type="submit" className="seq-anim" disabled={!!lockedUntil}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
