// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL = "https://rhqxlhoqlrwhordtcrew.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocXhsaG9xbHJ3aG9yZHRjcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NDg4ODgsImV4cCI6MjEwNjQyNDg4OH0.ztmFuaanXRHaThmYRdXWY3XciIn7QXbBcx3jEH_2FjE";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ============================================
// ELEMENTE
// ============================================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const loginMessage = document.getElementById("loginMessage");

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");

const participants = document.getElementById("participants");
const totalCount = document.getElementById("totalCount");
const yesCount = document.getElementById("yesCount");
const noCount = document.getElementById("noCount");

const logoutButton = document.getElementById("logoutButton");


// ============================================
// HILFSFUNKTIONEN
// ============================================

function showLoginMessage(text, isError = false) {
    loginMessage.style.display = "block";
    loginMessage.textContent = text;
    loginMessage.style.background = isError
        ? "rgba(255, 80, 80, 0.2)"
        : "rgba(255, 255, 255, 0.1)";
}


// ============================================
// LOGIN
// ============================================

if (loginForm) {
    loginForm.onsubmit = async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            showLoginMessage("Bitte E-Mail-Adresse eingeben.", true);
            return;
        }

        showLoginMessage("Login-Link wird gesendet...");

        const { error } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.href  // leitet zurück auf admin.html
            }
        });

        if (error) {
            console.error(error);
            showLoginMessage("Fehler: " + error.message, true);
        } else {
            showLoginMessage("✓ Login-Link wurde an deine E-Mail gesendet. Bitte klicke den Link in der Mail.");
        }
    };
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
        // Eingeloggt → Admin-Panel zeigen
        loginPanel.style.display = "none";
        adminPanel.style.display = "block";

        // Gästeliste laden
        loadParticipants();
    } else {
        // Nicht eingeloggt → Login zeigen
        loginPanel.style.display = "block";
        adminPanel.style.display = "none";
    }
}


// ============================================
// GÄSTELISTE LADEN
// ============================================

async function loadParticipants() {
    participants.innerHTML = "Lade Teilnehmer...";

    const { data, error } = await supabaseClient
        .from("responses")          // ← Tabellenname anpassen falls anders
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fehler beim Laden:", error);
        participants.innerHTML = `
            <div style="color: #f87171; padding: 15px;">
                Fehler beim Laden der Gästeliste:<br>
                <strong>${error.message}</strong><br><br>
                (Wahrscheinlich RLS – bist du mit der richtigen E-Mail eingeloggt?)
            </div>
        `;
        return;
    }

    if (!data || data.length === 0) {
        participants.innerHTML = "Noch keine Antworten vorhanden.";
        totalCount.textContent = "0";
        yesCount.textContent = "0";
        noCount.textContent = "0";
        return;
    }

    // Zählen
    let yes = 0;
    let no = 0;

    data.forEach(item => {
        if (item.attending === true || item.attending === "yes" || item.attending === "ja") {
            yes++;
        } else {
            no++;
        }
    });

    totalCount.textContent = data.length;
    yesCount.textContent = yes;
    noCount.textContent = no;

    // Liste anzeigen
    participants.innerHTML = data.map(item => {
        const isYes = item.attending === true || item.attending === "yes" || item.attending === "ja";
        const name = item.name || item.full_name || item.email || "Unbekannt";
        const status = isYes ? "✅ Dabei" : "❌ Nicht dabei";

        return `
            <div class="participant ${isYes ? "yes" : "no"}">
                <span>${name}</span>
                <span style="opacity: 0.8; font-size: 14px;">${status}</span>
            </div>
        `;
    }).join("");
}


// ============================================
// LOGOUT
// ============================================

if (logoutButton) {
    logoutButton.onclick = async function () {
        await supabaseClient.auth.signOut();
        location.reload();
    };
}


// ============================================
// START
// ============================================

// Beim Laden der Seite Session prüfen
checkSession();

// Auch auf Auth-Änderungen reagieren (z.B. nach Magic Link)
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkSession();
    }
    if (event === "SIGNED_OUT") {
        loginPanel.style.display = "block";
        adminPanel.style.display = "none";
    }
});
