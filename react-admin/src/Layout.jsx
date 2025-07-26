import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
        const elements = document.querySelectorAll(".seq-anim");
        setIsAnimating(true);

        elements.forEach((el) => {
            el.classList.remove("fade-out");
            el.classList.remove("seq-anim-run");
            el.style.opacity = "0";
        });

        const delayFadeIn = async () => {
            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];

                el.classList.add("seq-anim-run");
                el.classList.remove("seq-anim-run");
                el.style.opacity = "1"
                await new Promise((res) => setTimeout(res, 2000 / elements.length));
            }
            setIsAnimating(false);
        };

        delayFadeIn();
        prevPathRef.current = location.pathname;
    }, [location.pathname]);

    const handleNavClick = async (e, to) => {
        e.preventDefault();
        if (isAnimating || location.pathname === to) return;
        setIsAnimating(true);

        const fromHome = location.pathname === "/";
        const toHome = to === "/";
        const shouldAnimateNavbar = fromHome || toHome;

        const elements = document.querySelectorAll(".seq-anim");
        for (let i = (elements.length - 1); i >= 0; i--) {
            const el = elements[i];
            if (el.classList.contains("main-nav") && !shouldAnimateNavbar) continue;
            el.classList.add("fade-out");
            el.style.opacity = "0";
            el.classList.remove("fade-out");
            await new Promise((res) => setTimeout(res, 1500 / elements.length));

        }
        prevPathRef.current = to;
        navigate(to);
    };

    return (
        <>
            {isAnimating && <div className="interaction-blocker"></div>}
            <Outlet context={{ handleNavClick }} />
        </>
    );
}
