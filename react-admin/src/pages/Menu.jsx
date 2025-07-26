import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import "../css/Menu.css"

export default function Menu() {
    const { handleNavClick } = useOutletContext();

    const handleLogout = (e) => {
        localStorage.removeItem("token");
        handleNavClick(e, '/')
    };

    useEffect(() => {
        document.title = "Admin | HAFIDH MAULANA MATIN";
    });

    return (
        <div id="menu-content" className="page-root contents d-flex flex-column min-vh-100 min-vw-100 justify-content-center align-items-center">
            <div className="seq-anim menu-container">
                <p className="display-6 seq-anim" id="menu-salut" translate="yes">Welcome, Admin!</p>
                <p className="seq-anim" id="menu-instruction" translate="yes">Please select one of these options to continue.</p>
                <div className="row text-center menu-option">
                    <button className="col-lg-5 seq-anim" onClick={(e) => handleNavClick(e, '/blogs')}>Blogs</button>
                    <p className="col-lg-2"></p>
                    <button className="col-lg-5 seq-anim" onClick={(e) => handleNavClick(e, '/galleries')}>Galleries</button>
                </div>
                <button className="col-lg-5 seq-anim" id="log-out-btn" onClick={(e) => handleLogout(e)}>Log Out</button>
            </div>
        </div>
    )
}