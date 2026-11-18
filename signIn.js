document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.querySelector("#loginBtn") || document.querySelector("#sendbtn");
    if (!loginBtn) return;

    loginBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const loginInput = document.querySelector("#login") || document.querySelector("#username");
        const passwordInput = document.querySelector("#password");
        const login = loginInput ? loginInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";
        const errorEl = document.querySelector("#authError");

        if (!login || !password) {
            const msg = "Login va parolni kiriting!";
            if (errorEl) { errorEl.textContent = msg; errorEl.style.display = "block"; } else alert(msg);
            return;
        }

        const usersList = typeof Users !== "undefined" ? Users : JSON.parse(localStorage.getItem("Users") || "[]");
        const currentUser = usersList.find(u =>
            (u.login.toLowerCase() === login.toLowerCase() || u.username.toLowerCase() === login.toLowerCase()) && u.password === password
        );

        if (!currentUser) {
            const err = "Login yoki parol noto'g'ri!";
            if (errorEl) { errorEl.textContent = err; errorEl.style.display = "block"; } else alert(err);
            return;
        }

        localStorage.setItem("loggedInUser", currentUser.login);
        localStorage.setItem("username", currentUser.username);
        localStorage.setItem("role", currentUser.role);

        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect") || "index.html";

        if (currentUser.role === "admin" && (!params.get("redirect") || redirectUrl === "index.html")) {
            window.location.href = "adminPanel.html";
        } else {
            window.location.href = redirectUrl;
        }
    });
});
