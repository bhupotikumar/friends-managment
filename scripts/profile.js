import { auth, db } from "./firebase-init.js";
import {
    updateProfile,
    onAuthStateChanged,
    updateEmail
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { loadPage } from "./utils.js";
import { bindLogout } from "./auth.js";

// -------------------- Profile Page --------------------
export async function loadProfilePage() {
    await loadPage("profile");
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await showProfileData(user);
            bindProfileEvents(user);
        } else {
            loadPage("login");
        }
    });
}

// -------------------- Bind Each Form Separately --------------------
function bindProfileEvents(user) {
    // Name
    const nameForm = document.getElementById("update-name-form");
    nameForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = document.getElementById("update-name").value;
        if (!newName) return alert("Name cannot be empty");
        try {
            await updateProfile(user, { displayName: newName });
            await setDoc(doc(db, "users", user.uid), { name: newName }, { merge: true });
            await user.reload();
            await showProfileData(user);
            alert("Name updated successfully");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    // Phone
    const phoneForm = document.getElementById("update-phone-form");
    phoneForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPhone = document.getElementById("update-phone").value;
        if (!newPhone) return alert("Phone cannot be empty");
        try {
            await setDoc(doc(db, "users", user.uid), { phone: newPhone }, { merge: true });
            await showProfileData(user);
            alert("Phone updated successfully");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    // Email
    const emailForm = document.getElementById("update-email-form");
    emailForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newEmail = document.getElementById("update-email").value;
        if (!newEmail) return alert("Email cannot be empty");
        try {
            await updateEmail(user, newEmail);
            await setDoc(doc(db, "users", user.uid), { email: newEmail }, { merge: true });
            await showProfileData(user);
            alert("Email updated successfully");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    // Photo URL
    const photoForm = document.getElementById("update-photo-form");
    photoForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPhoto = document.getElementById("update-photo-url").value;
        if (!newPhoto) return alert("Photo URL cannot be empty");
        try {
            await updateProfile(user, { photoURL: newPhoto });
            await setDoc(doc(db, "users", user.uid), { photoURL: newPhoto }, { merge: true });
            await user.reload();
            await showProfileData(user);
            alert("Photo updated successfully");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    bindLogout();
}

// -------------------- Show Profile Data --------------------
async function showProfileData(user) {
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userPhone = document.getElementById("user-phone");
    const userDOB = document.getElementById("user-date-of-birth");
    const userPhoto = document.getElementById("profile-pic");
    const userPhotoURL = document.getElementById("user-photo-url");

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.exists() ? userDoc.data() : {};

    if (userName) userName.textContent = user.displayName || data.name || "No Name";
    if (userEmail) userEmail.textContent = user.email || data.email || "No Email";
    if (userPhone) userPhone.textContent = data.phone || "No Phone";
    if (userDOB) userDOB.textContent = data.dob || "No DOB";
    if (userPhoto) userPhoto.src = user.photoURL || data.photoURL || "../src/profile.png";
    if (userPhotoURL) userPhotoURL.textContent = user.photoURL || data.photoURL || "No URL";
}
