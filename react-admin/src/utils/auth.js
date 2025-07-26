import { jwtDecode } from "jwt-decode";

export function isTokenExpired(token) {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // in seconds

        return decoded.exp < currentTime;
    } catch (error) {
        return true; // treat as expired if error occurs
    }
}