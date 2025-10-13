import { auth, db } from "./firebase-init.js";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

export function loadHomePage() {
    const postBtn = document.getElementById("post-btn");
    const postContent = document.getElementById("post-content");
    const feed = document.getElementById("feed");

    onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
            alert("Please log in first!");
            return;
        }

        await loadPosts(currentUser, feed);

        postBtn?.addEventListener("click", async () => {
            const content = postContent.value.trim();
            if (!content) return alert("Please write something before posting!");

            try {
                await addDoc(collection(db, "posts"), {
                    userId: currentUser.uid,
                    content,
                    createdAt: new Date(),
                    authorName: currentUser.displayName || "Anonymous",
                    authorPhoto: currentUser.photoURL || "../src/profile.png"
                });

                postContent.value = "";
                alert("Post added successfully!");
            } catch (error) {
                console.error("Error adding post:", error);
                alert("Failed to add post. Try again.");
            }
        });
    });
}

async function loadPosts(currentUser, feed) {
    try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        const friends = userData?.friends || [];

        const allowedUsers = [currentUser.uid, ...friends];

        const postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc")
        );

        onSnapshot(postsQuery, (snapshot) => {
            feed.innerHTML = "<h1>Latest Posts</h1>";
            snapshot.forEach((postDoc) => {
                const post = postDoc.data();
                if (!allowedUsers.includes(post.userId)) return; // only show my & friends posts

                const postElement = document.createElement("div");
                postElement.className = "post-card";
                postElement.innerHTML = `
                    <div class="post-card-wrapper">
                        <div class="post-card">
                        <div class="post-header">
                            <div class="post-profile">
                                <img width="200" class="rounded" src="${post.authorPhoto}" alt="User" class="post-author-img">
                            </div>
                            <div class="name-date-container">
                                <strong>${post.authorName}</strong>
                                <span class="post-date">${new Date(post.createdAt.seconds * 1000 || post.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                        <p class="post-content">${post.content}</p>
                    </div>
                    </div>
                `;
                feed.appendChild(postElement);
            });
        });
    } catch (err) {
        console.error("Error loading posts:", err);
        feed.innerHTML = "<p>Failed to load posts.</p>";
    }
}
