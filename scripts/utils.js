import { bindAuthEvents } from "./auth.js";

// -------------------- Load Pages Dynamically --------------------
export async function loadPage(page) {
    try {
        const res = await fetch(`pages/${page}.html`);
        const html = await res.text();

        const authContainer = document.getElementById("auth-container");
        const appContainer = document.getElementById("app-container");
        const content = document.getElementById("content");

        if (page === "login" || page === "register") {
            authContainer.innerHTML = html;
            appContainer.style.display = "none";
            bindAuthEvents(page);
        } else {
            content.innerHTML = html;
            authContainer.innerHTML = "";
            appContainer.style.display = "block";
        }
    } catch (err) {
        console.error("Page load error:", err);
    }
}

// -------------------- Show User Data --------------------
export function showUserData(user) {
    const userName = document.getElementById("user-name");
    if (userName) userName.textContent = user.displayName || "No Name";
}