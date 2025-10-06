import { auth, db } from "./firebase-init.js";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { loadPage, showUserData } from "./utils.js";

// -------------------- Login & Register --------------------
export function bindAuthEvents(page) {
    if (page === "login") {
        const goToRegisterButton = document.getElementById("go-to-register");
        const loginForm = document.getElementById("login-form");

        goToRegisterButton?.addEventListener("click", () => loadPage("register"));

        loginForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await userCredential.user.reload();

                let displayName = userCredential.user.displayName;
                if (!displayName) {
                    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
                    if (userDoc.exists()) {
                        displayName = userDoc.data().name;
                        await updateProfile(userCredential.user, { displayName });
                    }
                }

                loadPage("home");
                showUserData({ displayName });
            } catch (err) {
                alert(err.message);
                console.error("Login error:", err);
            }
        });

    } else if (page === "register") {
        const goToLoginButton = document.getElementById("go-to-login");
        const registerForm = document.getElementById("register-form");

        goToLoginButton?.addEventListener("click", () => loadPage("login"));

        registerForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Save user to Firestore
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name,
                    email,
                    friends: [],
                    friendRequests: [],
                    posts: []
                });

                // Set displayName in Auth
                await updateProfile(userCredential.user, { displayName: name });
                await userCredential.user.reload();

                alert("Registration Successful!");
                loadPage("login");
            } catch (err) {
                alert(err.message);
                console.error("Registration error:", err);
            }
        });
    }
}

// -------------------- Logout --------------------
// -------------------- Logout --------------------
export function bindLogout() {
    const logOutButton = document.getElementById("logout-btn");
    if (!logOutButton) {
        console.warn("Logout button not found in DOM yet.");
        return;
    }

    logOutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert("Logged out successfully!");
            localStorage.removeItem("activePage");
            loadPage("login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    });
}
