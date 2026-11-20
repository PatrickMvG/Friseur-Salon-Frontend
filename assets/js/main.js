let allPrice = []
let allMembers = []
let ausgewaehlteLeistung = null
let ausgewaehlteMitarbeiter = null
let ausgewaehlteZeit = null
let leistungClicked = false
let mid = 0
let lid = 0

const res = await fetch("http://localhost:8080/api/v1/alle-preise")
const data = await res.json()
allPrice = Array.isArray(data) ? data : []


const res2 = await fetch("http://localhost:8080/api/v1/member")
const data2 = await res2.json()
allMembers = Array.isArray(data2) ? data2 : []
allMembers.unshift({ Name: "Egal", mitarbeiter_id: 0 })


const personen = document.querySelector(".personen")
const container = document.querySelector(".leistungen")

const buchungLeistung = document.querySelector(".buchungLeistung")
const buchungDauer = document.querySelector(".buchungDauer")
const buchungPreis = document.querySelector(".buchungPreis")
const buchungName = document.querySelector(".buchungName")
const buchungTermin = document.querySelector(".buchungTermin")

const uebersicht = document.querySelector(".uebersicht1")
const uebersicht2 = document.querySelector(".uebersicht2")
const uebersicht3 = document.querySelector(".uebersicht3")
const uebersicht4 = document.querySelector(".uebersicht4")


const zeiten = document.querySelector(".zeiten")




// Datum
const datumInput = document.getElementById("termin-datum")
const nextDate = document.querySelector(".datum-nach")
const previousDate = document.querySelector(".datum-vor")


function formatDate(date) {
    const jahr = date.getFullYear()
    const monat = String(date.getMonth() + 1).padStart(2, "0")
    const tag = String(date.getDate()).padStart(2, "0")
    return `${jahr}-${monat}-${tag}`
}

function resetDate() {
    datumInput.value = ""
    zeiten.innerHTML = ""
    ausgewaehlteZeit = null

    buchungTermin.textContent = "--"

    uebersicht3.textContent = "3"
    uebersicht4.style.color = ""
    uebersicht4.style.background = ""
}

const heute = new Date()
const heuteString = formatDate(heute)

const inDreiMonaten = new Date()
inDreiMonaten.setMonth(inDreiMonaten.getMonth() + 3)
const maxString = formatDate(inDreiMonaten)

// datumInput.value = heuteString
datumInput.min = heuteString
datumInput.max = maxString

async function ladeFreieTermine() {
    zeiten.innerHTML = ""
    if (!datumInput.value) return

    const res3 = await fetch(`http://localhost:8080/api/v1/freie-termine?datum=${datumInput.value}&mid=${mid}&lid=${lid}`)
    const data3 = await res3.json()
    const allEverything = Array.isArray(data3) ? data3 : []

    for (const item of allEverything) {
        // Prüfen, ob item ein Objekt ("Egal"-Modus) oder ein String (konkreter Mitarbeiter) ist
        const uhrzeitText = typeof item === "object" ? item.uhrzeit : item

        const zeit = document.createElement("div")
        zeit.className = "zeit"
        zeit.textContent = uhrzeitText

        zeit.addEventListener("click", () => {
            document.querySelectorAll(".zeit").forEach(z => {
                z.classList.remove("aktiv3")
                z.style.background = ""
                z.style.color = ""
            })
            zeit.classList.add("aktiv3")
            zeit.style.background = "black"
            zeit.style.color = "white"

            ausgewaehlteZeit = uhrzeitText

            // Wenn "Egal" gewählt war, echten Namen & echte ID übernehmen:
            if (typeof item === "object") {
                buchungName.textContent = item.name
                // Optional: wenn du mid hier direkt auf item.mitarbeiter_id setzt,
                // wird beim Buchen exakt diese Person gespeichert!
                ausgewaehlteMitarbeiter = { Name: item.name, mitarbeiter_id: item.mitarbeiter_id }
            }

            const [jahr, monat, tag] = datumInput.value.split("-")
            buchungTermin.textContent = `${tag}.${monat}.${jahr} um ${uhrzeitText} Uhr`

            uebersicht3.style.color = "white"
            uebersicht3.style.background = "green"
            uebersicht3.textContent = "✔"

            uebersicht4.style.color = "white"
            uebersicht4.style.background = "red"
        })

        zeiten.append(zeit)
    }
}

async function aendereTag(tage) {
    if (!datumInput.value) {
        if (tage > 0) {
            datumInput.value = heuteString
            await ladeFreieTermine()
        }
        return
    }

    const aktuellesDatum = new Date(datumInput.value)
    aktuellesDatum.setDate(aktuellesDatum.getDate() + tage)

    const neuerTagString = formatDate(aktuellesDatum)
    if (neuerTagString >= heuteString && neuerTagString <= maxString) {
        datumInput.value = neuerTagString
        await ladeFreieTermine()
    }
}


nextDate.addEventListener("click", () => {
    aendereTag(1)
})

previousDate.addEventListener("click", () => {
    aendereTag(-1)
})

datumInput.addEventListener("change", ladeFreieTermine)

console.log(datumInput.value)

// Datum Ende

function resetMitarbeiter() {
    document.querySelectorAll(".name").forEach(k => {
        k.classList.remove("aktiv2")
        k.style.background = ""
        k.style.color = ""
    })
    ausgewaehlteMitarbeiter = null
    mid = 0

    resetDate()

    uebersicht2.style.color = "white"
    uebersicht2.style.background = "red"
    uebersicht2.textContent = "2"

    uebersicht3.style.color = ""
    uebersicht3.style.background = ""
    buchungName.textContent = "--"
}


for (const all of allMembers) {
    const name = document.createElement("div")
    name.textContent = all.Name
    name.className = "name"
    name.dataset.mitarbeiterName = all.Name
    personen.append(name)

    name.addEventListener("click", async (event) => {
        // HIER wird geprüft, ob schon eine Leistung angeklickt wurde:
        if (!leistungClicked || name.classList.contains("deaktiviert")) {
            return // Wenn nein: sofort abbrechen, nichts passiert!
        }
        resetDate()

        document.querySelectorAll(".name").forEach(k => {
            k.classList.remove("aktiv2")
            k.style.background = ""
            k.style.color = ""
        })
        ausgewaehlteMitarbeiter = all
        mid = all.mitarbeiter_id

        buchungName.textContent = event.currentTarget.textContent

        name.classList.add("aktiv2")
        name.style.background = "black"
        name.style.color = "white"

        uebersicht2.style.color = "white"
        uebersicht2.style.background = "green"
        uebersicht2.textContent = "✔"

        uebersicht3.style.color = "white"
        uebersicht3.style.background = "red"

    })
}

if (allPrice.length > 0) {
    uebersicht.style.color = "white"
    uebersicht.style.background = "red"
    for (const all of allPrice) {
        const karte = document.createElement("div")
        const karteUeberschrift = document.createElement("div")
        const karteBlock = document.createElement("div")
        const karteDauer = document.createElement("div")
        const karteBindestrich = document.createElement("div")
        const kartePreis = document.createElement("div")



        karte.className = "karte"
        karteUeberschrift.className = "karte-ueberschrift"
        karteBlock.className = "karte-block"
        karteDauer.className = "karte-dauer"
        karteBindestrich.className = "karte-bindestrich"
        kartePreis.className = "karte-preis"

        karteUeberschrift.textContent = all.bezeichnung
        karteDauer.textContent = all.dauer_minuten + "Min"
        karteBindestrich.textContent = "—"
        kartePreis.textContent = all.preis + "€"

        karte.addEventListener("click", async () => {
            resetMitarbeiter()

            lid = all.leistungs_id

            const res = await fetch(`http://localhost:8080/api/v1/leistungById?lid=${lid}`)
            const data = await res.json()
            const leistungById = Array.isArray(data) ? data : []

            const erlaubteNamen = leistungById
                .filter(item => item.name)
                .map(item => item.name.trim().toLowerCase())

            document.querySelectorAll(".name").forEach(btn => {
                const mitarbeiterName = btn.dataset.mitarbeiterName

                const istEgalundVerfuegbar = (mitarbeiterName === "Egal" && erlaubteNamen.length > 0)
                const kannLeistung = erlaubteNamen.includes(mitarbeiterName.toLowerCase())
                if (istEgalundVerfuegbar || kannLeistung) {
                    btn.classList.remove("deaktiviert")
                } else {
                    btn.classList.add("deaktiviert")
                }
            })

            document.querySelectorAll(".karte").forEach(k => k.classList.remove("aktiv"))
            karte.classList.add("aktiv")

            leistungClicked = true

            uebersicht.style.color = "white"
            uebersicht.style.background = "green"
            uebersicht.textContent = "✔"

            // 3. Werte aus der Server-Antwort (falls vorhanden) und aus "all" setzen:
            if (leistungById.length > 0) {
                buchungLeistung.textContent = leistungById[0].bezeichnung
            } else {
                buchungLeistung.textContent = all.bezeichnung
            }

            buchungPreis.textContent = all.preis + "€"
            buchungDauer.textContent = all.dauer_minuten + "Min"
            ausgewaehlteLeistung = all
        })
        karteBlock.append(karteDauer, karteBindestrich, kartePreis)
        karte.append(karteUeberschrift, karteBlock)
        container.append(karte)
    }
}



// Hilfsfunktion: Berechnet aus Datum ("2026-11-20"), Startzeit ("10:30") und Dauer (30 Min)
// die exakten MySQL-DATETIME-Strings für beginn und ende
function berechneBeginnUndEnde(datumStr, zeitStr, dauerMinuten) {
    const [jahr, monat, tag] = datumStr.split("-").map(Number)
    const [stunde, minute] = zeitStr.split(":").map(Number)

    const startDatum = new Date(jahr, monat - 1, tag, stunde, minute, 0)
    const endDatum = new Date(startDatum.getTime() + dauerMinuten * 60000)

    const formatDateTime = (d) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        const h = String(d.getHours()).padStart(2, "0")
        const min = String(d.getMinutes()).padStart(2, "0")
        return `${y}-${m}-${day} ${h}:${min}:00`
    }

    return {
        beginn: formatDateTime(startDatum),
        ende: formatDateTime(endDatum)
    }
}

const formEingabe = document.querySelector(".form-eingabe")

formEingabe.addEventListener("submit", async (event) => {
    event.preventDefault() // Verhindert das Neuladen der Seite

    // 1. Prüfen, ob alle vorherigen Schritte ausgewählt wurden
    if (!ausgewaehlteLeistung || !ausgewaehlteMitarbeiter || !datumInput.value || !ausgewaehlteZeit) {
        alert("Bitte wähle zuerst Leistung, Person, Datum und eine Uhrzeit aus.")
        return
    }

    // 2. Kundendaten aus dem Formular auslesen
    const kundeName = document.getElementById("name").value.trim()
    const kundeTel = document.getElementById("tel").value.trim()
    const kundeEmail = document.getElementById("email").value.trim()

    // 3. Beginn und Ende für die Datenbank berechnen
    const { beginn, ende } = berechneBeginnUndEnde(
        datumInput.value,
        ausgewaehlteZeit,
        ausgewaehlteLeistung.dauer_minuten
    )

    // 4. Payload exakt passend zu deinen Datenbank-Spalten zusammenbauen
    const buchungsDaten = {
        name: kundeName,
        tel: kundeTel,
        email: kundeEmail,
        mitarbeiter_id: mid, // Achtung: falls mid === 0 ("Egal"), siehe Hinweis unten!
        leistungs_id: lid,
        beginn: beginn,
        ende: ende,
        preis_bei_buchung: ausgewaehlteLeistung.preis,
        dauer_bei_buchung: ausgewaehlteLeistung.dauer_minuten,
        status: "gebucht"
    }

    try {
        const response = await fetch("http://localhost:8080/api/v1/termin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(buchungsDaten)
        })

        if (!response.ok) {
            throw new Error("Fehler beim Speichern des Termins")
        }

        const result = await response.json()
        console.log("Termin erfolgreich angelegt:", result)

        // Schritt 4 in der Übersicht auf Grün setzen
        uebersicht4.style.color = "white"
        uebersicht4.style.background = "green"
        uebersicht4.textContent = "✔"

        alert("Vielen Dank! Dein Termin wurde verbindlich gebucht.")
        formEingabe.reset()
        resetMitarbeiter()
    } catch (error) {
        console.error(error)
        alert("Leider ist beim Buchen ein Fehler aufgetreten.")
    }
})