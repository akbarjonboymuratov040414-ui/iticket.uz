document.addEventListener("DOMContentLoaded", function () {
    const regBtn = document.querySelector("#registerBtn") || document.querySelector("#registerbutton");
    if (!regBtn) return;

    regBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const fullnameInput = document.querySelector("#fullname") || document.querySelector("#username");
        const loginInput = document.querySelector("#login");
        const phoneInput = document.querySelector("#phone") || document.querySelector("#number");
        const passwordInput = document.querySelector("#password");
        const password2Input = document.querySelector("#password2");

        const fullname = fullnameInput ? fullnameInput.value.trim() : "";
        const login = loginInput ? loginInput.value.trim() : fullname;
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";
        const password2 = password2Input ? password2Input.value.trim() : password;

        const errorEl = document.querySelector("#authError");
        const successEl = document.querySelector("#authSuccess");

        function showError(msg) {
            if (errorEl) { errorEl.textContent = msg; errorEl.style.display = "block"; } else alert(msg);
        }

        if (!fullname || !login || !password) {
            showError("Barcha majburiy maydonlarni to'ldiring!");
            return;
        }

        if (password.length < 4) {
            showError("Parol kamida 4 belgidan iborat bo'lishi kerak!");
            return;
        }

        if (password !== password2) {
            showError("Parollar bir-biriga mos kelmadi!");
            return;
        }

        const usersList = typeof Users !== "undefined" ? Users : JSON.parse(localStorage.getItem("Users") || "[]");
        const exists = usersList.find(u => u.login.toLowerCase() === login.toLowerCase());

        if (exists) {
            showError("Bu login allaqachon band! Boshqa login tanlang.");
            return;
        }

        const newUser = {
            id: usersList.length > 0 ? (usersList[usersList.length - 1].id + 1) : 1,
            username: fullname,
            login: login,
            number: phone,
            password: password,
            role: "user"
        };

        usersList.push(newUser);
        localStorage.setItem("Users", JSON.stringify(usersList));
        localStorage.setItem("loggedInUser", login);
        localStorage.setItem("username", fullname);
        localStorage.setItem("role", "user");

        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect") || "index.html";

        if (successEl) {
            successEl.textContent = "Ro'yxatdan muvaffaqiyatli o'tdingiz!";
            successEl.style.display = "block";
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        } else {
            window.location.href = redirectUrl;
        }
    });
});
