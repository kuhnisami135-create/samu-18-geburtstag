// ============================================
// SUPABASE
// ============================================
const SUPABASE_URL =
    "https://rhqxlhoqlrwhordtcrew.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_O448xTB2EUrv-935BYyZ8Q_9VV4wBcs";
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
// ============================================
// ELEMENTE
// ============================================
const loginSection =
    document.getElementById("loginSection");
const adminSection =
    document.getElementById("adminSection");
const emailInput =
    document.getElementById("email");
const loginButton =
    document.getElementById("loginButton");
const loginMessage =
    document.getElementById("loginMessage");
const logoutButton =
    document.getElementById("logoutButton");
const refreshButton =
    document.getElementById("refreshButton");
const responsesElement =
    document.getElementById("responses");
// ============================================
// LOGIN
// ============================================
loginButton.addEventListener(
    "click",
    async () => {
        const email =
            emailInput.value.trim();
        if (!email) {
            loginMessage.textContent =
                "Bitte E-Mail eingeben.";
            return;
        }
        loginButton.disabled = true;
        loginButton.textContent =
            "Wird gesendet...";
        const { error } =
            await supabaseClient.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo:
    "https://kuhnisami135-create.github.io/samu-18-geburtstag/admin.html"
                }
            });
        if (error) {
            console.error(error);
            loginMessage.textContent =
                "Fehler: " + error.message;
        } else {
            loginMessage.textContent =
                "Login-Link wurde an deine E-Mail geschickt. 📩";
        }
        loginButton.disabled = false;
        loginButton.textContent =
            "Login-Link senden";
    }
);
// ============================================
// SESSION PRÜFEN
// ============================================
async function checkSession() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();
    if (session) {
        showAdmin();
    } else {
        showLogin();
    }
}
// ============================================
// LOGIN / ADMIN ANZEIGEN
// ============================================
function showLogin() {
    loginSection.classList.remove("hidden");
    adminSection.classList.add("hidden");
}
function showAdmin() {
    loginSection.classList.add("hidden");
    adminSection.classList.remove("hidden");
    loadResponses();
}
// ============================================
// ANTWORTEN LADEN
// ============================================
async function loadResponses() {
    responsesElement.innerHTML =
        "<p>Lade Antworten...</p>";
    const {
        data,
        error
    } = await supabaseClient
        .from("responses")
        .select("*")
        .order("created_at", {
            ascending: false
        });
    if (error) {
        console.error(error);
        responsesElement.innerHTML =
            `<p>Fehler beim Laden: ${error.message}</p>`;
        return;
    }
    displayResponses(data);
}
// ============================================
// ANTWORTEN ANZEIGEN
// ============================================
function displayResponses(data) {
    const yes =
        data.filter(
            response => response.attending === true
        );
    const no =
        data.filter(
            response => response.attending === false
        );
    document.getElementById("yesCount")
        .textContent = yes.length;
    document.getElementById("noCount")
        .textContent = no.length;
    document.getElementById("totalCount")
        .textContent = data.length;
    if (data.length === 0) {
        responsesElement.innerHTML =
            "<p>Noch keine Antworten vorhanden.</p>";
        return;
    }
    responsesElement.innerHTML =
        data.map(response => {
            const date =
                new Date(response.created_at)
                    .toLocaleString(
                        "de-DE",
                        {
                            dateStyle: "short",
                            timeStyle: "short"
                        }
                    );
            return `
                <div class="response">
                    <div>
                        <div class="response-name">
                            ${escapeHtml(response.name)}
                        </div>
                        <div class="response-date">
                            ${date}
                        </div>
                    </div>
                    <div class="${
                        response.attending
                            ? "yes"
                            : "no"
                    }">
                        ${
                            response.attending
                                ? "🥳"
                                : "🥲"
                        }
                    </div>
                </div>
            `;
        }).join("");
}
// ============================================
// SICHERHEIT: HTML ESCAPEN
// ============================================
function escapeHtml(value) {
    const div =
        document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}
// ============================================
// AKTUALISIEREN
// ============================================
refreshButton.addEventListener(
    "click",
    loadResponses
);
// ============================================
// ABMELDEN
// ============================================
logoutButton.addEventListener(
    "click",
    async () => {
        await supabaseClient.auth.signOut();
        showLogin();
    }
);
// ============================================
// AUTH-ÄNDERUNGEN
// ============================================
supabaseClient.auth.onAuthStateChange(
    (event, session) => {
        if (session) {
            showAdmin();
        } else {
            showLogin();
        }
    }
);
// ============================================
// START
// ============================================
checkSession();
