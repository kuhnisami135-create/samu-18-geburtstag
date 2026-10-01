// ============================================
// SUPABASE
// ============================================
const SUPABASE_URL = "https://rhqxlhoqlrwhordtcrew.supabase.co";
const SUPABASE_KEY = "sb_publishable_O448xTB2EUrv-935BYyZ8Q_9VV4wBcs";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
// ============================================
// ELEMENTE
// ============================================
const form = document.getElementById("rsvpForm");
const nameInput = document.getElementById("name");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");
// ============================================
// STATUS
// ============================================
let attending = null;
// ============================================
// AUSWAHL
// ============================================
function selectAnswer(value) {
    attending = value;
    yesButton.classList.remove("selected");
    noButton.classList.remove("selected");
    if (value === true) {
        yesButton.classList.add("selected");
    }
    if (value === false) {
        noButton.classList.add("selected");
    }
    updateButton();
}
// ============================================
// ABSENDEN AKTIVIEREN
// ============================================
function updateButton() {
    const validName =
        nameInput.value.trim().length >= 2;
    submitButton.disabled =
        !validName || attending === null;
}
// ============================================
// BUTTONS
// ============================================
yesButton.addEventListener(
    "click",
    () => selectAnswer(true)
);
noButton.addEventListener(
    "click",
    () => selectAnswer(false)
);
nameInput.addEventListener(
    "input",
    updateButton
);
// ============================================
// FORMULAR
// ============================================
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (name.length < 2) {
        showMessage(
            "Bitte gib deinen Namen ein.",
            "error"
        );
        return;
    }
    if (attending === null) {
        showMessage(
            "Bitte wähle aus, ob du dabei bist.",
            "error"
        );
        return;
    }
    submitButton.disabled = true;
    submitButton.textContent =
        "Wird gespeichert...";
    const { error } = await supabaseClient
        .from("responses")
        .insert({
            name: name,
            attending: attending
        });
    if (error) {
        console.error(error);
        showMessage(
            "Ups, da ist etwas schiefgelaufen. Versuch es bitte nochmal.",
            "error"
        );
        submitButton.disabled = false;
        submitButton.textContent =
            "Antwort abschicken";
        return;
    }
    // Erfolg
    form.classList.add("hidden");
    if (attending) {
        showMessage(
            `Danke ${name}! 🥳<br><br>Ich freu mich, dass du dabei bist!`,
            "success"
        );
    } else {
        showMessage(
            `Danke für deine Rückmeldung, ${name}! ❤️`,
            "success"
        );
    }
});
// ============================================
// MELDUNG
// ============================================
function showMessage(text, type) {
    message.innerHTML = text;
    message.className =
        `message ${type}`;
}
