// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
    "https://rhqxlhoqlrwhordtcrew.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocXhsaG9xbHJ3aG9yZHRjcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NDg4ODgsImV4cCI6MjEwNjQyNDg4OH0.ztmFuaanXRHaThmYRdXWY3XciIn7QXbBcx3jEH_2FjE";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ============================================
// ELEMENTE
// ============================================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const loginMessage = document.getElementById("loginMessage");

const adminPanel = document.getElementById("adminPanel");
const loginPanel = document.getElementById("loginPanel");

const participants = document.getElementById("participants");

const totalCount = document.getElementById("totalCount");
const yesCount = document.getElementById("yesCount");
const noCount = document.getElementById("noCount");

const logoutButton = document.getElementById("logoutButton");


// ============================================
// LOGIN
// ============================================

if (loginForm) {

    loginForm.onsubmit = async function (event) {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        if (!email) {

            showLoginMessage(
                "Bitte E-Mail-Adresse eingeben."
            );

            return;
        }

        showLoginMessage(
            "Login-Link wird gesendet..."
        );

        const { error } =
            await supabaseClient.auth.signInWithOtp({

                email: email,

                options: {
                    emailRedirectTo:
                        "https://kuhnisami135-create.github.io/samu-18-geburtstag/admin.html"
                }

            });


        if (error) {

            console.error(
                "LOGIN FEHLER:",
                error
            );

            showLoginMessage(
                "Fehler: " + error.message
            );

            return;
        }


        showLoginMessage(
            "Login-Link wurde gesendet. Prüfe deine E-Mails."
        );
    };
}


// ============================================
// SESSION PRÜFEN
// ============================================

async function checkSession() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    console.log(
        "SESSION:",
        data.session
    );


    if (error) {

        console.error(
            "SESSION FEHLER:",
            error
        );

        showLoginMessage(
            "Session-Fehler: " +
            error.message
        );

        showLoginPanel();

        return;
    }


    if (!data.session) {

        console.log(
            "KEINE SESSION VORHANDEN"
        );

        showLoginPanel();

        return;
    }


    const user =
        data.session.user;


    console.log(
        "EINGELOGGT:",
        user
    );


    console.log(
        "E-MAIL:",
        user.email
    );


    console.log(
        "USER ID:",
        user.id
    );


    // ========================================
    // ADMIN ANZEIGEN
    // ========================================

    showAdminPanel();


    // Zeigt zur Kontrolle die erkannte E-Mail
    if (participants) {

        participants.innerHTML = `
            <p>
                Eingeloggt als:<br>
                <strong>${escapeHtml(user.email || "Keine E-Mail")}</strong>
            </p>
            <p>Teilnehmer werden geladen...</p>
        `;
    }


    await loadParticipants();
}


// ============================================
// TEILNEHMER LADEN
// ============================================

async function loadParticipants() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("responses")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    console.log(
        "SELECT ERGEBNIS:",
        data
    );


    console.log(
        "SELECT FEHLER:",
        error
    );


    // ========================================
    // FEHLER
    // ========================================

    if (error) {

        participants.innerHTML = `
            <div class="error">
                <strong>Fehler beim Laden:</strong><br><br>
                ${escapeHtml(error.message)}
            </div>
        `;

        return;
    }


    // ========================================
    // ZÄHLER
    // ========================================

    const total =
        data.length;

    const attending =
        data.filter(
            person =>
                person.attending === true
        ).length;

    const notAttending =
        data.filter(
            person =>
                person.attending === false
        ).length;


    if (totalCount) {

        totalCount.textContent =
            total;
    }


    if (yesCount) {

        yesCount.textContent =
            attending;
    }


    if (noCount) {

        noCount.textContent =
            notAttending;
    }


    // ========================================
    // KEINE ANTWORTEN
    // ========================================

    if (data.length === 0) {

        participants.innerHTML =
            "<p>Noch keine Antworten vorhanden.</p>";

        return;
    }


    // ========================================
    // LISTE
    // ========================================

    participants.innerHTML = "";


    data.forEach(person => {

        const item =
            document.createElement("div");

        item.className =
            "participant";


        const status =
            person.attending
                ? "🥳 Dabei"
                : "🥲 Nicht dabei";


        item.innerHTML = `
            <strong>
                ${escapeHtml(person.name)}
            </strong>
            <span>
                ${status}
            </span>
        `;


        participants.appendChild(item);

    });
}


// ============================================
// HTML SICHER AUSGEBEN
// ============================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


// ============================================
// ADMIN ANZEIGEN
// ============================================

function showAdminPanel() {

    if (loginPanel) {

        loginPanel.classList.add(
            "hidden"
        );
    }


    if (adminPanel) {

        adminPanel.classList.remove(
            "hidden"
        );
    }
}


// ============================================
// LOGIN ANZEIGEN
// ============================================

function showLoginPanel() {

    if (loginPanel) {

        loginPanel.classList.remove(
            "hidden"
        );
    }


    if (adminPanel) {

        adminPanel.classList.add(
            "hidden"
        );
    }
}


// ============================================
// LOGIN-MELDUNG
// ============================================

function showLoginMessage(text) {

    if (loginMessage) {

        loginMessage.textContent =
            text;
    }
}


// ============================================
// LOGOUT
// ============================================

if (logoutButton) {

    logoutButton.onclick =
        async function () {

            await supabaseClient.auth.signOut();

            location.reload();
        };
}


// ============================================
// AUTH-ÄNDERUNGEN
// ============================================

supabaseClient.auth.onAuthStateChange(
    async function (event, session) {

        console.log(
            "AUTH EVENT:",
            event
        );


        console.log(
            "AUTH SESSION:",
            session
        );


        if (session) {

            showAdminPanel();

            await loadParticipants();

        } else {

            showLoginPanel();
        }
    }
);


// ============================================
// START
// ============================================

checkSession();
