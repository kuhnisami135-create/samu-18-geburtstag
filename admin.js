// ============================================
// SUPABASE
// ============================================
const SUPABASE_URL = "https://rhqxlhoqlrwhordtcrew.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocXhsaG9xbHJ3aG9yZHRjcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NDg4ODgsImV4cCI6MjEwNjQyNDg4OH0.ztmFuaanXRHaThmYRdXWY3XciIn7QXbBcx3jEH_2FjE";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// ELEMENTE
// ============================================
const loginForm     = document.getElementById("loginForm");
const emailInput    = document.getElementById("email");
const loginMessage  = document.getElementById("loginMessage");
const loginPanel    = document.getElementById("loginPanel");
const adminPanel    = document.getElementById("adminPanel");
const participants  = document.getElementById("participants");
const totalCount    = document.getElementById("totalCount");
const yesCount      = document.getElementById("yesCount");
const noCount       = document.getElementById("noCount");
const logoutButton  = document.getElementById("logoutButton");

// ============================================
// HILFSFUNKTION
// ============================================
function showLoginMessage(text, isError = false) {
    if (!loginMessage) return;
    loginMessage.style.display = "block";
    loginMessage.textContent = text;
    loginMessage.style.background = isError 
        ? "rgba(255, 80, 80, 0.25)" 
        : "rgba(255, 255, 255, 0.12)";
}

// ============================================
// LOGIN
// ============================================
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        event.stopPropagation();

        const email = emailInput.value.trim();

        if (!email) {
            showLoginMessage("Bitte E-Mail-Adresse eingeben.", true);
            return;
        }

        showLoginMessage("Login-Link wird gesendet...");

        try {
            const { data, error } = await supabaseClient.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: window.location.href,
                    shouldCreateUser: true
                }
            });

            if (error) {
                console.error("Fehler beim Senden:", error);
                showLoginMessage("Fehler: " + error.message, true);
            } else {
                console.log("Erfolgreich angefordert:", data);
                showLoginMessage("✓ Login-Link wurde gesendet! Schau in dein Postfach (auch Spam).");
            }
        } catch (err) {
            console.error("Unerwarteter Fehler:", err);
            showLoginMessage("Unerwarteter Fehler – öffne die Konsole (F12).", true);
        }
    });
} else {
    console.error("loginForm nicht gefunden!");
}

// ============================================
// SESSION PRÜFEN
// ============================================
async function checkSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session-Fehler:", error);
        return;
    }

    if (session) {
        loginPanel.style.display = "none";
        adminPanel.style.display = "block";
        loadParticipants();
    } else {
        loginPanel.style.display = "block";
        adminPanel.style.display = "none";
    }
}

// ============================================
// GÄSTELISTE LADEN
// ============================================
async function loadParticipants() {
    if (!participants) return;

    participants.innerHTML = "Lade Teilnehmer...";

    const { data, error } = await supabaseClient
        .from("responses")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fehler beim Laden:", error);
        participants.innerHTML = `
            <div style="color:#f87171; padding:15px;">
                Fehler beim Laden:<br>
                <strong>${error.message}</strong>
            </div>`;
        return;
    }

    if (!data || data.length === 0) {
        participants.innerHTML = "Noch keine Antworten vorhanden.";
        totalCount.textContent = "0";
        yesCount.textContent = "0";
        noCount.textContent = "0";
        return;
    }

    let yes = 0;
    let no = 0;

    data.forEach(item => {
        const isYes = item.attending === true || item.attending === "yes" || item.attending === "ja";
        if (isYes) yes++;
        else no++;
    });

    totalCount.textContent = data.length;
    yesCount.textContent = yes;
    noCount.textContent = no;

    participants.innerHTML = data.map(item => {
        const isYes = item.attending === true || item.attending === "yes" || item.attending === "ja";
        const name = item.name || item.full_name || item.email || "Unbekannt";
        return `
            <div class="participant ${isYes ? "yes" : "no"}">
                <span>${name}</span>
                <span style="opacity:0.8; font-size:14px;">
                    ${isYes ? "✅ Dabei" : "❌ Nicht dabei"}
                </span>
            </div>`;
    }).join("");
}

// ============================================
// LOGOUT
// ============================================
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        location.reload();
    });
}

// ============================================
// START
// ============================================
checkSession();

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkSession();
    }
    if (event === "SIGNED_OUT") {
        loginPanel.style.display = "block";
        adminPanel.style.display = "none";
    }
});
