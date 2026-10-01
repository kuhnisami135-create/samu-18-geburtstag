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

yesButton.onclick = function () {

    attending = true;

    yesButton.classList.add("selected");
    noButton.classList.remove("selected");

    updateButton();
};


noButton.onclick = function () {

    attending = false;

    noButton.classList.add("selected");
    yesButton.classList.remove("selected");

    updateButton();
};


// ============================================
// NAME
// ============================================

nameInput.oninput = function () {
    updateButton();
};


// ============================================
// BUTTON AKTIVIEREN
// ============================================

function updateButton() {

    const nameOK =
        nameInput.value.trim().length >= 2;

    const answerOK =
        attending !== null;

    submitButton.disabled =
        !(nameOK && answerOK);
}


// ============================================
// ABSENDEN
// ============================================

form.onsubmit = async function (event) {

    event.preventDefault();

    const name =
        nameInput.value.trim();

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


    try {

        const result =
            await supabaseClient
                .from("responses")
                .insert({
                    name: name,
                    attending: attending
                })
                .select();


        console.log("Supabase Ergebnis:", result);


        if (result.error) {

            console.error(
                "Supabase Fehler:",
                result.error
            );

            showMessage(
                "Fehler: " +
                result.error.message,
                "error"
            );

            submitButton.disabled = false;

            submitButton.textContent =
                "Antwort abschicken";

            return;
        }


        // ====================================
        // ERFOLG
        // ====================================

        form.classList.add("hidden");


        if (attending === true) {

            showMessage(
                `Danke ${name}! 🥳<br><br>
                Ich freu mich, dass du dabei bist!`,
                "success"
            );

        } else {

            showMessage(
                `Danke für deine Rückmeldung, ${name}! ❤️`,
                "success"
            );
        }

    } catch (error) {

        console.error(
            "Verbindungsfehler:",
            error
        );

        showMessage(
            "Verbindungsfehler: " +
            error.message,
            "error"
        );

        submitButton.disabled = false;

        submitButton.textContent =
            "Antwort abschicken";
    }
};


// ============================================
// MELDUNG
// ============================================

function showMessage(text, type) {

    message.innerHTML = text;

    message.className =
        "message " + type;
}
