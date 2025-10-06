import { auth, db } from "./firebase-init.js";
import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

export async function loadPeoplePage() {
    const peopleContainer = document.querySelector(".people-container");

    if (!peopleContainer) {
        console.error("People container not found in DOM");
        return;
    }

    peopleContainer.innerHTML = "<p>Loading...</p>";

    onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
            alert("Please log in first!");
            return;
        }

        try {
            // ✅ Get current user’s document to read their friends
            const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
            const currentUserData = currentUserDoc.data() || {};
            const currentFriends = currentUserData.friends || [];

            // ✅ Get all users
            const querySnapshot = await getDocs(collection(db, "users"));
            peopleContainer.innerHTML = "";

            querySnapshot.forEach((docSnap) => {
                const userData = docSnap.data();
                const uid = docSnap.id;

                // ❌ Skip the current user
                if (uid === currentUser.uid) return;

                // ❌ Skip if already friends
                if (currentFriends.includes(uid)) return;

                const card = document.createElement("div");
                card.className = "people-card p-3 shadow-md rounded-lg bg-white flex flex-col items-center gap-2";

                card.innerHTML = `
                    <div class="people-info text-center">
                        <img src="${userData.photoURL || '../src/profile.png'}" 
                             alt="User Photo" 
                             class="w-16 h-16 rounded-full mb-2"/>
                        <strong>${userData.name || "Unknown User"}</strong>
                    </div>
                    <button class="add-friend-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                            data-id="${uid}">
                        Add Friend
                    </button>
                `;

                peopleContainer.appendChild(card);
            });

            // ✅ Handle Add Friend
            peopleContainer.addEventListener("click", async (e) => {
                const btn = e.target.closest(".add-friend-btn");
                if (!btn) return;

                const friendId = btn.getAttribute("data-id");

                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    const friendRef = doc(db, "users", friendId);

                    // ✅ Add friend to current user's friends array
                    await updateDoc(userRef, {
                        friends: arrayUnion(friendId),
                    });

                    // (Optional) You can also add current user to friend’s friendRequests
                    await updateDoc(friendRef, {
                        friendRequests: arrayUnion(currentUser.uid),
                    });

                    // ✅ Instantly remove this person from the list
                    btn.closest(".people-card").remove();
                } catch (error) {
                    console.error("Failed to add friend:", error);
                    alert("Failed to add friend. Please try again.");
                }
            });
        } catch (err) {
            console.error("Error loading people:", err);
            alert("Error loading people data.");
        }
    });
}
