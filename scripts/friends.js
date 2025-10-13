import { auth, db } from "./firebase-init.js";
import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
    doc,
    getDoc,
    updateDoc,
    arrayRemove,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

export async function loadFriendsPage() {
    const friendsContainer = document.querySelector(".friends-container");

    if (!friendsContainer) {
        console.error("Friends container not found in DOM");
        return;
    }

    friendsContainer.innerHTML = "<p>Loading friends...</p>";

    onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
            alert("Please log in first!");
            return;
        }

        try {
            const currentUserRef = doc(db, "users", currentUser.uid);
            const currentUserSnap = await getDoc(currentUserRef);

            if (!currentUserSnap.exists()) {
                friendsContainer.innerHTML = "<p>No friends found.</p>";
                return;
            }

            const userData = currentUserSnap.data();
            const friends = userData.friends || [];

            if (friends.length === 0) {
                friendsContainer.innerHTML = "<p>You have no friends yet 😢</p>";
                return;
            }

            friendsContainer.innerHTML = "";

            for (const friendId of friends) {
                const friendSnap = await getDoc(doc(db, "users", friendId));
                if (!friendSnap.exists()) continue;

                const friendData = friendSnap.data();

                const card = document.createElement("div");
                card.className =
                    "friend-card p-3 shadow-md rounded-lg bg-white flex flex-col items-center gap-2";

                card.innerHTML = `
                    <div class="friend-info text-center">
                        <img src="${friendData.photoURL || '../src/profile.png'}" 
                             alt="User Photo" 
                             class="w-16 h-16 rounded-full mb-2"/>
                        <strong>${friendData.name || "Unknown User"}</strong>
                    </div>
                    <button class="unfriend-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            data-id="${friendId}">
                        Unfriend
                    </button>
                `;

                friendsContainer.appendChild(card);
            }

            friendsContainer.addEventListener("click", async (e) => {
                const btn = e.target.closest(".unfriend-btn");
                if (!btn) return;

                const friendId = btn.getAttribute("data-id");

                try {
                    await updateDoc(currentUserRef, {
                        friends: arrayRemove(friendId),
                    });

                    const friendRef = doc(db, "users", friendId);
                    await updateDoc(friendRef, {
                        friends: arrayRemove(currentUser.uid),
                    });

                    btn.closest(".friend-card").remove();
                } catch (err) {
                    console.error("Failed to unfriend:", err);
                    alert("Failed to unfriend. Please try again.");
                }
            });
        } catch (err) {
            console.error("Error loading friends:", err);
            alert("Error loading friends data.");
        }
    });
}
