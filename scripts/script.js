import { auth, db } from "./firebase-init.js";
import {
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { bindLogout } from "./auth.js";
import { loadProfilePage } from "./profile.js";
import { loadPage, showUserData } from "./utils.js";
import { loadPeoplePage } from "./people.js";
import { loadFriendsPage } from "./friends.js";
import { loadHomePage } from "./home.js";


window.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await user.reload();

            let displayName = user.displayName;
            if (!displayName) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    displayName = userDoc.data().name;
                    await updateProfile(user, { displayName });
                }
            }

            showUserData({ displayName });
            bindLogout();

            const activePage = localStorage.getItem("activePage") || "home";
            document.querySelectorAll("a[data-page]").forEach(a => a.classList.remove("active"));
            const activeLink = document.querySelector(`a[data-page="${activePage}"]`);
            if (activeLink) activeLink.classList.add("active");

            if (activePage === "profile") {
                loadProfilePage();
            }
            else if (activePage === "people") {
                await loadPage("people");
                loadPeoplePage();
            }
            else if (activePage === "friends") {
                await loadPage("friends");
                loadFriendsPage();
            }
            else if (activePage === "home") {
                await loadPage("home");
                loadHomePage();
            }
            else {
                loadPage(activePage);
            }

        } else {
            loadPage("login");
        }
    });
});



// -------------------- Navigation --------------------
document.addEventListener("click", async (e) => {
    const link = e.target.closest("a[data-page]");
    if (!link) return;
    e.preventDefault();

    document.querySelectorAll("a[data-page]").forEach(a => a.classList.remove("active"));
    link.classList.add("active");

    const page = link.dataset.page;
    localStorage.setItem("activePage", page);

    if (page === "profile") {
        await loadProfilePage();
    }
    else if (page === "people") {
        await loadPage("people");
        loadPeoplePage();
    }
    else if (page === "friends") {
        await loadPage("friends");
        loadFriendsPage();
    }
    else if (page === "home") {
        await loadPage("home");
        loadHomePage();
    }
    else {
        await loadPage(page);
    }
});

