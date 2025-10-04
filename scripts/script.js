import { auth, db } from "./firebase-init.js";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
    doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Load pages dynamically
export function loadPage(page) {
    fetch(`pages/${page}.html`)
        .then(res => res.text())
        .then(html => {
            const authContainer = document.getElementById("auth-container");
            const appContainer = document.getElementById("app-container");

            if (page === "login" || page === "register") {
                authContainer.innerHTML = html;
                appContainer.style.display = "none";
                bindAuthEvents(page);
            } else {
                document.getElementById("content").innerHTML = html;
                authContainer.innerHTML = "";
                appContainer.style.display = "block";
            }
        })
        .catch(err => console.error("Page load error:", err));
}

// Bind login/register buttons
function bindAuthEvents(page) {
    if (page === "login") {
        document.getElementById("go-to-register")?.addEventListener("click", () => loadPage("register"));
        document.getElementById("login-form")?.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await userCredential.user.reload();

                // Get displayName from Firestore if null
                let displayName = userCredential.user.displayName;
                if (!displayName) {
                    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
                    if (userDoc.exists()) {
                        displayName = userDoc.data().name;
                        // Update Auth displayName for future use
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
        document.getElementById("go-to-login")?.addEventListener("click", () => loadPage("login"));
        document.getElementById("register-form")?.addEventListener("submit", async e => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Save to Firestore
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

// Logout
document.getElementById("logout-btn")?.addEventListener("click", async () => {
    try {
        await signOut(auth);
        loadPage("login");
    } catch (err) {
        console.error("Logout error:", err);
    }
});

// On page load, maintain auth state
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

            loadPage("home");
            showUserData({ displayName });
        } else {
            loadPage("login");
        }
    });
});

// Display user data
function showUserData(user) {
    const el = document.getElementById("user-name");
    if (el) el.textContent = user.displayName || "No Name";
}
