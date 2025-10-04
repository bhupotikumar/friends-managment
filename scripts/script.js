// get content div
const content = document.getElementById("content");

// Define the pages
const pages = {
    home: "<h1>Welcome to Home</h1>",
    friends: "<h1>Your Friends List</h1>",
    public: "<h1>Suggetion for friends</h1>",
    profile: "<h1>Your Profile</h1>"
};

// Load a page
function loadPage(page) {
    content.innerHTML = pages[page];
    document.querySelectorAll(".navbar a").forEach(a => a.classList.remove("active"));
    const activeLink = document.querySelector(`.navbar a[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add("active");
}

document.querySelectorAll(".navbar a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        loadPage(link.dataset.page);
    });
});
window.addEventListener("DOMContentLoaded", () => {
    loadPage("home");
});