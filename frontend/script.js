const BASE_URL = "http://localhost:3000/api";

// ---------------- GLOBALS ----------------
let currentPage = 1;
let pageSize = Number(localStorage.getItem("pageSize")) || 10;

// ---------------- SIGNUP ----------------
async function signup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) window.location.href = "login.html";
    } catch (err) {
        console.error(err);
        alert("Something went wrong!");
    }
}

// ---------------- LOGIN ----------------
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert("Login success");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Login failed");
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong!");
    }
}

// ---------------- FORGOT PASSWORD ----------------
async function forgotPassword() {
    const email = document.getElementById("email").value;

    if (!email) {
        alert("Please enter your email first");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/forgotpassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        alert(data.message || "Check your email");

    } catch (err) {
        console.error(err);
        alert("Something went wrong");
    }
}

// ---------------- ADD EXPENSE ----------------
async function addExpense() {
    try {
        const amount = document.getElementById("amount").value;
        const description = document.getElementById("desc").value;

        const category = await fetchCategory(amount, description);
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/addExpense`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ amount, description, category })
        });

        if (res.ok) loadExpenses(currentPage);

    } catch (err) {
        console.log(err);
        alert("Error adding expense");
    }
}

// ---------------- AI CATEGORY ----------------
async function fetchCategory(amount, description) {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/categorize`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ amount, description })
        });

        const data = await res.json();
        return data.category || "other";

    } catch (err) {
        console.error(err);
        return "other";
    }
}

// ---------------- PAGE SIZE ----------------
function changePageSize() {
    const selector = document.getElementById("pageSize");

    pageSize = Number(selector.value);
    localStorage.setItem("pageSize", pageSize);

    currentPage = 1;
    loadExpenses(currentPage);
}

// ---------------- LOAD EXPENSES ----------------
async function loadExpenses(page = 1) {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `${BASE_URL}/getExpenses?page=${page}&pageSize=${pageSize}`,
        { headers: { Authorization: token } }
    );

    const data = await res.json();

    const list = document.getElementById("list");
    const totalEl = document.getElementById("total");
    const pagination = document.getElementById("pagination");

    list.innerHTML = "";
    pagination.innerHTML = "";

    totalEl.textContent = data.totalExpenses;

    data.expenses.forEach(exp => {
        const li = document.createElement("li");
        li.textContent = `${exp.amount} - ${exp.description} (${exp.category})`;

        const btn = document.createElement("button");
        btn.textContent = "Delete";

        btn.onclick = async () => {
            await fetch(`${BASE_URL}/deleteExpense/${exp.id}`, {
                method: "DELETE",
                headers: { Authorization: token }
            });

            loadExpenses(currentPage);
        };

        li.appendChild(btn);
        list.appendChild(li);
    });

    // Pagination
    for (let i = 1; i <= data.totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        if (i === page) {
            btn.style.backgroundColor = "black";
            btn.style.color = "white";
        }

        btn.onclick = () => {
            currentPage = i;
            loadExpenses(i);
        };

        pagination.appendChild(btn);
    }
}

// ---------------- LOGOUT ----------------
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// ---------------- PREMIUM ----------------
// ---------------- PREMIUM ----------------
async function buyPremium() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/order`, {
            headers: { Authorization: token }
        });

        const data = await res.json();

        const options = {
            key: data.key_id,
            amount: data.order.amount,
            currency: "INR",
            order_id: data.order.id,

            handler: async function (response) {
                try {
                    const verifyRes = await fetch(`${BASE_URL}/verify`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: token
                        },
                        body: JSON.stringify(response)
                    });

                    const verifyData = await verifyRes.json();

                    // ✅ FIX: more reliable check
                    if (verifyRes.ok || verifyData.success) {

                        alert("Premium Activated!");

                        // save premium state
                        localStorage.setItem("isPremium", "true");

                        // ✅ immediate UI update (IMPORTANT)
                        const buyBtn = document.getElementById("buyBtn");
                        const downloadBtn = document.getElementById("downloadBtn");

                        if (buyBtn) buyBtn.disabled = true;
                        if (downloadBtn) downloadBtn.disabled = false;

                        // optional refresh
                        loadLeaderboard();
                    } else {
                        alert("Payment verification failed");
                    }

                } catch (err) {
                    console.error(err);
                    alert("Verification error");
                }
            },

            modal: {
                ondismiss: function () {
                    alert("Payment cancelled");
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        console.error(err);
    }
}

// ---------------- DOWNLOAD CSV ----------------
// ---------------- DOWNLOAD REPORT ----------------
async function downloadReport() {
    try {
        const token = localStorage.getItem("token");
        const type = document.getElementById("reportFilter").value;

        const res = await fetch(
            `${BASE_URL}/download-report?type=${type}`,
            {
                headers: { Authorization: token }
            }
        );

        if (!res.ok) {
            alert("Download failed");
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `expense-${type}.csv`;
        a.click();

    } catch (err) {
        console.error(err);
        alert("Error downloading report");
    }
}
// ---------------- LEADERBOARD ----------------
async function loadLeaderboard() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${BASE_URL}/leaderboard`, {
            headers: { Authorization: token }
        });

        const data = await res.json();

        const list = document.getElementById("leaderboard");
        list.innerHTML = "";

        data.leaderboard.forEach((user, i) => {
            const li = document.createElement("li");
            li.textContent = `${i + 1}. ${user.name} - ₹${user.totalAmount}`;

            if (user.isPremium) li.textContent += " Premium user";

            list.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
    //---//
    const selector = document.getElementById("pageSize");
if (selector) {
    selector.value = pageSize;   //  THIS LINE FIXES EVERYTHING
}
//---//

    const buyBtn = document.getElementById("buyBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    const isPremium = localStorage.getItem("isPremium");

    // default state
    if (buyBtn) buyBtn.disabled = false;
    if (downloadBtn) downloadBtn.disabled = true;

    // premium state
    if (isPremium === "true") {
        if (buyBtn) buyBtn.disabled = true;
        if (downloadBtn) downloadBtn.disabled = false;
    }

    loadExpenses(1);
    loadLeaderboard();
});