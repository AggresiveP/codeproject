/* 🪐 CHRONOSPHERE CORE GAME ENGINE */

// ==========================================
// 1. RPG STATE & LOCAL STORAGE INITIALIZATION
// ==========================================
let state = {
    level: 1,
    xp: 0,
    xpNeeded: 100,
    gold: 100,
    goldEarnedTotal: 100,
    stats: {
        kod: 10,     // Coding Lvl (starts at 10 XP)
        design: 10,  // Design Lvl
        prod: 10     // Production Lvl
    },
    unlockedNodes: ['html-1'], // Nodes unlocked in Skill Tree
    completedQuests: [],
    unlockedHints: {},         // Purchased clues from Buster
    stars: {
        bronze: false,
        silver: false,
        gold: false,
        platinum: false,
        diamond: false
    },
    hasDebt: false,
    theme: 'theme-default',
    purchasedThemes: ['theme-default'],
    crtActive: false,
    isPremium: true,
    simulatedGratis: false, // Testing flag for Creator to test gratis view!
    matrixRainActive: false,
    companionActive: false,
    neuralXpMultiplier: 1.0,
    blitzHighScore: 0,
    dailyStreak: 0,
    lastGauntletCompleted: "",
    raidsCompleted: 0,
    arenaRank: 'COPPER V',
    arenaPoints: 0,
    arenaHistory: [],
    usedPromoCodes: [],
    customPromoCodes: {},
    syndicate: {
        crew: [
            { name: 'Flexbox_Samurai', level: 1, role: 'CSS Specialist', status: 'idle' },
            { name: 'Sarah_SQL', level: 1, role: 'JS Wizard', status: 'idle' },
            { name: 'Buffer_Overlord', level: 1, role: 'Security Specialist', status: 'idle' }
        ],
        activeMission: null,
        missionEndTime: 0,
        currentSync: 50,
        rewards: { gold: 0, xp: 0 },
        crest: {
            name: 'CYBER_SHIELD',
            shape: 'fa-shield',
            icon: 'fa-bolt',
            color: 'cyan'
        }
    }
};

function isUserPremium() {
    return state.isPremium && !state.simulatedGratis;
}

// Quests database
const QUESTS = [
    {
        id: 'start-1',
        title: 'Quest I: Börja Här (Python Print)',
        desc: 'Välkommen till Chronosphere! Skriv en enkel Python-rad som skriver ut "Hej Världen" i konsolen med print-kommandot.',
        rewardXp: 40,
        rewardGold: 20,
        statReward: 'kod',
        defaultCode: '# Skriv din Python print-sats nedan\n',
        hints: {
            free: 'TIPS: Skriv print("Hej Världen") i editorn. Python kräver inga taggar eller semikolon!',
            paid: 'FORMEL: print("Hej Världen")'
        },
        snippet: 'print("Hej Världen")',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            if (!code.includes('print(')) return { pass: false, msg: 'Hittade inget print()-anrop i koden.' };
            if (!code.includes('Hej Världen')) return { pass: false, msg: 'Du skrev inte ut exakt texten "Hej Världen".' };
            return { pass: true, msg: 'Python-utskriften är korrekt formulerad! Välkommen till programmering!' };
        }
    },
    {
        id: 'html-1',
        title: 'Quest II: HTML Rubriker',
        desc: 'Skapa en stor rubrik (<h1>) med texten "Cyber-kodare" för att ge din sida en titel.',
        rewardXp: 50,
        rewardGold: 30,
        statReward: 'kod',
        defaultCode: '<!-- Skapa din h1-tagg nedan -->\n',
        hints: {
            free: 'TIPS: Rubriker skapas med <h1> och avslutas med </h1>.',
            paid: 'FORMEL: <h1>Cyber-kodare</h1>'
        },
        snippet: '<h1>Cyber-kodare</h1>',
        validate: (iframe) => {
            const h1 = iframe.contentDocument.querySelector('h1');
            if (!h1) return { pass: false, msg: 'Hittade inget <h1>-element.' };
            if (h1.innerText.trim() !== 'Cyber-kodare') return { pass: false, msg: 'Texten inuti <h1> är inte exakt "Cyber-kodare".' };
            return { pass: true, msg: 'Perfekt! Rubriken glöder.' };
        }
    },
    {
        id: 'html-2',
        title: 'Quest III: HTML Länkar',
        desc: 'Skapa en hyperlänk (<a>) med id="cyber-link", som länkar till adressen "https://cyber.org" (href-attributet) och innehåller texten "Länk".',
        rewardXp: 60,
        rewardGold: 35,
        statReward: 'prod',
        defaultCode: '<!-- Skapa din länk här -->\n',
        hints: {
            free: "TIPS: Använd <a id='cyber-link' href='https://cyber.org'>Länk</a>.",
            paid: 'FORMEL: <a id="cyber-link" href="https://cyber.org">Länk</a>'
        },
        snippet: '<a id="cyber-link" href="https://cyber.org">Länk</a>',
        validate: (iframe) => {
            const a = iframe.contentDocument.getElementById('cyber-link');
            if (!a) return { pass: false, msg: 'Hittade inget element med id="cyber-link".' };
            if (a.tagName.toLowerCase() !== 'a') return { pass: false, msg: 'Elementet är inte en <a>-länk.' };
            if (a.getAttribute('href') !== 'https://cyber.org') return { pass: false, msg: 'Länkens href-adresse är inte "https://cyber.org".' };
            if (a.innerText.trim() !== 'Länk') return { pass: false, msg: 'Länkens text är inte "Länk".' };
            return { pass: true, msg: 'Länken är uppkopplad och redo!' };
        }
    },
    {
        id: 'html-3',
        title: 'Quest IV: HTML Bilder',
        desc: 'Bädda in en bild i din layout. Skapa en <img>-tagg med id="cyber-img" och källan src="logo.png". (Observera att img är en självstängande tagg!).',
        rewardXp: 70,
        rewardGold: 40,
        statReward: 'prod',
        defaultCode: '<!-- Skapa din bild-tagg här -->\n',
        hints: {
            free: "TIPS: En bild-tagg skrivs som <img id='cyber-img' src='logo.png'>.",
            paid: 'FORMEL: <img id="cyber-img" src="logo.png">'
        },
        snippet: '<img id="cyber-img" src="logo.png">',
        validate: (iframe) => {
            const img = iframe.contentDocument.getElementById('cyber-img');
            if (!img) return { pass: false, msg: 'Hittade inget element med id="cyber-img".' };
            if (img.tagName.toLowerCase() !== 'img') return { pass: false, msg: 'Elementet är inte en <img>-tagg.' };
            if (!img.getAttribute('src') || !img.getAttribute('src').includes('logo.png')) return { pass: false, msg: 'Bildens src är inte "logo.png".' };
            return { pass: true, msg: 'Bilden är framgångsrikt inladdad!' };
        }
    },
    {
        id: 'html-4',
        title: 'Quest V: HTML Listor',
        desc: 'Skapa en ordnad lista (<ol>) med id="cyber-list". Lägg till exakt två list-element (<li>) inuti med texterna "Mana" respektive "Guld".',
        rewardXp: 80,
        rewardGold: 45,
        statReward: 'prod',
        defaultCode: '<!-- Bygg din ordnade lista här -->\n',
        hints: {
            free: "TIPS: Använd en <ol id='cyber-list'>-tagg och lägg till två <li>-taggar inuti.",
            paid: 'FORMEL: <ol id="cyber-list"><li>Mana</li><li>Guld</li></ol>'
        },
        snippet: '<ol id="cyber-list"><li>Mana</li><li>Guld</li></ol>',
        validate: (iframe) => {
            const ol = iframe.contentDocument.getElementById('cyber-list');
            if (!ol) return { pass: false, msg: 'Hittade inget element med id="cyber-list".' };
            if (ol.tagName.toLowerCase() !== 'ol') return { pass: false, msg: 'Elementet är inte en <ol>-lista.' };
            const lis = ol.querySelectorAll('li');
            if (lis.length !== 2) return { pass: false, msg: 'Listan innehåller inte exakt två <li>-element.' };
            if (lis[0].innerText.trim() !== 'Mana' || lis[1].innerText.trim() !== 'Guld') return { pass: false, msg: 'Listans element har inte rätt text ("Mana" och "Guld").' };
            return { pass: true, msg: 'Listan är snyggt ordnad!' };
        }
    },
    {
        id: 'css-1',
        title: 'Quest VI: CSS Färger',
        desc: 'Ge färg till din omgivning! Vi har lagt till en div med id="glow-orb" på skärmen. Skapa en <style>-tagg och ge #glow-orb en röd bakgrundsfärg (background: red;).',
        rewardXp: 60,
        rewardGold: 30,
        statReward: 'design',
        defaultCode: '<div id="glow-orb" style="width:50px;height:50px;border-radius:50%;background:#333;"></div>\n<!-- Skriv din style-tagg nedan -->\n',
        hints: {
            free: "TIPS: Öppna en <style>-tagg, referera till #glow-orb, och sätt 'background: red;' eller 'background-color: red;'.",
            paid: "FORMEL: <style>\n#glow-orb {\n  background: red;\n}\n</style>"
        },
        snippet: '<style>\n#glow-orb {\n  background: red;\n}\n</style>',
        validate: (iframe) => {
            const orb = iframe.contentDocument.getElementById('glow-orb');
            if (!orb) return { pass: false, msg: 'Hittade inte div-elementet #glow-orb.' };
            const style = iframe.contentWindow.getComputedStyle(orb);
            const bg = style.backgroundColor || '';
            if (bg !== 'rgb(255, 0, 0)' && !bg.includes('red')) return { pass: false, msg: 'Bakgrunden på #glow-orb är inte röd.' };
            return { pass: true, msg: 'CSS-magi! Orben lyser nu i starkt rött.' };
        }
    },
    {
        id: 'css-2',
        title: 'Quest VII: CSS Textstorlek',
        desc: 'Ändra skalan på texten. Vi har lagt till en div med id="magic-text". Skapa en <style>-tagg och sätt textstorleken på #magic-text till 24px (font-size: 24px;).',
        rewardXp: 70,
        rewardGold: 35,
        statReward: 'design',
        defaultCode: '<div id="magic-text">Magi</div>\n<!-- Skriv din style-tagg nedan -->\n',
        hints: {
            free: "TIPS: Använd #magic-text { font-size: 24px; } inuti din style-tagg.",
            paid: "FORMEL: <style>\n#magic-text {\n  font-size: 24px;\n}\n</style>"
        },
        snippet: '<style>\n#magic-text {\n  font-size: 24px;\n}\n</style>',
        validate: (iframe) => {
            const el = iframe.contentDocument.getElementById('magic-text');
            if (!el) return { pass: false, msg: 'Hittade inte elementet #magic-text.' };
            const style = iframe.contentWindow.getComputedStyle(el);
            if (style.fontSize !== '24px') return { pass: false, msg: 'Textstorleken är inte 24px (är för närvarande ' + style.fontSize + ').' };
            return { pass: true, msg: 'Textstorleken är perfekt kalibrerad!' };
        }
    },
    {
        id: 'css-3',
        title: 'Quest VIII: CSS Kantlinjer',
        desc: 'Skapa en skyddsramar runt ditt element! Vi har skapat en div med id="shield-box". Skapa en <style>-tagg och ge #shield-box en fast grön kantlinje som är 2px tjock (border: 2px solid green;).',
        rewardXp: 80,
        rewardGold: 40,
        statReward: 'design',
        defaultCode: '<div id="shield-box" style="width:100px;height:50px;background:#111;"></div>\n<!-- Skriv din style-tagg nedan -->\n',
        hints: {
            free: "TIPS: Använd border-egenskapen inuti style-taggen: border: 2px solid green;",
            paid: "FORMEL: <style>\n#shield-box {\n  border: 2px solid green;\n}\n</style>"
        },
        snippet: '<style>\n#shield-box {\n  border: 2px solid green;\n}\n</style>',
        validate: (iframe) => {
            const box = iframe.contentDocument.getElementById('shield-box');
            if (!box) return { pass: false, msg: 'Hittade inte div-elementet #shield-box.' };
            const style = iframe.contentWindow.getComputedStyle(box);
            const borderColor = style.borderColor || '';
            if (!style.borderWidth.includes('2px')) return { pass: false, msg: 'Kantlinjen är inte 2px tjock.' };
            if (!borderColor.includes('rgb(0, 128, 0)') && !borderColor.includes('green')) return { pass: false, msg: 'Kantlinjens färg är inte grön.' };
            return { pass: true, msg: 'Cyberskölden har utrustats med en stabil grön kantlinje!' };
        }
    },
    {
        id: 'css-4',
        title: 'Quest IX: CSS Inner-marginal',
        desc: 'Skapa utrymme inuti ditt block! Vi har förberett en div med id="space-container". Skriv en style-tagg och lägg till en inre marginal (padding: 20px;) till #space-container.',
        rewardXp: 90,
        rewardGold: 45,
        statReward: 'design',
        defaultCode: '<div id="space-container" style="background:#222;color:white;">Text</div>\n<!-- Skriv din style-tagg nedan -->\n',
        hints: {
            free: "TIPS: padding skapar avstånd inuti elementets gräns. Använd padding: 20px;",
            paid: "FORMEL: <style>\n#space-container {\n  padding: 20px;\n}\n</style>"
        },
        snippet: '<style>\n#space-container {\n  padding: 20px;\n}\n</style>',
        validate: (iframe) => {
            const container = iframe.contentDocument.getElementById('space-container');
            if (!container) return { pass: false, msg: 'Hittade inte #space-container.' };
            const style = iframe.contentWindow.getComputedStyle(container);
            if (style.paddingTop !== '20px' && style.padding !== '20px') return { pass: false, msg: 'Inner-marginalen (padding) är inte 20px (är ' + style.paddingTop + ').' };
            return { pass: true, msg: 'Inner-marginalen skapar ett rymligt och elegant luftflöde!' };
        }
    },
    {
        id: 'js-1',
        title: 'Quest X: JS Konsolutskrift',
        desc: 'Väck liv i logiken! Skriv en <script>-tagg med en global funktion som heter sayHello() som returnerar textsträngen "Hej".',
        rewardXp: 60,
        rewardGold: 30,
        statReward: 'kod',
        defaultCode: '<!-- Skriv ditt script nedan -->\n',
        hints: {
            free: 'TIPS: Skapa en script-tagg, skriv function sayHello() { return "Hej"; }',
            paid: 'FORMEL: <script>\nfunction sayHello() {\n  return "Hej";\n}\n</script>'
        },
        snippet: '<script>\nfunction sayHello() {\n  return "Hej";\n}\n</script>',
        validate: (iframe) => {
            const win = iframe.contentWindow;
            if (typeof win.sayHello !== 'function') return { pass: false, msg: 'Hittade inte globala funktionen "sayHello()".' };
            try {
                if (win.sayHello() !== 'Hej') return { pass: false, msg: 'sayHello() returnerade inte strängen "Hej".' };
            } catch(e) {
                return { pass: false, msg: 'Ett fel uppstod vid anrop: ' + e.message };
            }
            return { pass: true, msg: 'Utskriften fungerar felfritt! Logiken har väckts.' };
        }
    },
    {
        id: 'js-2',
        title: 'Quest XI: JS Variabler',
        desc: 'Spara spelardata i minnet! Skapa en <script>-tagg med en global variabel (let goldAmount = 100;) som sparar siffran 100.',
        rewardXp: 70,
        rewardGold: 35,
        statReward: 'kod',
        defaultCode: '<!-- Skriv ditt script nedan -->\n',
        hints: {
            free: 'TIPS: Deklarera variabeln med let på global nivå (utanför funktioner) och ge den värdet 100.',
            paid: 'FORMEL: <script>\nlet goldAmount = 100;\n</script>'
        },
        snippet: '<script>\nlet goldAmount = 100;\n</script>',
        validate: (iframe) => {
            const win = iframe.contentWindow;
            if (win.goldAmount === undefined) return { pass: false, msg: 'Hittade inte den globala variabeln "goldAmount".' };
            if (win.goldAmount !== 100) return { pass: false, msg: 'Variabeln goldAmount är inte satt till siffran 100.' };
            return { pass: true, msg: 'Variabeln sparades säkert i minnet!' };
        }
    },
    {
        id: 'js-3',
        title: 'Quest XII: JS Addition',
        desc: 'Skapa en enkel räknare! Skriv en <script>-tagg med en funktion addNumbers(a, b) som tar emot två siffror och returnerar deras summa (a + b).',
        rewardXp: 80,
        rewardGold: 40,
        statReward: 'kod',
        defaultCode: '<!-- Skriv ditt script nedan -->\n',
        hints: {
            free: 'TIPS: Funktionen ska ta parametrarna a och b och köra: return a + b;',
            paid: 'FORMEL: <script>\nfunction addNumbers(a, b) {\n  return a + b;\n}\n</script>'
        },
        snippet: '<script>\nfunction addNumbers(a, b) {\n  return a + b;\n}\n</script>',
        validate: (iframe) => {
            const win = iframe.contentWindow;
            if (typeof win.addNumbers !== 'function') return { pass: false, msg: 'Hittade inte funktionen "addNumbers(a, b)".' };
            try {
                if (win.addNumbers(10, 20) !== 30) return { pass: false, msg: 'addNumbers(10, 20) returnerade inte summan 30.' };
                if (win.addNumbers(5, -2) !== 3) return { pass: false, msg: 'addNumbers(5, -2) adderade inte korrekta negativa tal.' };
            } catch(e) {
                return { pass: false, msg: 'Fel vid anrop av addNumbers(): ' + e.message };
            }
            return { pass: true, msg: 'Additions-logiken stämmer perfekt!' };
        }
    },
    {
        id: 'js-4',
        title: 'Quest XIII: JS Villkor (If)',
        desc: 'Styr logiken baserat på villkor! Skriv en <script>-tagg med en funktion isEven(num) som returnerar true om talet num är jämnt, annars false.',
        rewardXp: 90,
        rewardGold: 45,
        statReward: 'kod',
        defaultCode: '<!-- Skriv ditt script nedan -->\n',
        hints: {
            free: 'TIPS: Använd modulo-operatorn (num % 2 === 0) för att kontrollera om ett tal är jämnt.',
            paid: 'FORMEL: <script>\nfunction isEven(num) {\n  return num % 2 === 0;\n}\n</script>'
        },
        snippet: '<script>\nfunction isEven(num) {\n  return num % 2 === 0;\n}\n</script>',
        validate: (iframe) => {
            const win = iframe.contentWindow;
            if (typeof win.isEven !== 'function') return { pass: false, msg: 'Hittade inte funktionen "isEven(num)".' };
            try {
                if (win.isEven(4) !== true) return { pass: false, msg: 'isEven(4) returnerade inte true.' };
                if (win.isEven(7) !== false) return { pass: false, msg: 'isEven(7) returnerade inte false.' };
            } catch(e) {
                return { pass: false, msg: 'Fel vid anrop: ' + e.message };
            }
            return { pass: true, msg: 'Modulo-villkoret fungerar felfritt!' };
        }
    },
    {
        id: 'py-1',
        title: 'Quest XIV: Python Aritmetik',
        desc: 'Lär dig räkna i Python! Skriv en Python-rad som adderar två siffror och skriver ut resultatet (t.ex. print(5 + 5)).',
        rewardXp: 70,
        rewardGold: 30,
        statReward: 'kod',
        defaultCode: '# Skriv din Python-kod här\n',
        hints: {
            free: 'TIPS: Skriv print(5 + 5) eller valfri annan addition.',
            paid: 'FORMEL: print(5 + 5)'
        },
        snippet: 'print(5 + 5)',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            if (!code.includes('print(')) return { pass: false, msg: 'Hittade inget print()-anrop i koden.' };
            if (!code.match(/print\(\s*\d+\s*[\+\-\*\/]\s*\d+\s*\)/)) return { pass: false, msg: 'Du har inte skrivit en giltig matematisk operation inuti print().' };
            return { pass: true, msg: 'Python-matematiken är korrekt utförd!' };
        }
    },
    {
        id: 'py-2',
        title: 'Quest XV: Python Variabler',
        desc: 'Deklarera variabler i Python! Skapa en Python-variabel med namnet gold och tilldela den siffran 50 (gold = 50).',
        rewardXp: 80,
        rewardGold: 35,
        statReward: 'kod',
        defaultCode: '# Deklarera din Python-variabel nedan\n',
        hints: {
            free: 'TIPS: Skriv helt enkelt gold = 50. Ingen let/const behövs i Python!',
            paid: 'FORMEL: gold = 50'
        },
        snippet: 'gold = 50',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            const match = code.match(/gold\s*=\s*50/);
            if (!match) return { pass: false, msg: 'Koden sätter inte variabeln gold till 50.' };
            return { pass: true, msg: 'Python-variabeln är lagrad!' };
        }
    },
    {
        id: 'py-3',
        title: 'Quest XVI: Python Kommentarer',
        desc: 'Skriv kommentarer för att förklara din kod. I Python används hashtag-tecknet (#) för kommentarer. Skriv en kommentar: "# Detta är en kommentar".',
        rewardXp: 90,
        rewardGold: 40,
        statReward: 'kod',
        defaultCode: '# Skriv din kommentar här\n',
        hints: {
            free: 'TIPS: Börja raden med tecknet # följt av ett mellanslag och din text.',
            paid: 'FORMEL: # Detta är en kommentar'
        },
        snippet: '# Detta är en kommentar',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            if (!code.includes('#') || (!code.includes('Detta är en kommentar') && !code.includes('Detta ar en kommentar'))) {
                return { pass: false, msg: 'Koden innehåller inte kommentaren "# Detta är en kommentar".' };
            }
            return { pass: true, msg: 'Kommentaren är perfekt formulerad!' };
        }
    },
    {
        id: 'py-4',
        title: 'Quest XVII: Python Funktioner',
        desc: 'Definiera en funktion i Python! Funktioner i Python börjar med nyckelordet def följt av funktionens namn. Skapa en tom funktionsdefinition say_hi() (def say_hi():).',
        rewardXp: 100,
        rewardGold: 45,
        statReward: 'kod',
        defaultCode: '# Skapa din Python-funktion nedan\n',
        hints: {
            free: 'TIPS: Skriv def say_hi(): på en ny rad. Kom ihåg kolon i slutet!',
            paid: 'FORMEL: def say_hi():'
        },
        snippet: 'def say_hi():',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            if (!code.includes('def say_hi(') || !code.includes(':')) {
                return { pass: false, msg: 'Koden definierar inte funktionen say_hi() med ett kolon i slutet.' };
            }
            return { pass: true, msg: 'Python-funktionen är mästerligt definierad!' };
        }
    },
    {
        id: 'json-1',
        title: 'Quest XVIII: JSON Strängar',
        desc: 'JSON (JavaScript Object Notation) är cyberspace standard för dataöverföring. Skriv ett giltigt JSON-objekt som innehåller en nyckel "name" med strängvärdet "Cyber" (t.ex. {"name": "Cyber"}).',
        rewardXp: 60,
        rewardGold: 30,
        statReward: 'prod',
        defaultCode: '{\n  "name": "Cyber"\n}\n',
        hints: {
            free: 'TIPS: JSON kräver dubbla citattecken runt både nycklar och strängvärden. Format: {"nyckel": "värde"}',
            paid: 'FORMEL: {\n  "name": "Cyber"\n}'
        },
        snippet: '{\n  "name": "Cyber"\n}',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            try {
                const obj = JSON.parse(code);
                if (obj.name !== 'Cyber') return { pass: false, msg: 'Nyckeln "name" har inte värdet "Cyber".' };
            } catch(e) {
                return { pass: false, msg: 'Ogiltigt JSON-format: ' + e.message };
            }
            return { pass: true, msg: 'JSON-strängen tolkades perfekt i cyberspace!' };
        }
    },
    {
        id: 'json-2',
        title: 'Quest XIX: JSON Siffror',
        desc: 'Spara siffror i JSON! Siffror i JSON skrivs UTAN citattecken. Skriv ett JSON-objekt som innehåller en nyckel "level" med siffervärdet 10 (t.ex. {"level": 10}).',
        rewardXp: 75,
        rewardGold: 35,
        statReward: 'prod',
        defaultCode: '{\n  \n}\n',
        hints: {
            free: 'TIPS: Skriv {"level": 10}. Använd inte citattecken runt siffran 10!',
            paid: 'FORMEL: {\n  "level": 10\n}'
        },
        snippet: '{\n  "level": 10\n}',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            try {
                const obj = JSON.parse(code);
                if (obj.level !== 10) return { pass: false, msg: 'Nyckeln "level" har inte värdet 10.' };
            } catch(e) {
                return { pass: false, msg: 'Ogiltigt JSON-format: ' + e.message };
            }
            return { pass: true, msg: 'JSON-siffran tolkades framgångsrikt!' };
        }
    },
    {
        id: 'json-3',
        title: 'Quest XX: JSON Listor',
        desc: 'Spara listor/arrayer i JSON! Listor skrivs inom hakparenteser []. Skriv ett JSON-objekt som innehåller en nyckel "skills" med listan ["html", "css"] (t.ex. {"skills": ["html", "css"]}).',
        rewardXp: 90,
        rewardGold: 45,
        statReward: 'prod',
        defaultCode: '{\n  \n}\n',
        hints: {
            free: 'TIPS: Skriv {"skills": ["html", "css"]}. Kom ihåg dubbelfnuttarna runt alla strängar!',
            paid: 'FORMEL: {\n  "skills": ["html", "css"]\n}'
        },
        snippet: '{\n  "skills": ["html", "css"]\n}',
        validate: (iframe) => {
            const code = codeArea.value.trim();
            try {
                const obj = JSON.parse(code);
                if (!Array.isArray(obj.skills)) return { pass: false, msg: 'Nyckeln "skills" innehåller inte en array.' };
                if (obj.skills.length !== 2 || obj.skills[0] !== 'html' || obj.skills[1] !== 'css') {
                    return { pass: false, msg: 'Arrayen innehåller inte exakt ["html", "css"].' };
                }
            } catch(e) {
                return { pass: false, msg: 'Ogiltigt JSON-format: ' + e.message };
            }
            return { pass: true, msg: 'JSON-listan tolkades helt felfritt!' };
        }
    }
];

let activeQuest = QUESTS[0];
let isEditorModified = false;
// ==========================================
// 1.1. CMD PLAYGROUND DATABASE TOPICS (SEQUENTIAL GUIDED)
// ==========================================
const CMD_PLAYGROUND_TOPICS = {
    python: [
        {
            id: 'py-varprint',
            name: '1. Variabler & Utskrift',
            steps: [
                {
                    instruction: 'Skapa en variabel med namnet "namn" och sätt den till ditt namn inom citattecken (t.ex. namn = "Tom").',
                    how: 'namn = "Tom"',
                    think: 'Variabler sparar information i minnet. I Python behövs inget "let" eller "var", bara namnet!',
                    misses: 'Använd matchande citattecken runt ditt namn (t.ex. "Tom" eller \'Tom\') och kontrollera att du har ett likamedtecken.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^namn\s*=\s*(["'])(.*?)\1$/);
                        if (!match) return { pass: false, msg: 'Felaktig syntax. Skriv exakt: namn = "ditt namn"' };
                        sessionVars.namn = match[2];
                        return { pass: true, msg: `Variabeln "namn" sparades med värdet "${match[2]}"!` };
                    }
                },
                {
                    instruction: 'Utmärkt! Nu när namnet är sparat i variabeln "namn", låt oss skriva ut det i konsolen genom att printa variabeln (t.ex. print(namn)).',
                    how: 'print(namn)',
                    think: 'När du skickar en variabel till print() letar Python upp dess värde i minnet och skriver ut det.',
                    misses: 'Skriv inte citattecken runt "namn" inuti print. print("namn") skriver bara ut ordet "namn", inte ditt sparade värde!',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (clean === 'print("namn")' || clean === "print('namn')") {
                            return { pass: false, msg: 'Nära! Men du satte citattecken runt variabelnamnet, så den kommer bara skriva ut ordet "namn" istället för ditt sparade namn.' };
                        }
                        const match = clean.match(/^print\(\s*namn\s*\)$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: print(namn)' };
                        const val = sessionVars.namn || 'Tom';
                        return { pass: true, msg: `> ${val}\nUtskriften lyckades! Variabeln lästes in från minnet.` };
                    }
                },
                {
                    instruction: 'Mästerligt! Låt oss nu göra en sammansättning (konkatenering) av text! Skriv ut en hälsning genom att lägga ihop "Hej " med din variabel: print("Hej " + namn).',
                    how: 'print("Hej " + namn)',
                    think: 'Plustecknet (+) lägger ihop två textsträngar till en enda lång sträng.',
                    misses: 'Se till att du har ett plustecken och att "Hej " har ett mellanslag inuti citattecknen så att orden inte klistras ihop.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^print\(\s*(["'])Hej\s*\1\s*\+\s*namn\s*\)$/);
                        if (!match) return { pass: false, msg: 'Felaktig syntax. Skriv exakt: print("Hej " + namn)' };
                        const val = sessionVars.namn || 'Tom';
                        return { pass: true, msg: `> Hej ${val}\nFelfritt! Du har konkatenerat din första textsträng!` };
                    }
                }
            ]
        },
        {
            id: 'py-math',
            name: '2. Heltal & Matematik',
            steps: [
                {
                    instruction: 'Skapa en heltalsvariabel "guld" och sätt den till siffran 100 (kom ihåg: inga citattecken runt siffror!).',
                    how: 'guld = 100',
                    think: 'Heltal (integers) skrivs utan citattecken. Sätter du citattecken blir det en textsträng, och då kan du inte räkna med den.',
                    misses: 'Skriv inte guld = "100". Det måste vara ett rent siffervärde.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (clean.includes('"') || clean.includes("'")) {
                            return { pass: false, msg: 'Ojdå! Du använde citattecken. Siffror skrivs helt utan citattecken: guld = 100' };
                        }
                        const match = clean.match(/^guld\s*=\s*(\d+)$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: guld = 100' };
                        sessionVars.guld = parseInt(match[1], 10);
                        return { pass: true, msg: 'Heltalet sparades! Din kassa är nu laddad med 100 Guld.' };
                    }
                },
                {
                    instruction: 'Perfekt! Låt oss nu skapa en till heltalsvariabel med namnet "skatt" och sätta den till siffran 50.',
                    how: 'skatt = 50',
                    think: 'Nu har vi två variabler sparade i vårt minne (guld och skatt) som vi kan utföra matematiska beräkningar på.',
                    misses: 'Kontrollera variabelnamnet "skatt" och att du inte använder citattecken.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (clean.includes('"') || clean.includes("'")) {
                            return { pass: false, msg: 'Inga citattecken runt siffran 50!' };
                        }
                        const match = clean.match(/^skatt\s*=\s*(\d+)$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: skatt = 50' };
                        sessionVars.skatt = parseInt(match[1], 10);
                        return { pass: true, msg: 'Skattvariabeln sparad! Busters avgift har beräknats.' };
                    }
                },
                {
                    instruction: 'Nu ska vi räkna ut summan! Skriv ut ditt kvarvarande guld efter skatten genom att subtrahera variablerna: print(guld - skatt).',
                    how: 'print(guld - skatt)',
                    think: 'Python kan räkna direkt med variabler som innehåller siffror genom att använda de vanliga räknesätten (+, -, *, /).',
                    misses: 'Skriv inte citattecken runt variablerna inuti print-parentesen.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^print\(\s*guld\s*-\s*skatt\s*\)$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: print(guld - skatt)' };
                        const g = sessionVars.guld || 100;
                        const s = sessionVars.skatt || 50;
                        return { pass: true, msg: `> ${g - s}\nUtmärkt! Summan beräknades live i terminalen: 100 - 50 = 50!` };
                    }
                }
            ]
        },
        {
            id: 'py-conditionals',
            name: '3. Villkor (If/Else)',
            steps: [
                {
                    instruction: 'Låt oss lära oss villkor! Skapa en heltalsvariabel "hp" och sätt den till siffran 20.',
                    how: 'hp = 20',
                    think: 'Villkor styrs av logik. Här skapar vi först hälsan som en variabel som vi sedan ska analysera.',
                    misses: 'Kom ihåg att heltal skrivs utan citattecken: hp = 20',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (clean.includes('"') || clean.includes("'")) return { pass: false, msg: 'Inga citattecken runt siffran!' };
                        const match = clean.match(/^hp\s*=\s*(\d+)$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: hp = 20' };
                        sessionVars.hp = parseInt(match[1], 10);
                        return { pass: true, msg: 'Hälsan (hp) registrerad!' };
                    }
                },
                {
                    instruction: 'Bra! Låt oss skapa ett booleskt uttryck "is_low" som kollar om hp är mindre än 30 ( hp < 30 ): is_low = hp < 30',
                    how: 'is_low = hp < 30',
                    think: 'Jämförelseoperatorer som mindre än (<) returnerar True eller False beroende på om påståendet stämmer.',
                    misses: 'Stava variabeln is_low exakt och använd mindre-än-tecknet (<).',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^is_low\s*=\s*hp\s*<\s*30$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: is_low = hp < 30' };
                        sessionVars.is_low = (sessionVars.hp || 20) < 30;
                        return { pass: true, msg: 'Booleska uttrycket beräknat i minnet!' };
                    }
                },
                {
                    instruction: 'Kanon! Låt oss skriva ut resultatet för att se om det stämmer. Skriv: print(is_low)',
                    how: 'print(is_low)',
                    think: 'Eftersom 20 är mindre än 30 kommer Python att utvärdera uttrycket till True.',
                    misses: 'Kontrollera att du inte har citattecken runt is_low i din print-sats.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^print\(\s*is_low\s*\)$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: print(is_low)' };
                        const val = sessionVars.is_low !== undefined ? sessionVars.is_low : true;
                        return { pass: true, msg: `> ${val ? 'True' : 'False'}\nFelfritt! Hälsan är kritiskt låg (True).` };
                    }
                }
            ]
        }
    ],
    csharp: [
        {
            id: 'cs-basics',
            name: '1. C# Variabler & Konsol',
            steps: [
                {
                    instruction: 'C# är statiskt typat och kräver semikolon (;). Skapa en textvariabel med typen "string" och namnet "klan": string klan = "Cyber";',
                    how: 'string klan = "Cyber";',
                    think: 'I C# måste du ange typen (string för text) före variabelns namn, och varje rad måste avslutas med semikolon.',
                    misses: 'Glöm inte semikolonet (;) i slutet av raden! Det är C#-kodarens mest klassiska misstag.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (!clean.endsWith(';')) return { pass: false, msg: 'C# kräver ett semikolon (;) i slutet av instruktionen!' };
                        const match = clean.match(/^string\s+klan\s*=\s*(["'])(.*?)\1\s*;$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: string klan = "Cyber";' };
                        sessionVars.klan = match[2];
                        return { pass: true, msg: 'Utmärkt! C#-strängvariabeln kompilerade utan fel.' };
                    }
                },
                {
                    instruction: 'Snyggt! Skriv nu ut din klan-variabel i konsolen med C#s utskriftskommando: Console.WriteLine(klan);',
                    how: 'Console.WriteLine(klan);',
                    think: 'Console.WriteLine() är C#s motsvarighet till Pythons print() eller JavaScripts console.log().',
                    misses: 'Observera att Console och WriteLine skrivs med stora begynnelsebokstäver, och glöm inte semikolon (;).',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (!clean.endsWith(';')) return { pass: false, msg: 'Glöm inte semikolonet (;) i slutet av Console.WriteLine!' };
                        const match = clean.match(/^Console\.WriteLine\(\s*klan\s*\)\s*;$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: Console.WriteLine(klan);' };
                        const k = sessionVars.klan || 'Cyber';
                        return { pass: true, msg: `> ${k}\nSemikolon och syntax stämmer perfekt! C#-utskriften slutförd.` };
                    }
                },
                {
                    instruction: 'Grymt! Låt oss skapa en heltalsvariabel "level" satt till 5: int level = 5; och skriv sedan ut den med Console.WriteLine(level); på en egen rad (skriv båda raderna efter varandra separerade med mellanslag!).',
                    how: 'int level = 5; Console.WriteLine(level);',
                    think: 'Heltal i C# deklareras med typen "int" och kan skrivas ut i konsolen på samma sätt som textsträngar.',
                    misses: 'Se till att du har semikolon efter BÅDA instruktionerna! Exempel: int level = 5; Console.WriteLine(level);',
                    validate: (input, sessionVars) => {
                        const clean = input.trim().replace(/\s+/g, ' ');
                        const match = clean.match(/^int\s+level\s*=\s*5\s*;\s*Console\.WriteLine\(\s*level\s*\)\s*;$/);
                        if (!match) return { pass: false, msg: 'Skriv båda raderna exakt: int level = 5; Console.WriteLine(level);' };
                        return { pass: true, msg: `> 5\nFelfritt! Du har framgångsrikt deklarerat och skrivit ut ett heltal i C#!` };
                    }
                }
            ]
        },
        {
            id: 'cs-conditionals',
            name: '2. C# Villkor (If)',
            steps: [
                {
                    instruction: 'Skapa en heltalsvariabel för hälsa: int hp = 80;',
                    how: 'int hp = 80;',
                    think: 'Precis som i Python använder vi variabler som utgångspunkt för våra villkors-beräkningar.',
                    misses: 'Glöm inte semikolonet (;) efter heltals-deklarationen!',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (!clean.endsWith(';')) return { pass: false, msg: 'Glöm inte semikolonet (;)' };
                        const match = clean.match(/^int\s+hp\s*=\s*(\d+)\s*;$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: int hp = 80;' };
                        sessionVars.cs_hp = parseInt(match[1], 10);
                        return { pass: true, msg: 'Hälsan (hp) lagrad i C#-minnet.' };
                    }
                },
                {
                    instruction: 'Perfekt! Skapa nu en boolesk variabel "isInjured" som kontrollerar om hp är mindre än 100: bool isInjured = hp < 100;',
                    how: 'bool isInjured = hp < 100;',
                    think: 'I C# deklareras booleska variabler med typen "bool" och kan endast hålla värdena "true" eller "false".',
                    misses: 'Stava typen "bool" med små bokstäver och avsluta med semikolon (;).',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (!clean.endsWith(';')) return { pass: false, msg: 'Glöm inte semikolon (;) i slutet.' };
                        const match = clean.match(/^bool\s+isInjured\s*=\s*hp\s*<\s*100\s*;$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: bool isInjured = hp < 100;' };
                        sessionVars.cs_isInjured = (sessionVars.cs_hp || 80) < 100;
                        return { pass: true, msg: 'Booleska utvärderingen sparad i isInjured!' };
                    }
                },
                {
                    instruction: 'Bra gjort! Skriv nu ut resultatet i konsolen: Console.WriteLine(isInjured);',
                    how: 'Console.WriteLine(isInjured);',
                    think: 'Eftersom 80 är mindre än 100 kommer programmet att utvärdera uttrycket till true.',
                    misses: 'Kom ihåg semikolon (;) och stora bokstäver på Console och WriteLine.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (!clean.endsWith(';')) return { pass: false, msg: 'Glöm inte semikolonet (;)' };
                        const match = clean.match(/^Console\.WriteLine\(\s*isInjured\s*\)\s*;$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: Console.WriteLine(isInjured);' };
                        const val = sessionVars.cs_isInjured !== undefined ? sessionVars.cs_isInjured : true;
                        return { pass: true, msg: `> ${val ? 'true' : 'false'}\nBriljant! C# utvärderade uttrycket korrekt till true.` };
                    }
                }
            ]
        }
    ],
    css: [
        {
            id: 'css-basics',
            name: '1. CSS Textstilar',
            steps: [
                {
                    instruction: 'I CSS stylar vi element. Sätt textfärgen till cyan genom att ange färg-egenskapen: color: cyan;',
                    how: 'color: cyan;',
                    think: 'CSS-stilar skrivs som "egenskap: värde;". Vi använder kolon istället för likamedtecken.',
                    misses: 'Använd kolon (:) efter color, inte likamedtecken (=), och avsluta med semikolon (;).',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (clean.includes('=')) return { pass: false, msg: 'I CSS använder man inte likamedtecken (=). Använd kolon: color: cyan;' };
                        const match = clean.match(/^color\s*:\s*cyan\s*;?$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: color: cyan;' };
                        return { pass: true, msg: 'Färgregeln tillämpad! Texten glöder nu i cyan.' };
                    }
                },
                {
                    instruction: 'Snyggt! Låt oss lägga till en cool textskugga för en riktig neon-glöd: text-shadow: 0 0 10px cyan;',
                    how: 'text-shadow: 0 0 10px cyan;',
                    think: 'text-shadow tar tre mått (horisontell skugga, vertikal skugga, blur-radie) och en färg.',
                    misses: 'Se till att du stavar text-shadow med ett bindestreck och anger enheten px för blur-radien.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^text-shadow\s*:\s*0\s+0\s+10px\s+cyan\s*;?$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: text-shadow: 0 0 10px cyan;' };
                        return { pass: true, msg: 'Wow! Skuggeffekten skapade en fantastisk lysande neonglöd.' };
                    }
                },
                {
                    instruction: 'Perfekt! Lägg slutligen till en inre marginal (padding) på 10 pixlar för att skapa avstånd till kanten: padding: 10px;',
                    how: 'padding: 10px;',
                    think: 'Padding skapar tomt utrymme på insidan av ett element för att göra det mer luftigt och läsbart.',
                    misses: 'Kom ihåg enheten px efter siffran 10!',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^padding\s*:\s*10px\s*;?$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: padding: 10px;' };
                        return { pass: true, msg: 'Stiligt! Elementet har nu ett snyggt inre andningsrum (10px padding).' };
                    }
                }
            ]
        }
    ],
    js: [
        {
            id: 'js-basics',
            name: '1. JS let-Variabler & Konsol',
            steps: [
                {
                    instruction: 'Deklarera en variabel med let som heter "power" och sätt den till siffran 99: let power = 99;',
                    how: 'let power = 99;',
                    think: 'let används i modern JavaScript för att deklarera variabler vars värde kan ändras senare.',
                    misses: 'Använd let, ge den namnet power, ett likamedtecken och siffran 99. Avsluta med semikolon (överkurs men rekommenderat).',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^let\s+power\s*=\s*99\s*;?$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: let power = 99;' };
                        sessionVars.power = 99;
                        return { pass: true, msg: 'Variabeln "power" skapades och sattes till 99!' };
                    }
                },
                {
                    instruction: 'Perfekt! Låt oss nu öka värdet på variabeln med 1 genom att lägga till 1 till den: power = power + 1;',
                    how: 'power = power + 1;',
                    think: 'Genom att skriva power = power + 1 tar datorn det nuvarande värdet (99), lägger till 1 (100) och sparar tillbaka det i power.',
                    misses: 'Använd inte "let" igen när du ändrar värdet på en befintlig variabel. let ska bara användas första gången variabeln skapas!',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        if (clean.startsWith('let ') || clean.startsWith('const ')) {
                            return { pass: false, msg: 'Fel! Du ska inte använda "let" eller "const" när du ändrar en befintlig variabel. Skriv bara: power = power + 1;' };
                        }
                        const match = clean.match(/^power\s*=\s*power\s*\+\s*1\s*;?$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: power = power + 1;' };
                        sessionVars.power = 100;
                        return { pass: true, msg: 'Variabeln uppdaterades i minnet! Nytt värde: 100.' };
                    }
                },
                {
                    instruction: 'Nu ska vi skriva ut resultatet i webbläsarens logg! Skriv kommandot: console.log(power);',
                    how: 'console.log(power);',
                    think: 'console.log() skriver ut information till utvecklarverktygens konsol i webbläsaren.',
                    misses: 'Stava console.log med små bokstäver och glöm inte parenteserna runt variabeln power.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim();
                        const match = clean.match(/^console\.log\(\s*power\s*\)\s*;?$/);
                        if (!match) return { pass: false, msg: 'Skriv exakt: console.log(power);' };
                        const p = sessionVars.power || 100;
                        return { pass: true, msg: `> ${p}\nUtskriften lyckades! JavaScript-loggen visar det uppdaterade värdet 100.` };
                    }
                },
                {
                    instruction: 'Häftigt! Låt oss nu lära oss JS-arrayer (listor)! Skapa en lista med två teknologier: let skills = ["js", "html"]; och skriv sedan ut det första elementet med: console.log(skills[0]); (skriv båda raderna efter varandra!)',
                    how: 'let skills = ["js", "html"]; console.log(skills[0]);',
                    think: 'Arrayer sparar flera värden på en rad. Indexering börjar på 0, så skills[0] pekar på det allra första värdet ("js").',
                    misses: 'Se till att du använder hakparenteser [] för arrayen och avsluta med semikolon på båda raderna.',
                    validate: (input, sessionVars) => {
                        const clean = input.trim().replace(/\s+/g, ' ');
                        const match = clean.match(/^let\s+skills\s*=\s*\[\s*(["'])js\1\s*,\s*(["'])html\2\s*\]\s*;?\s*console\.log\(\s*skills\s*\[\s*0\s*\]\s*\)\s*;?$/);
                        if (!match) return { pass: false, msg: 'Skriv båda raderna exakt: let skills = ["js", "html"]; console.log(skills[0]);' };
                        return { pass: true, msg: ' > "js"\nOtroligt! JS-listor och index-sökningar stämmer helt perfekt!' };
                    }
                }
            ]
        }
    ]
};

// Load game from LocalStorage
function loadGame() {
    const saved = localStorage.getItem('chronosphere_save');
    if (saved) {
        try {
            state = { ...state, ...JSON.parse(saved) };
            // Ensure compatibility with older saves
            state.unlockedNodes = Array.isArray(state.unlockedNodes) ? state.unlockedNodes : ['start-1'];
            if (!state.unlockedNodes.includes('start-1')) {
                state.unlockedNodes.unshift('start-1');
            }
            state.completedQuests = Array.isArray(state.completedQuests) ? state.completedQuests : [];
            state.unlockedHints = state.unlockedHints || {};
            state.arenaRank = state.arenaRank || 'COPPER V';
            state.arenaPoints = state.arenaPoints !== undefined ? state.arenaPoints : 0;
            state.arenaHistory = state.arenaHistory || [];
            state.usedPromoCodes = state.usedPromoCodes || [];
            state.customPromoCodes = state.customPromoCodes || {};
            state.syndicate = state.syndicate || {
                crew: [
                    { name: 'Flexbox_Samurai', level: 1, role: 'CSS Specialist', status: 'idle' },
                    { name: 'Sarah_SQL', level: 1, role: 'JS Wizard', status: 'idle' },
                    { name: 'Buffer_Overlord', level: 1, role: 'Security Specialist', status: 'idle' }
                ],
                activeMission: null,
                missionEndTime: 0,
                currentSync: 50,
                rewards: { gold: 0, xp: 0 },
                crest: {
                    name: 'CYBER_SHIELD',
                    shape: 'fa-shield',
                    icon: 'fa-bolt',
                    color: 'cyan'
                }
            };
            state.syndicate.crest = state.syndicate.crest || {
                name: 'CYBER_SHIELD',
                shape: 'fa-shield',
                icon: 'fa-bolt',
                color: 'cyan'
            };
            state.purchasedThemes = Array.isArray(state.purchasedThemes) ? state.purchasedThemes : ['theme-default'];
            if (!state.purchasedThemes.includes('theme-default')) {
                state.purchasedThemes.push('theme-default');
            }
            state.crtActive = state.crtActive !== undefined ? state.crtActive : false;
            state.isPremium = state.isPremium !== undefined ? state.isPremium : true; // Default to true for Creator
            state.simulatedGratis = state.simulatedGratis !== undefined ? state.simulatedGratis : false;
            state.matrixRainActive = state.matrixRainActive !== undefined ? state.matrixRainActive : false;
            state.companionActive = state.companionActive !== undefined ? state.companionActive : false;
            state.neuralXpMultiplier = state.neuralXpMultiplier !== undefined ? state.neuralXpMultiplier : 1.0;
            state.blitzHighScore = state.blitzHighScore !== undefined ? state.blitzHighScore : 0;
            state.dailyStreak = state.dailyStreak !== undefined ? state.dailyStreak : 0;
            state.lastGauntletCompleted = state.lastGauntletCompleted !== undefined ? state.lastGauntletCompleted : "";
            
            // Ensure classes applied properly
            document.body.className = state.theme + (state.crtActive ? ' crt-active' : '');
        } catch (e) {
            console.error('Kunde inte läsa spardata:', e);
        }
    }
    updateHUD();
    loadAchievements();
    renderCustomCodes();
    initSyndicateHQ();

    renderSkillTree();
    
    // Engångs-återställning för V5 Python Starting Node & CMD Playground
    if (!localStorage.getItem('chronosphere_skilltree_v5')) {
        state.unlockedNodes = ['start-1'];
        state.completedQuests = [];
        localStorage.setItem('chronosphere_skilltree_v5', 'true');
        saveGame();
    }
    
    // Engångs-återställning för V6 (CRT & Themes Locker)
    if (!localStorage.getItem('chronosphere_skilltree_v6')) {
        state.purchasedThemes = ['theme-default'];
        state.crtActive = false;
        localStorage.setItem('chronosphere_skilltree_v6', 'true');
        saveGame();
    }
    
    // Set up active CRT HUD trigger state visually
    const triggerBtn = document.getElementById('crt-toggle-trigger');
    if (triggerBtn) {
        if (state.crtActive) {
            document.body.classList.add('crt-active');
            triggerBtn.classList.add('active');
            triggerBtn.querySelector('span').innerText = 'CRT: ON';
        } else {
            document.body.classList.remove('crt-active');
            triggerBtn.classList.remove('active');
            triggerBtn.querySelector('span').innerText = 'CRT: OFF';
        }
    }
    
    // Engångs-återställning för V7 (Classified Black Cabinet)
    if (!localStorage.getItem('chronosphere_skilltree_v7')) {
        state.isPremium = true; // Auto Creator VIP!
        state.matrixRainActive = false;
        state.companionActive = false;
        state.neuralXpMultiplier = 1.0;
        localStorage.setItem('chronosphere_skilltree_v7', 'true');
        saveGame();
    }
    
    // Handle Premium elements and VIP simulation state
    const creatorBadge = document.getElementById('hud-creator-badge');
    const simCheckbox = document.getElementById('vip-sim-checkbox');
    
    if (isUserPremium()) {
        if (creatorBadge) creatorBadge.style.display = 'flex';
    } else {
        if (creatorBadge) creatorBadge.style.display = 'none';
    }
    
    if (simCheckbox) {
        simCheckbox.checked = !!state.simulatedGratis;
    }
    
    // Initialize active companion or rain states
    if (state.matrixRainActive) {
        document.body.classList.add('matrix-rain-active');
        initMatrixRain();
    } else {
        document.body.classList.remove('matrix-rain-active');
    }
    
    if (state.companionActive) {
        initCyberCompanion();
    } else {
        const petContainer = document.getElementById('cyber-pet-container');
        if (petContainer) petContainer.classList.add('hidden');
    }
    
    // Refresh shop buttons styling
    refreshThemeStoreButtons();
}

// Save game to LocalStorage
function saveGame() {
    localStorage.setItem('chronosphere_save', JSON.stringify(state));
}

// Update the entire top HUD
function updateHUD() {
    document.getElementById('player-level').innerText = state.level;
    document.getElementById('char-level-badge').innerText = state.level;
    document.getElementById('player-gold').innerText = state.gold;
    document.getElementById('xp-text').innerText = `${state.xp} / ${state.xpNeeded} XP`;
    
    // XP Fill
    const pct = (state.xp / state.xpNeeded) * 100;
    document.getElementById('xp-fill').style.width = `${pct}%`;
    
    // Skill Level Calculations (Every 50 stat points = 1 stat level)
    const kodLvl = Math.floor(state.stats.kod / 50) + 1;
    const designLvl = Math.floor(state.stats.design / 50) + 1;
    const prodLvl = Math.floor(state.stats.prod / 50) + 1;
    
    document.getElementById('stat-kod').innerText = `Lvl ${kodLvl} (${state.stats.kod} XP)`;
    document.getElementById('stat-design').innerText = `Lvl ${designLvl} (${state.stats.design} XP)`;
    document.getElementById('stat-prod').innerText = `Lvl ${prodLvl} (${state.stats.prod} XP)`;
    
    // Skill fills
    document.getElementById('fill-kod').style.width = `${(state.stats.kod % 50) * 2}%`;
    document.getElementById('fill-design').style.width = `${(state.stats.design % 50) * 2}%`;
    document.getElementById('fill-prod').style.width = `${(state.stats.prod % 50) * 2}%`;

    // Star badges
    Object.keys(state.stars).forEach(star => {
        const badge = document.querySelector(`.star-${star}`);
        if (state.stars[star]) {
            badge.classList.remove('locked');
        } else {
            badge.classList.add('locked');
        }
    });

    // Debt Status
    const debtLabel = document.getElementById('stats-debt');
    const payDebtBtn = document.getElementById('pay-debt-btn');
    if (state.hasDebt) {
        debtLabel.innerText = 'SKULD (50% TAX)';
        debtLabel.className = 'val text-red';
        payDebtBtn.disabled = false;
    } else {
        debtLabel.innerText = 'SKULDFRI';
        debtLabel.className = 'val text-green';
        payDebtBtn.disabled = true;
    }
    updateArenaLobbyHUD();
}

// Award XP & Gold with debt tax logic
function gainRewards(xpGained, goldGained, statName) {
    // Syndicate Sync Hook
    if (state.syndicate && state.syndicate.activeMission) {
        if (statName === 'kod') {
            addSyndicateSync(30, 'Arena-match vinst');
        } else if (statName) {
            addSyndicateSync(25, 'Codex-spell avklarad');
        }
    }

    // Scale XP for Premium VIP & Booster
    if (isUserPremium()) {
        const mult = 1.5 * (state.neuralXpMultiplier || 1.0);
        xpGained = Math.round(xpGained * mult);
    }

    let finalXp = xpGained;
    let finalGold = goldGained;
    
    if (state.hasDebt) {
        finalXp = Math.floor(xpGained * 0.5);
        notif(`Busters skatt tog 50% av din XP!`, 'error');
    }
    
    state.gold += finalGold;
    state.goldEarnedTotal += finalGold;
    state.xp += finalXp;
    
    if (statName && state.stats[statName] !== undefined) {
        state.stats[statName] += xpGained; // Raw stat points are not taxed!
    }
    
    // Level Up loop
    while (state.xp >= state.xpNeeded) {
        state.xp -= state.xpNeeded;
        state.level += 1;
        state.xpNeeded = Math.floor(state.xpNeeded * 1.5);
        notif(`LEVEL UP! Du är nu Level ${state.level}!`, 'info');
        triggerConfetti();
    }
    
    // Auto achievements
    checkAchievements();
    
    updateHUD();
    saveGame();
}

// ==========================================
// 2. TOAST NOTIFICATIONS SYSTEM
// ==========================================
function notif(message, type = 'info') {
    const container = document.getElementById('notif-box');
    const toast = document.createElement('div');
    toast.className = `toast-notif toast-${type}`;
    
    let icon = '<i class="fa-solid fa-circle-info"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Autoremove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// 3. ACHIEVEMENTS & PRESTIGE LOGIC
// ==========================================
const ACHIEVEMENT_LIST = [
    { id: 'first_quest', title: 'Första Trollformeln', desc: 'Lös din allra första Quest i arenan.', check: () => state.completedQuests.length >= 1 },
    { id: 'gold_collector', title: 'Skattkammarvakt', desc: 'Tjäna totalt 250 Guld under din resa.', check: () => state.goldEarnedTotal >= 250 },
    { id: 'master_level', title: 'Erfaren Smed', desc: 'Nå karaktärsnivå 5.', check: () => state.level >= 5 },
    { id: 'debt_free', title: 'Finansiellt Geni', desc: 'Tjäna guld och betala av en Buster-skuld.', check: () => state.raidsCompleted >= 1 && !state.hasDebt }
];

function checkAchievements() {
    ACHIEVEMENT_LIST.forEach(ach => {
        const key = `ach_${ach.id}`;
        if (ach.check() && !state[key]) {
            state[key] = true;
            notif(`PRESTIGE UNLOCKED: "${ach.title}"`, 'success');
            loadAchievements();
            
            // Check prestige stars based on achievement count!
            let completedCount = ACHIEVEMENT_LIST.filter(a => state[`ach_${a.id}`]).length;
            if (completedCount >= 1) state.stars.bronze = true;
            if (completedCount >= 2) state.stars.silver = true;
            if (completedCount >= 3) state.stars.gold = true;
            if (completedCount >= 4) state.stars.platinum = true;
            
            updateHUD();
        }
    });
}

function loadAchievements() {
    const holder = document.getElementById('achievements-holder');
    holder.innerHTML = '';
    
    ACHIEVEMENT_LIST.forEach(ach => {
        const isUnlocked = state[`ach_${ach.id}`];
        const item = document.createElement('div');
        item.className = 'achievement-item';
        if (isUnlocked) {
            item.innerHTML = `
                <i class="fa-solid fa-award ach-icon"></i>
                <div class="ach-info">
                    <h5>${ach.title}</h5>
                    <p>${ach.desc}</p>
                </div>
            `;
        } else {
            item.innerHTML = `
                <i class="fa-solid fa-lock ach-icon" style="opacity: 0.3;"></i>
                <div class="ach-info" style="opacity: 0.5;">
                    <h5>LÅST PRESTIGE</h5>
                    <p>${ach.desc}</p>
                </div>
            `;
        }
        holder.appendChild(item);
    });
}

// Simple CSS Confetti on level up
function triggerConfetti() {
    for (let i = 0; i < 40; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.width = '10px';
        conf.style.height = '10px';
        conf.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        conf.style.top = '-10px';
        conf.style.left = `${Math.random() * 100}vw`;
        conf.style.transform = `rotate(${Math.random() * 360}deg)`;
        conf.style.zIndex = '9999';
        conf.style.borderRadius = '50%';
        conf.style.pointerEvents = 'none';
        
        document.body.appendChild(conf);
        
        const duration = 2 + Math.random() * 3;
        conf.animate([
            { top: '-10px', transform: 'rotate(0deg) translateX(0)' },
            { top: '110vh', transform: `rotate(720deg) translateX(${Math.random() * 100 - 50}px)` }
        ], {
            duration: duration * 1000,
            easing: 'linear'
        });
        
        setTimeout(() => conf.remove(), duration * 1000);
    }
}

// ==========================================
// 4. TAB NAVIGATION CORE
// ==========================================
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        // UI tabs switch
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
        
        // Specific tab updates
        if (tab === 'codex') {
            setTimeout(renderSkillTree, 50); // Dynamic render and redraw
            setTimeout(() => {
                const viewport = document.getElementById('skill-tree-viewport');
                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight;
                }
            }, 80);
        } else if (tab === 'syndicate') {
            renderCrewList();
            updateSyndicateUI();
        }
    });
});

// ==========================================
// 5. FOCUS AUDIO SYNTH ENGINE (WEB AUDIO API)
// ==========================================
let audioCtx = null;
let carrierOscL = null;
let carrierOscR = null;
let binauralGain = null;
let rainNoiseNode = null;
let rainGain = null;
let isSynthPlaying = false;

function initSynth() {
    if (audioCtx) return;
    
    // Cross-browser AudioContext
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // BINAURAL GENERATOR (40Hz / 8Hz binaural beat)
    binauralGain = audioCtx.createGain();
    binauralGain.gain.value = parseFloat(document.getElementById('synth-vol').value);
    
    // Create stereo channel merger
    const merger = audioCtx.createChannelMerger(2);
    
    carrierOscL = audioCtx.createOscillator();
    carrierOscR = audioCtx.createOscillator();
    
    // Setup frequencies
    setBinauralFreq(40); // Default ultra focus
    
    // Route L and R oscillators to corresponding stereo ears
    const lGain = audioCtx.createGain();
    const rGain = audioCtx.createGain();
    
    carrierOscL.connect(lGain).connect(merger, 0, 0);
    carrierOscR.connect(rGain).connect(merger, 0, 1);
    
    merger.connect(binauralGain).connect(audioCtx.destination);
    
    carrierOscL.start();
    carrierOscR.start();
    
    // PROCEDURAL RAIN GENERATOR (White Noise Buffer)
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // White noise values
    }
    
    rainNoiseNode = audioCtx.createBufferSource();
    rainNoiseNode.buffer = noiseBuffer;
    rainNoiseNode.loop = true;
    
    // Add lowpass filter to white noise to simulate soft rain
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // soft rain filter
    
    rainGain = audioCtx.createGain();
    rainGain.gain.value = parseFloat(document.getElementById('rain-vol').value);
    
    rainNoiseNode.connect(filter).connect(rainGain).connect(audioCtx.destination);
    rainNoiseNode.start();
}

function setBinauralFreq(freq) {
    if (!audioCtx) return;
    const carrier = 200; // Base carrier pitch
    carrierOscL.frequency.setValueAtTime(carrier, audioCtx.currentTime);
    carrierOscR.frequency.setValueAtTime(carrier + freq, audioCtx.currentTime);
}

document.getElementById('synth-btn').addEventListener('click', function() {
    if (!isSynthPlaying) {
        initSynth();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        binauralGain.gain.setValueAtTime(parseFloat(document.getElementById('synth-vol').value), audioCtx.currentTime);
        rainGain.gain.setValueAtTime(parseFloat(document.getElementById('rain-vol').value), audioCtx.currentTime);
        
        this.innerHTML = '<i class="fa-solid fa-stop"></i> STOP';
        this.classList.add('active');
        isSynthPlaying = true;
        notif('Focus Synth aktiverad.', 'success');
    } else {
        binauralGain.gain.setValueAtTime(0, audioCtx.currentTime);
        rainGain.gain.setValueAtTime(0, audioCtx.currentTime);
        
        this.innerHTML = '<i class="fa-solid fa-play"></i> START';
        this.classList.remove('active');
        isSynthPlaying = false;
        notif('Focus Synth stoppad.', 'info');
    }
});

// Sound frequency toggle buttons
document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const freq = parseInt(this.getAttribute('data-freq'));
        
        if (audioCtx) {
            setBinauralFreq(freq);
        }
        notif(`Binaurala vågor inställda på ${freq} Hz.`, 'info');
    });
});

// Volume adjustments
document.getElementById('synth-vol').addEventListener('input', function() {
    if (audioCtx && isSynthPlaying) {
        binauralGain.gain.setValueAtTime(parseFloat(this.value), audioCtx.currentTime);
    }
});

document.getElementById('rain-vol').addEventListener('input', function() {
    if (audioCtx && isSynthPlaying) {
        rainGain.gain.setValueAtTime(parseFloat(this.value), audioCtx.currentTime);
    }
});

// ==========================================
// 6. THE CODEX SKILL TREE CONSTALLATIONS
// ==========================================
// ==========================================
// 6. THE CODEX SKILL TREE CONSTALLATIONS
// ==========================================
const SCHOOLS = {
    'start': {
        name: 'Start',
        icon: 'fa-rocket',
        nodes: {
            'start-1': {
                title: 'Börja Här: Python Print',
                desc: 'Välkommen till programmering! Kom igång genom att skriva din första Python print-sats.',
                cost: 0,
                questId: 'start-1',
                top: '92%', left: '50%', icon: 'fa-brands fa-python',
                track: 'start'
            }
        },
        links: []
    },
    'html': {
        name: 'HTML',
        icon: 'fa-code',
        nodes: {
            'html-1': {
                title: 'HTML I: Rubriker',
                desc: 'Lär dig strukturera din sida. Skapa en stor, lysande h1-rubrik.',
                cost: 30,
                questId: 'html-1',
                top: '80%', left: '35%', icon: 'fa-heading',
                track: 'html'
            },
            'html-2': {
                title: 'HTML II: Länkar',
                desc: 'Koppla samman cybersidor genom att skapa hyperlänkar med a-taggen.',
                cost: 50,
                questId: 'html-2',
                top: '63%', left: '30%', icon: 'fa-link',
                track: 'html'
            },
            'html-3': {
                title: 'HTML III: Bilder',
                desc: 'Bädda in bilder inuti ditt cyberspace med img-taggen.',
                cost: 70,
                questId: 'html-3',
                top: '46%', left: '25%', icon: 'fa-image',
                track: 'html'
            },
            'html-4': {
                title: 'HTML IV: Listor',
                desc: 'Sortera dina resurser i en ordnad ol-lista.',
                cost: 90,
                questId: 'html-4',
                top: '29%', left: '20%', icon: 'fa-list-ol',
                track: 'html'
            }
        },
        links: [['start-1', 'html-1'], ['html-1', 'html-2'], ['html-2', 'html-3'], ['html-3', 'html-4']]
    },
    'css': {
        name: 'CSS',
        icon: 'fa-wand-magic-sparkles',
        nodes: {
            'css-1': {
                title: 'CSS I: Färger',
                desc: 'Ge färg till din omgivning. Styla element med röd bakgrund.',
                cost: 50,
                questId: 'css-1',
                top: '73%', left: '20%', icon: 'fa-palette',
                track: 'css'
            },
            'css-2': {
                title: 'CSS II: Textstorlek',
                desc: 'Anpassa textens skala med font-size i din style-tagg.',
                cost: 70,
                questId: 'css-2',
                top: '56%', left: '15%', icon: 'fa-text-height',
                track: 'css'
            },
            'css-3': {
                title: 'CSS III: Kantlinjer',
                desc: 'Skapa skyddsramar runt dina element med border-egenskapen.',
                cost: 90,
                questId: 'css-3',
                top: '39%', left: '10%', icon: 'fa-square',
                track: 'css'
            },
            'css-4': {
                title: 'CSS IV: Inner-marginal',
                desc: 'Skapa luft och avstånd inuti dina block med padding.',
                cost: 110,
                questId: 'css-4',
                top: '22%', left: '5%', icon: 'fa-compress',
                track: 'css'
            }
        },
        links: [['html-1', 'css-1'], ['css-1', 'css-2'], ['css-2', 'css-3'], ['css-3', 'css-4']]
    },
    'js': {
        name: 'JavaScript',
        icon: 'fa-bolt-lightning',
        nodes: {
            'js-1': {
                title: 'JavaScript I: Utskrift',
                desc: 'Väck logiken till liv. Skapa din första returfunktion i en script-tagg.',
                cost: 40,
                questId: 'js-1',
                top: '80%', left: '65%', icon: 'fa-comment',
                track: 'js'
            },
            'js-2': {
                title: 'JavaScript II: Variabler',
                desc: 'Lär dig spara data i cyberspace genom att deklarera let-variabler.',
                cost: 60,
                questId: 'js-2',
                top: '63%', left: '70%', icon: 'fa-database',
                track: 'js'
            },
            'js-3': {
                title: 'JavaScript III: Funktioner',
                desc: 'Bygg matematiska formler som adderar och returnerar värden.',
                cost: 80,
                questId: 'js-3',
                top: '46%', left: '75%', icon: 'fa-plus',
                track: 'js'
            },
            'js-4': {
                title: 'JavaScript IV: Villkor',
                desc: 'Styr logiska flöden baserat på om tal är jämna eller udda.',
                cost: 100,
                questId: 'js-4',
                top: '29%', left: '80%', icon: 'fa-code-branch',
                track: 'js'
            }
        },
        links: [['start-1', 'js-1'], ['js-1', 'js-2'], ['js-2', 'js-3'], ['js-3', 'js-4']]
    },
    'python': {
        name: 'Python',
        icon: 'fa-brands fa-python',
        nodes: {
            'py-1': {
                title: 'Python I: Aritmetik',
                desc: 'Lär dig räkna med Python genom att skriva din första matematiska formel.',
                cost: 60,
                questId: 'py-1',
                top: '73%', left: '80%', icon: 'fa-calculator',
                track: 'python'
            },
            'py-2': {
                title: 'Python II: Variabler',
                desc: 'Deklarera enkla tal-tilldelningar direkt i din Python-kod.',
                cost: 80,
                questId: 'py-2',
                top: '56%', left: '85%', icon: 'fa-calculator',
                track: 'python'
            },
            'py-3': {
                title: 'Python III: Kommentarer',
                desc: 'Skriv dokumenterande kommentarer med #-tecknet i Python.',
                cost: 100,
                questId: 'py-3',
                top: '39%', left: '90%', icon: 'fa-hashtag',
                track: 'python'
            },
            'py-4': {
                title: 'Python IV: Definitioner',
                desc: 'Skapa återanvändbara funktioner med def-nyckelordet.',
                cost: 120,
                questId: 'py-4',
                top: '22%', left: '95%', icon: 'fa-gears',
                track: 'python'
            }
        },
        links: [['js-1', 'py-1'], ['py-1', 'py-2'], ['py-2', 'py-3'], ['py-3', 'py-4']]
    },
    'json': {
        name: 'JSON',
        icon: 'fa-network-wired',
        nodes: {
            'json-1': {
                title: 'JSON I: Strängar',
                desc: 'Lär dig spara strukturerad telemetri med enkla textnycklar.',
                cost: 50,
                questId: 'json-1',
                top: '75%', left: '50%', icon: 'fa-font',
                track: 'json'
            },
            'json-2': {
                title: 'JSON II: Siffror',
                desc: 'Spara numerisk spelardata i ditt JSON-objekt.',
                cost: 70,
                questId: 'json-2',
                top: '55%', left: '50%', icon: 'fa-arrow-up-9-1',
                track: 'json'
            },
            'json-3': {
                title: 'JSON III: Listor',
                desc: 'Organisera samlingar av data med JSON-arrayer.',
                cost: 90,
                questId: 'json-3',
                top: '35%', left: '50%', icon: 'fa-brackets-square',
                track: 'json'
            }
        },
        links: [['start-1', 'json-1'], ['json-1', 'json-2'], ['json-2', 'json-3']]
    }
};

let selectedNodeId = 'start-1';

function getSkillNode(nodeId) {
    for (const schoolId in SCHOOLS) {
        if (SCHOOLS[schoolId].nodes[nodeId]) {
            return SCHOOLS[schoolId].nodes[nodeId];
        }
    }
    return null;
}

function renderSkillTree() {
    const scrollContainer = document.getElementById('skill-tree-scroll');
    if (!scrollContainer) return;
    
    // Remove existing nodes (keep only the canvas)
    document.querySelectorAll('.skill-node').forEach(node => node.remove());
    
    // Render all tracks and all their nodes on the unified star map
    for (const schoolId in SCHOOLS) {
        const school = SCHOOLS[schoolId];
        for (const nodeId in school.nodes) {
            const nodeData = school.nodes[nodeId];
            const isUnlocked = state.unlockedNodes.includes(nodeId);
            const isActive = selectedNodeId === nodeId;
            
            let stateClass = 'locked';
            if (isUnlocked) {
                stateClass = 'unlocked';
            }
            if (isActive) {
                stateClass = 'active';
            }
            
            const trackClass = nodeData.track ? `track-${nodeData.track}` : '';
            
            const nodeEl = document.createElement('div');
            nodeEl.className = `skill-node ${stateClass} ${trackClass}`;
            nodeEl.setAttribute('data-node', nodeId);
            nodeEl.style.top = nodeData.top;
            nodeEl.style.left = nodeData.left;
            
            nodeEl.innerHTML = `
                <div class="node-icon"><i class="fa-solid ${nodeData.icon}"></i></div>
                <span class="node-label">${nodeData.title}</span>
            `;
            
            // Add click listener
            nodeEl.addEventListener('click', function() {
                selectNode(nodeId);
            });
            
            scrollContainer.appendChild(nodeEl);
        }
    }
    
    // Redraw connections
    drawTreeConnections();
}

function selectNode(nodeId) {
    selectedNodeId = nodeId;
    const node = getSkillNode(nodeId);
    const details = document.getElementById('node-details');
    if (!node) return;
    
    const isUnlocked = state.unlockedNodes.includes(nodeId);
    
    // Inter-school and intra-school unlock dependencies
    const parentMap = {
        'start-1': [],
        'html-1': ['start-1'],
        'html-2': ['html-1'],
        'html-3': ['html-2'],
        'html-4': ['html-3'],
        
        'css-1': ['html-1'],
        'css-2': ['css-1'],
        'css-3': ['css-2'],
        'css-4': ['css-3'],
        
        'js-1': ['start-1'],
        'js-2': ['js-1'],
        'js-3': ['js-2'],
        'js-4': ['js-3'],
        
        'py-1': ['js-1'],
        'py-2': ['py-1'],
        'py-3': ['py-2'],
        'py-4': ['py-3'],
        
        'json-1': ['start-1'],
        'json-2': ['json-1'],
        'json-3': ['json-2']
    };

    let canUnlock = false;
    let lockReason = '';

    if (nodeId === 'start-1') {
        canUnlock = true;
    } else {
        const parents = parentMap[nodeId] || [];
        const hasUnlockedParent = parents.some(p => state.unlockedNodes.includes(p));
        
        if (!hasUnlockedParent) {
            lockReason = 'Kräver minst en ansluten upplåst spell.';
        } else if (state.gold < node.cost) {
            lockReason = `Inte tillräckligt med Guld (Kräver ${node.cost} G).`;
        } else {
            canUnlock = true;
        }
    }
    
    let btnHtml = '';
    if (isUnlocked) {
        if (node.questId) {
            btnHtml = `<button class="node-start-btn" onclick="startQuest('${node.questId}')">STARTA QUEST I COLOSSEUM</button>`;
        } else {
            btnHtml = `<p class="text-green" style="font-weight:bold;margin-top:10px;"><i class="fa-solid fa-circle-check"></i> Spell fullt inlärd!</p>`;
        }
    } else {
        if (canUnlock) {
            btnHtml = `<button class="node-start-btn" onclick="unlockNode('${nodeId}')">LÅS UPP SPELL (${node.cost} GOLD)</button>`;
        } else {
            btnHtml = `<button class="node-start-btn" disabled style="background:#444;box-shadow:none;">LÅST: ${lockReason}</button>`;
        }
    }
    
    details.innerHTML = `
        <h3><i class="fa-solid fa-book-sparkles"></i> ${node.title}</h3>
        <p>${node.desc}</p>
        ${btnHtml}
    `;
    
    // Highlight node border
    document.querySelectorAll('.skill-node').forEach(n => {
        n.classList.remove('selected');
        const id = n.getAttribute('data-node');
        if (state.unlockedNodes.includes(id)) {
            n.className = 'skill-node unlocked';
        } else {
            n.className = 'skill-node locked';
        }
    });
    
    const activeEl = document.querySelector(`[data-node="${nodeId}"]`);
    if (activeEl) {
        activeEl.classList.add('active');
        activeEl.classList.remove('locked');
    }
}

function unlockNode(nodeId) {
    const node = getSkillNode(nodeId);
    if (!node) return;
    if (state.gold >= node.cost) {
        state.gold -= node.cost;
        state.unlockedNodes.push(nodeId);
        notif(`SPELL UNLOCKED: ${node.title}!`, 'success');
        updateHUD();
        saveGame();
        
        // Re-render and select
        renderSkillTree();
        selectNode(nodeId);
    }
}

function startQuest(questId) {
    const q = QUESTS.find(x => x.id === questId);
    if (q) {
        activeQuest = q;
        isEditorModified = false;
        isArenaActive = false; // Solo training mode
        isBossMatch = false;
        
        // Hide opponent HUD elements and display buster hints
        document.getElementById('hud-match-opponent').style.display = 'none';
        document.getElementById('hud-match-vs').style.display = 'none';
        document.getElementById('ask-buster-trigger').style.display = 'inline-block';
        
        // Configure exit button text for training
        document.getElementById('exit-match-btn').innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> TILLBAKA TILL LOBBY';
        
        document.getElementById('quest-title').innerHTML = `<i class="fa-solid fa-scroll"></i> ${q.title}`;
        document.getElementById('quest-description').innerText = q.desc;
        document.getElementById('quest-reward').innerText = `+${q.rewardXp} XP / +${q.rewardGold} GOLD`;
        document.getElementById('code-input').value = q.defaultCode;
        
        // Toggle view from lobby to match
        document.getElementById('arena-lobby-view').style.display = 'none';
        document.getElementById('arena-match-view').style.display = 'block';
        
        // Auto trigger iframe build with default code
        updateSandboxPreview();
        
        // Go to Colosseum Tab
        document.querySelector('[data-tab="colosseum"]').click();
        notif(`Quest laddad i arenan.`, 'info');
    }
}

// Canvas connection rendering for retro Skill Tree stars
function drawTreeConnections() {
    const canvas = document.getElementById('tree-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const map = document.getElementById('skill-tree-scroll');
    
    // Sync canvas sizing
    canvas.width = map.offsetWidth;
    canvas.height = map.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Static Cyber stars backdrop
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.shadowBlur = 0;
    for (let i = 0; i < 45; i++) {
        const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
        const sy = (Math.cos(i * 567.89) * 0.5 + 0.5) * canvas.height;
        const sSize = (Math.sin(i * 999) * 0.5 + 0.5) * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // 2. Draw soft center nebula
    const nebula = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 30, canvas.width / 2, canvas.height / 2, 200);
    nebula.addColorStop(0, 'rgba(176, 38, 255, 0.05)');
    nebula.addColorStop(0.5, 'rgba(0, 242, 254, 0.02)');
    nebula.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all links from all fanning tracks
    for (const schoolId in SCHOOLS) {
        const school = SCHOOLS[schoolId];
        const links = school.links || [];
        
        links.forEach(([fromId, toId]) => {
            const fromEl = document.querySelector(`[data-node="${fromId}"]`);
            const toEl = document.querySelector(`[data-node="${toId}"]`);
            
            if (fromEl && toEl) {
                const x1 = fromEl.offsetLeft;
                const y1 = fromEl.offsetTop;
                const x2 = toEl.offsetLeft;
                const y2 = toEl.offsetTop;
                
                const isUnlocked = state.unlockedNodes.includes(fromId) && state.unlockedNodes.includes(toId);
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                
                if (isUnlocked) {
                    // Color code connection lines based on track type!
                    let trackColor = '#00f2fe';
                    if (schoolId === 'html') trackColor = '#ff9100';
                    else if (schoolId === 'css') trackColor = '#ff007f';
                    else if (schoolId === 'js') trackColor = '#ffd700';
                    else if (schoolId === 'python') trackColor = '#00f2fe';
                    else if (schoolId === 'json') trackColor = '#b026ff';
                    
                    const flowGrad = ctx.createLinearGradient(x1, y1, x2, y2);
                    flowGrad.addColorStop(0, trackColor);
                    flowGrad.addColorStop(1, '#00f2fe'); // Energy flows into bright neon cyan
                    
                    ctx.strokeStyle = flowGrad;
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = trackColor;
                    ctx.shadowBlur = 10;
                } else {
                    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                    ctx.lineWidth = 1;
                    ctx.shadowBlur = 0;
                }
                ctx.stroke();
            }
        });
    }
}

window.addEventListener('resize', drawTreeConnections);

// ==========================================
// 7. TAB: COLOSSEUM CORE SANDBOX & TESTER
// ==========================================
const codeArea = document.getElementById('code-input');
const sandboxIframe = document.getElementById('sandbox-iframe');

// Auto preview renderer on input and auto-vanishing placeholder comments
codeArea.addEventListener('input', (e) => {
    if (!isEditorModified) {
        isEditorModified = true;
        
        const start = codeArea.selectionStart;
        const textBefore = codeArea.value.substring(0, start);
        const strippedBefore = textBefore.replace(/<!--[\s\S]*?-->\n?/g, '');
        const newPos = strippedBefore.length;
        
        codeArea.value = codeArea.value.replace(/<!--[\s\S]*?-->\n?/g, '');
        codeArea.selectionStart = codeArea.selectionEnd = newPos;
    }
    
    // Calculate user progress percentage
    if (isArenaActive) {
        const len = codeArea.value.length;
        const targetLen = activeQuest.snippet.length;
        const userPct = Math.min(95, Math.floor((len / targetLen) * 100)); // cap at 95% until successful test pass!
        document.getElementById('player-match-progress').style.width = `${userPct}%`;
    }
    
    updateSandboxPreview();
});

function updateSandboxPreview() {
    const code = codeArea.value;
    const doc = sandboxIframe.contentDocument || sandboxIframe.contentWindow.document;
    
    // Inject clean styling framework for preview buttons to match glass look
    const styleInject = `
        <style>
            body {
                font-family: 'Segoe UI', system-ui, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: #0b0f19;
                color: #fff;
            }
            #magic-btn {
                background: linear-gradient(135deg, #00f2fe, #b026ff);
                border: none;
                color: #fff;
                font-size: 1.1rem;
                padding: 12px 28px;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);
                transition: transform 0.2s ease;
            }
            #magic-btn:active {
                transform: scale(0.95);
            }
        </style>
    `;
    
    doc.open();
    // Inject code + clean layout helper
    if (activeQuest.id === 'html-1') {
        doc.write(code + styleInject.replace('background: linear-gradient(135deg, #00f2fe, #b026ff);', 'background: #333;'));
    } else {
        doc.write(code + styleInject);
    }
    doc.close();
}

// Reset Quest code editor
document.getElementById('reset-code-btn').addEventListener('click', () => {
    isEditorModified = false;
    codeArea.value = activeQuest.defaultCode;
    updateSandboxPreview();
    notif('Editor rensad.', 'info');
});

// Run Code Tester
document.getElementById('run-code-btn').addEventListener('click', () => {
    if (state.syndicate && state.syndicate.activeMission) {
        addSyndicateSync(5, 'Kodtest körning');
    }
    const listHolder = document.getElementById('test-list-holder');
    listHolder.innerHTML = '';
    
    notif('Kör kodkontroll...', 'info');
    
    setTimeout(() => {
        const result = activeQuest.validate(sandboxIframe);
        
        const item = document.createElement('li');
        item.className = result.pass ? 'test-item pass' : 'test-item fail';
        
        if (result.pass) {
            item.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${result.msg}`;
            listHolder.appendChild(item);
            
            // Intercept victory for active Arena matches
            if (isArenaActive) {
                handleMatchWin();
                return;
            }
            
            // Success rewards trigger (Solo training mode)
            if (!state.completedQuests.includes(activeQuest.id)) {
                state.completedQuests.push(activeQuest.id);
                gainRewards(activeQuest.rewardXp, activeQuest.rewardGold, activeQuest.statReward);
                notif('SPELL LYCKAD! Quest avklarad!', 'success');
            } else {
                notif('Spell fungerar, men du har redan löst denna Quest förut.', 'info');
            }
        } else {
            item.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${result.msg}`;
            listHolder.appendChild(item);
            notif('Kontrollen misslyckades. Leta efter buggar!', 'error');
        }
    }, 600);
});

// ==========================================
// 8. TAB: BLACK MARKET ACTIONS
// ==========================================
const busterText = document.getElementById('buster-text');

document.getElementById('loan-btn').addEventListener('click', () => {
    if (state.hasDebt) {
        busterDialogue("Du har redan en aktiv skuld till mig! Betala tillbaka den först innan du tigger om mer...");
        return;
    }
    
    state.gold += 50;
    state.hasDebt = true;
    busterDialogue("Här har du 50 Guld, kompis. Kom ihåg att jag tar 50% av all din intjänade XP tills du betalar tillbaka min skuld på 60 Guld. Lycka till! Hehe.");
    notif('Dopamin-lån tagit! 50% XP tax är aktiv.', 'error');
    updateHUD();
    saveGame();
});

document.getElementById('pay-debt-btn').addEventListener('click', () => {
    if (state.gold < 60) {
        busterDialogue("Du har inte 60 Guld! Försök inte lura mig, cyber-tjuv. Gå och koda lite till.");
        return;
    }
    
    state.gold -= 60;
    state.hasDebt = false;
    state.raidsCompleted += 1; // Completed a safe debt pay
    busterDialogue("Perfekt! Din skuld är avbetald. Du är en ärlig kodare. Nu är du fri att samla XP igen.");
    notif('Skuld avbetald! Din XP tax är borttagen.', 'success');
    updateHUD();
    saveGame();
});

function busterDialogue(text) {
    const el = document.getElementById('buster-text');
    el.innerHTML = '';
    
    // Typewriter effect
    let i = 0;
    function type() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 15);
        }
    }
    type();
}

// Purchase logic for themes and boxes
document.querySelectorAll('.shop-buy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const item = this.getAttribute('data-item');
        const price = parseInt(this.getAttribute('data-price'));
        
        // Redirect non-premium VIP item purchases to preview modal
        if (!isUserPremium() && ['theme-matrix-rain', 'theme-companion', 'theme-neural-booster'].includes(item)) {
            openVipPreview(item);
            return;
        }

        if (item.startsWith('theme-')) {
            state.purchasedThemes = state.purchasedThemes || ['theme-default'];
            
            // 1. Check for VIP unique items
            if (item === 'theme-matrix-rain') {
                if (state.purchasedThemes.includes(item)) {
                    state.matrixRainActive = !state.matrixRainActive;
                    if (state.matrixRainActive) {
                        document.body.classList.add('matrix-rain-active');
                        initMatrixRain();
                        busterDialogue("Koder regnar nu i bakgrunden... Känner du systemets digitala flöde?");
                        notif('Matrix-regn aktiverat.', 'success');
                    } else {
                        document.body.classList.remove('matrix-rain-active');
                        busterDialogue("Matrix-kodregn inaktiverat. Bakgrunden återställd.");
                        notif('Matrix-regn avstängt.', 'info');
                    }
                    refreshThemeStoreButtons();
                    saveGame();
                    return;
                }
                
                // Purchase Matrix rain
                if (state.gold < price) {
                    busterDialogue("Du har inte tillräckligt med guld! VIP-kodregn kräver resurser.");
                    return;
                }
                state.gold -= price;
                state.purchasedThemes.push(item);
                state.matrixRainActive = true;
                document.body.classList.add('matrix-rain-active');
                initMatrixRain();
                
                busterDialogue("HEMLIG KÄLLKOD INLÄST! Matrix-kodregnet faller nu live i din bakgrund.");
                notif('Matrix-regn upplåst!', 'success');
                refreshThemeStoreButtons();
                updateHUD();
                saveGame();
                return;
            }
            
            if (item === 'theme-companion') {
                if (state.purchasedThemes.includes(item)) {
                    state.companionActive = !state.companionActive;
                    if (state.companionActive) {
                        initCyberCompanion();
                        busterDialogue("Nano-Buster V3 har svävat in på skärmen! Säg hej!");
                        notif('Companion aktiverat.', 'success');
                    } else {
                        const petContainer = document.getElementById('cyber-pet-container');
                        if (petContainer) petContainer.classList.add('hidden');
                        busterDialogue("Nano-Buster V3 har lagts i standbyläge.");
                        notif('Companion avstängt.', 'info');
                    }
                    refreshThemeStoreButtons();
                    saveGame();
                    return;
                }
                
                // Purchase Companion
                if (state.gold < price) {
                    busterDialogue("Du har inte tillräckligt med guld! Nano-Buster V3 kräver en stark processor.");
                    return;
                }
                state.gold -= price;
                state.purchasedThemes.push(item);
                state.companionActive = true;
                initCyberCompanion();
                
                busterDialogue("COMPANION DRIFTKLAR! Nano-Buster V3 svävar nu i din HUD för att stätta dig!");
                notif('Companion upplåst!', 'success');
                refreshThemeStoreButtons();
                updateHUD();
                saveGame();
                return;
            }
            
            if (item === 'theme-neural-booster') {
                if (state.purchasedThemes.includes(item)) {
                    busterDialogue("Din neurala överklockare är redan installerad i din hjärnbark och aktiv!");
                    return;
                }
                
                // Purchase Neural Booster
                if (state.gold < price) {
                    busterDialogue("Du har inte tillräckligt med guld för neural överklockning!");
                    return;
                }
                state.gold -= price;
                state.purchasedThemes.push(item);
                state.neuralXpMultiplier = 1.3333333333333333; // 1.5 * 1.333 = 2.0x permanent
                
                busterDialogue("NEURAL OVERCLOCKING COMPLETED! XP-multiplikatorn är nu maxad till DUBBEL XP (2.0x permanent)!");
                notif('Neural Overclock upplåst!', 'success');
                refreshThemeStoreButtons();
                updateHUD();
                saveGame();
                return;
            }

            // 1. If already purchased, toggle active
            if (state.purchasedThemes.includes(item)) {
                state.theme = item;
                document.body.className = state.theme + (state.crtActive ? ' crt-active' : '');
                
                let themeName = "Default Cyber";
                if (item === 'theme-matrix') themeName = "Matrix Neon";
                else if (item === 'theme-vaporwave') themeName = "Vaporwave Dream";
                else if (item === 'theme-oled') themeName = "Deep Space OLED";
                else if (item === 'theme-toxic') themeName = "Toxic Amber";
                
                busterDialogue(`Temat "${themeName}" har aktiverats!`);
                notif('Tema aktiverat.', 'success');
                refreshThemeStoreButtons();
                saveGame();
                drawTreeConnections(); // Redraw canvas lines for color update!
                return;
            }
            
            // 2. If not purchased, attempt buy
            if (state.gold < price) {
                busterDialogue("Du har inte tillräckligt med guld! Sälj lite kod på gatan först...");
                return;
            }
            
            state.gold -= price;
            state.purchasedThemes.push(item);
            state.theme = item;
            document.body.className = state.theme + (state.crtActive ? ' crt-active' : '');
            
            let themeName = "Default Cyber";
            if (item === 'theme-matrix') themeName = "Matrix Neon";
            else if (item === 'theme-vaporwave') themeName = "Vaporwave Dream";
            else if (item === 'theme-oled') themeName = "Deep Space OLED";
            else if (item === 'theme-toxic') themeName = "Toxic Amber";
            
            busterDialogue(`Grattis! Du har låst upp och aktiverat temat: ${themeName}!`);
            notif('Tema upplåst och aktiverat.', 'success');
            refreshThemeStoreButtons();
            updateHUD();
            saveGame();
            drawTreeConnections(); // Redraw canvas for colors!
            return;
        }
        
        // Box/lootbox purchase remains normal
        if (state.gold < price) {
            busterDialogue("Du har inte tillräckligt med guld! Sälj lite kod på gatan först...");
            return;
        }
        
        state.gold -= price;
        
        if (item === 'lootbox') {
            const rewardRoll = Math.random();
            if (rewardRoll < 0.4) {
                // Drop gold
                state.gold += 120;
                busterDialogue("Lootboxen öppnades: Du vann en stor säck med 120 Guld! Snacka om tur!");
                notif('Vann 120 Guld!', 'success');
            } else if (rewardRoll < 0.8) {
                // Drop XP
                gainRewards(150, 0, null);
                busterDialogue("Lootboxen öppnades: En magisk energidryck! +150 XP har adderats till din karaktär.");
            } else {
                // Drop rare prestige star
                state.stars.diamond = true;
                busterDialogue("HELT OTROLIGT! Du hittade en sällsynt DIAMOND PRESTIGE STAR i kistan! Den glänser vackert på ditt HUD.");
                notif('Hittade DIAMOND STAR!', 'success');
            }
        }
        
        updateHUD();
        saveGame();
        drawTreeConnections(); // Redraw canvas lines for color update!
    });
});

// ==========================================
// 9. DOPAMINE REDIRECTOR MODAL (THE SHIELD)
// ==========================================
const urgeModal = document.getElementById('urge-modal');

document.getElementById('urge-trigger').addEventListener('click', () => {
    urgeModal.classList.add('active');
    initGravityVoid(); // Fire canvas engine
});

document.getElementById('close-urge-modal').addEventListener('click', () => {
    urgeModal.classList.remove('active');
    stopReflexGame();
});

// Modal redirection tab navigation
document.querySelectorAll('.redir-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const target = this.getAttribute('data-redir');
        
        document.querySelectorAll('.redir-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.redir-section').forEach(s => s.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(`redir-${target}`).classList.add('active');
        
        stopReflexGame();
        
        if (target === 'breath') {
            runBreathingCore();
        }
    });
});

// REDIR 1: INTERACTIVE GRAVITY VOID CANVAS
let canvas = document.getElementById('gravity-canvas');
let ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null, active: false };

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
});

canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = Math.random() * 2 + 1;
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 70%)`; // Blue/Cyan neon hues
    }
    
    update() {
        if (mouse.active) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 150) {
                // Gravity attraction formulas
                const force = (150 - dist) / 1200;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }
        
        // Speed dampener
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounds checking
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
    }
}

function initGravityVoid() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 180;
    
    particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        if (!urgeModal.classList.contains('active')) return;
        
        ctx.fillStyle = 'rgba(2, 3, 6, 0.2)'; // trail effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    animate();
}

// REDIR 2: VISUAL BREATHING CORE PACER
let breathInterval = null;
function runBreathingCore() {
    if (breathInterval) clearInterval(breathInterval);
    
    const node = document.getElementById('breath-node');
    const text = document.getElementById('breath-instruction');
    
    let step = 0;
    
    function cycle() {
        if (step === 0) {
            // Breathe in
            node.style.width = '140px';
            node.style.height = '140px';
            node.style.backgroundColor = 'rgba(0, 242, 254, 0.4)';
            text.innerText = 'ANDAS IN...';
            step = 1;
        } else if (step === 1) {
            // Hold
            text.innerText = 'HÅLL ANDAN...';
            step = 2;
        } else {
            // Breathe out
            node.style.width = '60px';
            node.style.height = '60px';
            node.style.backgroundColor = 'rgba(0, 242, 254, 0.15)';
            text.innerText = 'ANDAS UT...';
            step = 0;
        }
    }
    
    cycle();
    breathInterval = setInterval(cycle, 4000); // 4 seconds breathe-in / 4 seconds breathe-out
}

// REDIR 3: REFLEX RUSH SPEED ARCADE
let reflexTimerInterval = null;
let reflexScore = 0;
let reflexTimeLeft = 20;
let isReflexGameRunning = false;

const reflexBoard = document.getElementById('reflex-board');
const startReflexBtn = document.getElementById('start-reflex-btn');
const reflexScoreHud = document.getElementById('reflex-score-hud');

startReflexBtn.addEventListener('click', startReflexGame);

function startReflexGame() {
    startReflexBtn.style.display = 'none';
    reflexScoreHud.style.display = 'block';
    
    reflexScore = 0;
    reflexTimeLeft = 20;
    isReflexGameRunning = true;
    
    document.getElementById('reflex-score').innerText = reflexScore;
    document.getElementById('reflex-timer').innerText = reflexTimeLeft;
    
    spawnReflexTarget();
    
    reflexTimerInterval = setInterval(() => {
        reflexTimeLeft--;
        document.getElementById('reflex-timer').innerText = reflexTimeLeft;
        
        if (reflexTimeLeft <= 0) {
            endReflexGame();
        }
    }, 1000);
}

function spawnReflexTarget() {
    if (!isReflexGameRunning || !urgeModal.classList.contains('active')) return;
    
    // Remove existing dots
    const existing = reflexBoard.querySelector('.target-dot');
    if (existing) existing.remove();
    
    const dot = document.createElement('div');
    dot.className = 'target-dot';
    
    // Random placement
    const pad = 40;
    const maxX = reflexBoard.offsetWidth - pad;
    const maxY = reflexBoard.offsetHeight - pad;
    
    const rx = Math.random() * (maxX - pad) + pad;
    const ry = Math.random() * (maxY - pad) + pad;
    
    dot.style.left = `${rx}px`;
    dot.style.top = `${ry}px`;
    
    dot.addEventListener('click', function(e) {
        e.stopPropagation();
        reflexScore++;
        document.getElementById('reflex-score').innerText = reflexScore;
        
        // Spawn next dot
        spawnReflexTarget();
    });
    
    reflexBoard.appendChild(dot);
}

function endReflexGame() {
    stopReflexGame();
    
    if (reflexScore >= 15) {
        state.gold += 10;
        state.goldEarnedTotal += 10;
        busterDialogue(`Snyggt spelat! Du fick 15+ träffar. Här har du en bonus på 10 Guld. Fortsätt kämpa!`);
        notif('Vann 10 Guld i Reflex Rush!', 'success');
        updateHUD();
        saveGame();
    } else {
        busterDialogue(`Du fick bara ${reflexScore} poäng. Du behöver 15 poäng för att tjäna guld. Försök igen!`);
        notif(`Spel slut. Poäng: ${reflexScore}.`, 'info');
    }
}

function stopReflexGame() {
    isReflexGameRunning = false;
    if (reflexTimerInterval) clearInterval(reflexTimerInterval);
    if (breathInterval) clearInterval(breathInterval);
    
    const existing = reflexBoard.querySelector('.target-dot');
    if (existing) existing.remove();
    
    startReflexBtn.style.display = 'block';
    reflexScoreHud.style.display = 'none';
}

// Give Up & Scroll social media penalty
document.getElementById('break-shield-trigger').addEventListener('click', () => {
    state.xp = Math.max(0, state.xp - 50); // Lose 50 XP
    notif('SKÖLD BRUTEN! Du gav upp och förlorade -50 XP.', 'error');
    
    // Reset stars
    state.stars.diamond = false;
    
    urgeModal.classList.remove('active');
    stopReflexGame();
    updateHUD();
    saveGame();
    
    busterDialogue("Du gav vika för scroll-monstret... Jag gillar din svaghet (ger mig mer ränta!), men ditt kognitiva rykte har tagit skada. Tillbaka till smedjan!");
});

// ==========================================
// 10. LEARNING AIDS: MAGIBOKEN & BUSTER HINTS
// ==========================================
function updateMagibokenSnippets() {
    const menu = document.getElementById('magiboken-menu');
    if (!menu) return;
    menu.innerHTML = '';
    
    QUESTS.forEach(q => {
        const isUnlocked = state.unlockedNodes.includes(q.id);
        
        const btn = document.createElement('button');
        btn.type = 'button';
        if (isUnlocked) {
            btn.className = 'snippet-item';
            btn.innerHTML = `<i class="fa-solid fa-code-commit"></i> ${q.title.split(': ')[1]}`;
            btn.onclick = (e) => {
                e.stopPropagation();
                insertSnippet(q.id);
            };
        } else {
            btn.className = 'snippet-item locked';
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-lock"></i> Låst Spell`;
        }
        menu.appendChild(btn);
    });
}

function insertSnippet(questId) {
    const q = QUESTS.find(x => x.id === questId);
    if (!q || !q.snippet) return;
    
    const editor = document.getElementById('code-input');
    let text = editor.value;
    let start = editor.selectionStart;
    let end = editor.selectionEnd;
    
    if (!isEditorModified) {
        isEditorModified = true;
        
        const textBefore = text.substring(0, start);
        const strippedBefore = textBefore.replace(/<!--[\s\S]*?-->\n?/g, '');
        start = strippedBefore.length;
        
        const textBeforeEnd = text.substring(0, end);
        const strippedBeforeEnd = textBeforeEnd.replace(/<!--[\s\S]*?-->\n?/g, '');
        end = strippedBeforeEnd.length;
        
        text = text.replace(/<!--[\s\S]*?-->\n?/g, '');
    }
    
    editor.value = text.substring(0, start) + q.snippet + text.substring(end);
    editor.focus();
    editor.selectionStart = editor.selectionEnd = start + q.snippet.length;
    
    updateSandboxPreview();
    document.getElementById('magiboken-menu').classList.remove('active');
    notif(`Formel "${q.title.split(': ')[1]}" inskriven!`, 'success');
}

function askBusterHint() {
    const questId = activeQuest.id;
    const hintBox = document.getElementById('buster-hint-box');
    const hintText = document.getElementById('buster-hint-text');
    
    if (state.unlockedHints[questId]) {
        hintBox.style.display = 'flex';
        hintText.innerHTML = `
            <strong>Koncept-ledtråd (Gratis):</strong><br>${escapeHtml(activeQuest.hints.free)}<br><br>
            <strong>Kod-skelett (Betald):</strong>
            <pre style="background:rgba(0,0,0,0.5);padding:10px;border-radius:6px;color:#a5d6ff;font-family:'Fira Code',monospace;font-size:0.75rem;margin-top:5px;border:1px solid rgba(255,255,255,0.05);user-select:text;">${escapeHtml(activeQuest.hints.paid)}</pre>
        `;
        notif('Visar tjuvknep.', 'info');
        return;
    }
    
    if (state.gold < 5) {
        busterDialogue("Du har inte 5 Guld! Försök inte lura Buster, gå och slit lite till!");
        notif('Inte tillräckligt med guld för tjuvknep!', 'error');
        return;
    }
    
    state.gold -= 5;
    state.unlockedHints[questId] = true;
    
    hintBox.style.display = 'flex';
    hintText.innerHTML = `
        <strong>Koncept-ledtråd (Gratis):</strong><br>${escapeHtml(activeQuest.hints.free)}<br><br>
        <strong>Kod-skelett (Betald):</strong>
        <pre style="background:rgba(0,0,0,0.5);padding:10px;border-radius:6px;color:#a5d6ff;font-family:'Fira Code',monospace;font-size:0.75rem;margin-top:5px;border:1px solid rgba(255,255,255,0.05);user-select:text;">${escapeHtml(activeQuest.hints.paid)}</pre>
    `;
    
    busterDialogue("Affären är klar! Här är ditt tjuvknep. Gör din kod exakt som formeln visar, men fyll i detaljerna själv. Hehe.");
    notif('Tjuvknep köpt! -5 Guld.', 'success');
    
    updateHUD();
    saveGame();
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// 11. EVENT LISTENERS FOR INLÄRNINGSSTÖD
// ==========================================
document.getElementById('magiboken-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('magiboken-menu').classList.toggle('active');
    updateMagibokenSnippets();
});

window.addEventListener('click', () => {
    const menu = document.getElementById('magiboken-menu');
    if (menu) menu.classList.remove('active');
});

document.getElementById('ask-buster-trigger').addEventListener('click', askBusterHint);

document.getElementById('close-hint-box').addEventListener('click', () => {
    document.getElementById('buster-hint-box').style.display = 'none';
});

// ==========================================
// 11. CHRONO-COLOSSEUM ARENA MOTOR (E-SPORT)
// ==========================================
let isArenaActive = false;
let isBossMatch = false;
let arenaOpponent = null;
let opponentProgress = 0;
let opponentProgressTimer = null;
let glitchInterval = null;
let bossSfxLoop = null;
let searchInterval = null;
let matchSearchTimeout = null;

const ARENA_OPPONENTS = [
    { name: 'Neon_Scribe_404', avatar: 'fa-user-ninja', speed: 4.8, msg: 'Typing... 55 WPM' },
    { name: 'Glitch_Phantom', avatar: 'fa-ghost', speed: 5.5, msg: 'Hacking... 70 WPM' },
    { name: 'Null_Pointer_Samurai', avatar: 'fa-user-shield', speed: 4.2, msg: 'Coding... 50 WPM' },
    { name: 'Binary_Beast', avatar: 'fa-spider', speed: 5.1, msg: 'Compiling... 60 WPM' },
    { name: 'Synth_Rider', avatar: 'fa-motorcycle', speed: 3.8, msg: 'Riding... 45 WPM' }
];

const ARENA_BOSSES = [
    { name: 'SYSTEM_VIRUS_V5', avatar: 'fa-skull-crossbones', speed: 6.2, msg: 'CORRUPTING SYSTEM...' },
    { name: 'THE_ORACLE_AI', avatar: 'fa-brain', speed: 6.8, msg: 'PREDICTING MOVES...' },
    { name: 'KERNEL_PANIC_99', avatar: 'fa-microchip', speed: 7.2, msg: 'OVERLOADING HARDWARE...' }
];

const SPECTATOR_CODE_SNIPPETS = [
    "const portal = document.getElementById('gate');",
    "let energy = 100;",
    "function charge() {",
    "  energy += Math.random() * 10;",
    "  console.log('Charging:', energy);",
    "}",
    "portal.addEventListener('click', charge);",
    "// Injecting neon styles",
    "const style = document.createElement('style');",
    "style.innerHTML = `",
    "  #gate {",
    "    display: flex;",
    "    justify-content: space-between;",
    "    box-shadow: 0 0 20px #b026ff;",
    "  }",
    "`;",
    "document.head.appendChild(style);"
];

const RANKS = [
    'COPPER V', 'COPPER IV', 'COPPER III', 'COPPER II', 'COPPER I',
    'BRONZE V', 'BRONZE IV', 'BRONZE III', 'BRONZE II', 'BRONZE I',
    'SILVER V', 'SILVER IV', 'SILVER III', 'SILVER II', 'SILVER I',
    'GOLD V', 'GOLD IV', 'GOLD III', 'GOLD II', 'GOLD I',
    'PLATINUM V', 'PLATINUM IV', 'PLATINUM III', 'PLATINUM II', 'PLATINUM I',
    'DIAMOND V', 'DIAMOND IV', 'DIAMOND III', 'DIAMOND II', 'DIAMOND I'
];

let arenaAudioCtx = null;
function playSynthSfx(type) {
    try {
        if (!arenaAudioCtx) {
            arenaAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (arenaAudioCtx.state === 'suspended') {
            arenaAudioCtx.resume();
        }
        
        const osc = arenaAudioCtx.createOscillator();
        const gain = arenaAudioCtx.createGain();
        osc.connect(gain);
        gain.connect(arenaAudioCtx.destination);
        
        const now = arenaAudioCtx.currentTime;
        
        if (type === 'match_found') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
            osc.start(now);
            osc.stop(now + 0.45);
        } else if (type === 'glitch') {
            const bufferSize = arenaAudioCtx.sampleRate * 0.25;
            const buffer = arenaAudioCtx.createBuffer(1, bufferSize, arenaAudioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = arenaAudioCtx.createBufferSource();
            noise.buffer = buffer;
            const filter = arenaAudioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            const noiseGain = arenaAudioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.35, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            noise.connect(filter).connect(noiseGain).connect(arenaAudioCtx.destination);
            noise.start(now);
        } else if (type === 'victory') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(261.63, now); // C4
            osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
            osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
            osc.frequency.setValueAtTime(523.25, now + 0.3); // C5
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === 'defeat') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.6);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === 'tick') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    } catch (e) {
        console.error('Ljudsyntesfel:', e);
    }
}

function updateArenaLobbyHUD() {
    const rankNameEl = document.getElementById('lobby-rank-name');
    const apTextEl = document.getElementById('lobby-ap-text');
    const apFillEl = document.getElementById('lobby-ap-fill');
    const searchBossBtn = document.getElementById('arena-boss-btn');
    const searchMatchBtn = document.getElementById('arena-search-btn');
    
    if (!rankNameEl) return;
    
    const divisionName = state.arenaRank.split(' ')[0].toLowerCase();
    rankNameEl.innerText = state.arenaRank;
    rankNameEl.className = `lobby-rank-name-${divisionName}`;
    
    apTextEl.innerText = `${state.arenaPoints} / 100 AP`;
    apFillEl.style.width = `${state.arenaPoints}%`;
    
    const progressEl = document.getElementById('arena-codex-progress');
    if (progressEl) {
        progressEl.innerText = `${state.completedQuests.length} / 20 Löst`;
    }
    
    if (state.arenaPoints >= 100) {
        if (searchBossBtn) searchBossBtn.style.display = 'inline-block';
        if (searchMatchBtn) searchMatchBtn.style.display = 'none';
    } else {
        if (searchBossBtn) searchBossBtn.style.display = 'none';
        if (searchMatchBtn) searchMatchBtn.style.display = 'inline-block';
    }
}

function searchArenaMatch() {
    if (state.hasDebt) {
        busterDialogue("Du har en aktiv skuld hos mig! Betala tillbaka den först innan du spänner musklerna i arenan...");
        notif("Kan inte starta match: Har skuld!", "error");
        return;
    }
    
    const actions = document.getElementById('lobby-ranked-actions');
    const panel = document.getElementById('matchmaking-panel');
    if (actions) actions.style.display = 'none';
    if (panel) panel.style.display = 'flex';
    
    const status = document.getElementById('search-status');
    if (status) status.innerText = 'SÖKER MOTSTÅNDARE...';
    
    if (searchInterval) clearInterval(searchInterval);
    playSynthSfx('tick');
    searchInterval = setInterval(() => {
        playSynthSfx('tick');
    }, 600);
    
    if (matchSearchTimeout) clearTimeout(matchSearchTimeout);
    matchSearchTimeout = setTimeout(() => {
        clearInterval(searchInterval);
        playSynthSfx('match_found');
        startArenaMatch(false);
    }, 3000);
}

function cancelSearch() {
    if (searchInterval) clearInterval(searchInterval);
    if (matchSearchTimeout) clearTimeout(matchSearchTimeout);
    
    const actions = document.getElementById('lobby-ranked-actions');
    const panel = document.getElementById('matchmaking-panel');
    if (actions) actions.style.display = 'flex';
    if (panel) panel.style.display = 'none';
    
    notif('Matchsökning avbruten.', 'info');
}

function startArenaMatch(isBoss = false) {
    isArenaActive = true;
    isBossMatch = isBoss;
    opponentProgress = 0;
    
    const lobby = document.getElementById('arena-lobby-view');
    const matchView = document.getElementById('arena-match-view');
    if (lobby) lobby.style.display = 'none';
    if (matchView) matchView.style.display = 'block';
    
    const listHolder = document.getElementById('test-list-holder');
    if (listHolder) listHolder.innerHTML = '';
    
    const opponentHUD = document.getElementById('hud-match-opponent');
    const vsHUD = document.getElementById('hud-match-vs');
    if (opponentHUD) opponentHUD.style.display = 'flex';
    if (vsHUD) vsHUD.style.display = 'flex';
    
    const busterBtn = document.getElementById('ask-buster-trigger');
    if (busterBtn) busterBtn.style.display = 'none'; // No cheat hints in Arena!
    
    const exitBtn = document.getElementById('exit-match-btn');
    if (exitBtn) exitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> GE UPP MATCH';
    
    if (isBoss) {
        const rand = Math.floor(Math.random() * ARENA_BOSSES.length);
        arenaOpponent = ARENA_BOSSES[rand];
        
        document.getElementById('opponent-hud-name').innerText = `👿 ${arenaOpponent.name} [BOSS]`;
        document.getElementById('spectator-terminal-title').innerText = `${arenaOpponent.name}_ATTACK.EXE`;
        
        playBossSfxLoop();
        
        if (glitchInterval) clearInterval(glitchInterval);
        glitchInterval = setInterval(triggerGlitchAttack, 12000);
        
        notif(`VARNING: SYSTEM-VIRUS UPPTÄCKT!`, 'error');
    } else {
        const rand = Math.floor(Math.random() * ARENA_OPPONENTS.length);
        arenaOpponent = ARENA_OPPONENTS[rand];
        
        document.getElementById('opponent-hud-name').innerText = `⚔️ ${arenaOpponent.name}`;
        document.getElementById('spectator-terminal-title').innerText = `${arenaOpponent.name}_STREAM.EXE`;
    }
    
    document.getElementById('opponent-typing-status').innerText = arenaOpponent.msg;
    document.getElementById('opponent-match-progress').style.width = '0%';
    document.getElementById('player-match-progress').style.width = '0%';
    
    let questPool = [];
    const rankName = state.arenaRank.split(' ')[0];
    
    if (rankName === 'COPPER') {
        questPool = ['html-1', 'css-1', 'js-1'];
    } else if (rankName === 'BRONZE') {
        questPool = ['css-2', 'js-2'];
    } else if (rankName === 'SILVER') {
        questPool = ['js-3', 'css-3'];
    } else {
        questPool = ['js-4', 'js-5'];
    }
    
    const randomQuestId = questPool[Math.floor(Math.random() * questPool.length)];
    const q = QUESTS.find(x => x.id === randomQuestId);
    
    if (q) {
        activeQuest = q;
        isEditorModified = false;
        
        document.getElementById('quest-title').innerHTML = `<i class="fa-solid fa-scroll"></i> ${q.title}`;
        document.getElementById('quest-description').innerText = q.desc;
        document.getElementById('quest-reward').innerText = `+${q.rewardXp} XP / +${q.rewardGold} GOLD / +25 AP`;
        document.getElementById('code-input').value = q.defaultCode;
        
        updateSandboxPreview();
    }
    
    document.getElementById('btn-tab-preview').click();
    
    if (opponentProgressTimer) clearInterval(opponentProgressTimer);
    opponentProgressTimer = setInterval(() => {
        runOpponentTypingLoop();
    }, 1000);
}

function exitMatch() {
    isArenaActive = false;
    isBossMatch = false;
    clearInterval(opponentProgressTimer);
    if (glitchInterval) clearInterval(glitchInterval);
    if (bossSfxLoop) clearInterval(bossSfxLoop);
    
    const matchmakingPanel = document.getElementById('matchmaking-panel');
    const matchmakingActions = document.getElementById('lobby-ranked-actions');
    if (matchmakingPanel) matchmakingPanel.style.display = 'none';
    if (matchmakingActions) matchmakingActions.style.display = 'flex';
    
    const matchView = document.getElementById('arena-match-view');
    const lobby = document.getElementById('arena-lobby-view');
    if (matchView) matchView.style.display = 'none';
    if (lobby) lobby.style.display = 'block';
    
    updateHUD();
}

function playBossSfxLoop() {
    if (bossSfxLoop) clearInterval(bossSfxLoop);
    playSynthSfx('tick');
    bossSfxLoop = setInterval(() => {
        if (isArenaActive && isBossMatch) {
            playSynthSfx('tick');
        } else {
            clearInterval(bossSfxLoop);
        }
    }, 2500);
}

// Visual glitch overlay activation
function triggerGlitchAttack() {
    if (!isArenaActive || !isBossMatch) return;
    
    playSynthSfx('glitch');
    
    const arenaView = document.getElementById('arena-match-view');
    const overlay = document.createElement('div');
    overlay.className = 'glitch-screen-overlay active';
    document.body.appendChild(overlay);
    
    if (arenaView) arenaView.classList.add('glitch-active');
    notif("⚠️ DETEKTERAR SYSTEMGLITCH-ATTACK!", "error");
    
    setTimeout(() => {
        if (arenaView) arenaView.classList.remove('glitch-active');
        overlay.remove();
    }, 1500);
}

function runOpponentTypingLoop() {
    if (!isArenaActive) return;
    
    const base = arenaOpponent.speed;
    const rand = Math.random() * 2.5;
    opponentProgress += base + rand;
    
    const opponentBar = document.getElementById('opponent-match-progress');
    const opponentStatus = document.getElementById('opponent-typing-status');
    
    if (opponentProgress >= 100) {
        opponentProgress = 100;
        if (opponentBar) opponentBar.style.width = '100%';
        if (opponentStatus) opponentStatus.innerText = 'KLAR!';
        clearInterval(opponentProgressTimer);
        
        handleMatchLose();
    } else {
        if (opponentBar) opponentBar.style.width = `${Math.floor(opponentProgress)}%`;
        
        const log = document.getElementById('spectator-terminal-log');
        if (log) {
            const randLine = SPECTATOR_CODE_SNIPPETS[Math.floor(Math.random() * SPECTATOR_CODE_SNIPPETS.length)];
            log.innerHTML += `\n<span style="color:#00ff66;">&gt; ${randLine}</span>`;
            log.scrollTop = log.scrollHeight;
        }
    }
}

function handleMatchLose() {
    isArenaActive = false;
    clearInterval(opponentProgressTimer);
    if (glitchInterval) clearInterval(glitchInterval);
    if (bossSfxLoop) clearInterval(bossSfxLoop);
    
    playSynthSfx('defeat');
    
    let apLost = 10;
    state.arenaPoints = Math.max(0, state.arenaPoints - apLost);
    
    busterDialogue(`Hehe! Du blev besegrad av ${arenaOpponent.name}. Träna lite mer i Codex innan du utmanar eliten.`);
    notif(`MATCH FÖRLORAD! -${apLost} AP`, 'error');
    
    const exitBtn = document.getElementById('exit-match-btn');
    if (exitBtn) exitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> TILLBAKA TILL LOBBY';
    
    updateHUD();
    saveGame();
}

function handleMatchWin() {
    isArenaActive = false;
    clearInterval(opponentProgressTimer);
    if (glitchInterval) clearInterval(glitchInterval);
    if (bossSfxLoop) clearInterval(bossSfxLoop);
    
    playSynthSfx('victory');
    
    const playerBar = document.getElementById('player-match-progress');
    const playerStatus = document.getElementById('player-typing-status');
    if (playerBar) playerBar.style.width = '100%';
    if (playerStatus) playerStatus.innerText = 'SEGER!';
    
    const exitBtn = document.getElementById('exit-match-btn');
    if (exitBtn) exitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> TILLBAKA TILL LOBBY';
    
    if (isBossMatch) {
        const oldRank = state.arenaRank;
        const currentRankIndex = RANKS.indexOf(state.arenaRank);
        if (currentRankIndex < RANKS.length - 1) {
            state.arenaRank = RANKS[currentRankIndex + 1];
        }
        state.arenaPoints = 0; // AP resets on promotion!
        
        busterDialogue(`ENORM SEGER! Du krossade glitch-bossen och befordrades till ${state.arenaRank}! Du är en sann kod-legend.`);
        notif(`PROMOTION! Befordrad till ${state.arenaRank}!`, 'success');
        triggerConfetti();
    } else {
        const goldWon = 20;
        const xpWon = 50;
        state.arenaPoints += 25;
        
        if (state.arenaPoints >= 100) {
            state.arenaPoints = 100;
            notif(`KVALIFICERAD FÖR PROMOTIONSMATCH!`, 'success');
        }
        
        gainRewards(xpWon, goldWon, 'kod');
        notif(`SEGER! +${goldWon} G / +${xpWon} XP / +25 AP`, 'success');
        busterDialogue(`Grymt jobbat! Du besegrade ${arenaOpponent.name} och skickade dem i papperskorgen.`);
    }
    
    updateHUD();
    saveGame();
}

// ==========================================
// ==========================================
// 12. SECRET PROMO CODES ENGINE
// ==========================================
const PROMO_CODES = {
    'PRIME_BOOST': { gold: 100, xp: 150, msg: 'Utvecklar-nyckel PRIME_BOOST dekrypterad! Du fick +100 Guld och +150 XP.' },
    'CYBER_SECRET': { gold: 50, xp: 0, msg: 'Hemlig byte-nyckel CYBER_SECRET dekrypterad! Buster gav dig +50 Guld.' },
    'DETOX_WARRIOR': { gold: 0, xp: 200, msg: 'Fokus-nyckel DETOX_WARRIOR dekrypterad! Du fick +200 XP för att detoxa hårt!' }
};

function redeemPromoCode() {
    const input = document.getElementById('cheat-code-input');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    if (!code) {
        notif('Vänligen ange en nyckel först.', 'info');
        return;
    }
    
    // Check both standard codes and custom created codes
    const promo = PROMO_CODES[code] || (state.customPromoCodes ? state.customPromoCodes[code] : null);
    if (!promo) {
        busterDialogue("Felaktig dekrypteringsnyckel, kompis. Försök inte lura Buster! Hitta giltiga koder och kom tillbaka.");
        notif('Ogiltig nyckel!', 'error');
        return;
    }
    
    if (state.usedPromoCodes.includes(code)) {
        busterDialogue("Du har redan använt den där nyckeln! Girighet klär dig inte, cyber-kodare.");
        notif('Nyckeln redan använd!', 'error');
        return;
    }
    
    state.usedPromoCodes.push(code);
    
    if (promo.gold > 0) {
        state.gold += promo.gold;
        state.goldEarnedTotal += promo.gold;
    }
    if (promo.xp > 0) {
        state.xp += promo.xp;
        while (state.xp >= state.xpNeeded) {
            state.xp -= state.xpNeeded;
            state.level += 1;
            state.xpNeeded = Math.floor(state.xpNeeded * 1.5);
            notif(`LEVEL UP! Du är nu Level ${state.level}!`, 'info');
            triggerConfetti();
        }
    }
    
    playSynthSfx('victory');
    triggerConfetti();
    
    busterDialogue(`Ooooh! Var fick du tag på den där dekrypteringsnyckeln?! Den är äkta! ${promo.msg}`);
    notif('Nyckel aktiverad!', 'success');
    
    input.value = '';
    
    updateHUD();
    saveGame();
}

// Secret Promo Code Creator functions
function createPromoCode() {
    const inputName = document.getElementById('create-code-input');
    const inputGold = document.getElementById('create-code-gold');
    const inputXp = document.getElementById('create-code-xp');
    
    if (!inputName || !inputGold || !inputXp) return;
    
    const name = inputName.value.trim().toUpperCase();
    if (!name) {
        notif('Vänligen ange ett kodnamn.', 'error');
        return;
    }
    
    // Validate key name
    if (name.length < 3) {
        notif('Kodnamnet måste vara minst 3 tecken långt.', 'error');
        return;
    }
    
    if (!/^[A-Z0-9_]+$/.test(name)) {
        notif('Kodnamnet får endast innehålla engelska bokstäver, siffror och understreck.', 'error');
        return;
    }
    
    // Check if code already exists in static codes or custom codes
    if (PROMO_CODES[name] || (state.customPromoCodes && state.customPromoCodes[name])) {
        notif('Denna kodnyckel existerar redan!', 'error');
        return;
    }
    
    const goldVal = parseInt(inputGold.value) || 0;
    const xpVal = parseInt(inputXp.value) || 0;
    
    if (goldVal < 0 || xpVal < 0) {
        notif('Guld och XP kan inte vara negativa värden.', 'error');
        return;
    }
    
    if (goldVal > 1000 || xpVal > 1000) {
        notif('Guld och XP per kod är begränsat till max 1000.', 'warning');
        return;
    }
    
    if (goldVal === 0 && xpVal === 0) {
        notif('Koden måste ge minst lite guld eller XP!', 'warning');
        return;
    }
    
    // Initialize customPromoCodes if not present
    if (!state.customPromoCodes) {
        state.customPromoCodes = {};
    }
    
    // Add custom code
    state.customPromoCodes[name] = {
        gold: goldVal,
        xp: xpVal,
        msg: `Egennyckel ${name} aktiverad! Du fick +${goldVal} Guld och +${xpVal} XP.`
    };
    
    // Save state
    saveGame();
    
    // UI Notification and updates
    notif(`Promo-kod ${name} skapad med framgång!`, 'success');
    playSynthSfx('victory'); // Play a victory chime
    
    // Reset inputs
    inputName.value = '';
    inputGold.value = '100';
    inputXp.value = '100';
    
    // Re-render
    renderCustomCodes();
}

function deletePromoCode(codeName) {
    if (state.customPromoCodes && state.customPromoCodes[codeName]) {
        delete state.customPromoCodes[codeName];
        saveGame();
        notif(`Promo-koden ${codeName} har raderats.`, 'info');
        renderCustomCodes();
    }
}

function renderCustomCodes() {
    const container = document.getElementById('created-codes-panel');
    const list = document.getElementById('created-codes-list');
    
    if (!container || !list) return;
    
    // Initialize if empty
    if (!state.customPromoCodes) {
        state.customPromoCodes = {};
    }
    
    const keys = Object.keys(state.customPromoCodes);
    
    if (keys.length === 0) {
        container.style.display = 'none';
        list.innerHTML = '';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    keys.forEach(codeName => {
        const promo = state.customPromoCodes[codeName];
        
        const tag = document.createElement('div');
        tag.className = 'code-tag';
        tag.innerHTML = `
            <span class="tag-name">${codeName}</span>
            <span class="tag-rewards">(+${promo.gold}G / +${promo.xp}XP)</span>
            <i class="fa-solid fa-xmark tag-delete" title="Radera kodnyckel"></i>
        `;
        
        // Add delete listener
        tag.querySelector('.tag-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deletePromoCode(codeName);
        });
        
        list.appendChild(tag);
    });
}

// ==========================================
// 15. SYNDICATE HQ & HOLOGRAPHIC WAR TABLE MOTOR
// ==========================================
let syndicateTimerInterval = null;
let syndicateTransmissionInterval = null;

const SYNDICATE_MISSIONS = {
    'vaporcloud': {
        name: 'VaporCloud Infiltration',
        gold: 120,
        xp: 150,
        desc: 'Bryt dig in i VaporCloud:s sub-routers och skörda designdata.'
    },
    'hologrid': {
        name: 'HoloGrid Corp Raid',
        gold: 250,
        xp: 200,
        desc: 'Överbelasta HoloGrid:s centrala databassystem och stjäl krypterade spellkeys.'
    },
    'blackmarket': {
        name: 'Buster ledger decryption',
        gold: 180,
        xp: 250,
        desc: 'Avlyssna och dekryptera Busters dolda transaktionsregister.'
    }
};

const SYNDICATE_DIALOGUES = [
    "Håller låg profil. Systemen ser lugna ut so far.",
    "Bypass-nyckel applicerad. Neural Link-synkningen hjälper till att maskera min närvaro!",
    "Hittade ett dolt datasegment. Fortsätt koda så jag kan hämta hem det!",
    "Brandväggar reagerar! Jag behöver din kodaktivitet för att stabilisera synkningen!",
    "Nästan klar med infiltrationen. Håll synken uppe för maximal utdelning!",
    "Dataöverföring påbörjad. Det här är prima grejer!"
];

function initSyndicateHQ() {
    // Ensure state syndicate exists
    if (!state.syndicate) {
        state.syndicate = {
            crew: [
                { name: 'Flexbox_Samurai', level: 1, role: 'CSS Specialist', status: 'idle' },
                { name: 'Sarah_SQL', level: 1, role: 'JS Wizard', status: 'idle' },
                { name: 'Buffer_Overlord', level: 1, role: 'Security Specialist', status: 'idle' }
            ],
            activeMission: null,
            missionEndTime: 0,
            currentSync: 50,
            rewards: { gold: 0, xp: 0 }
        };
    }

    // Bind Deploy buttons
    const btnVapor = document.getElementById('btn-deploy-vaporcloud');
    if (btnVapor && !btnVapor.dataset.bound) {
        btnVapor.addEventListener('click', () => startSyndicateMission('vaporcloud'));
        btnVapor.dataset.bound = "true";
    }
    
    const btnHolo = document.getElementById('btn-deploy-hologrid');
    if (btnHolo && !btnHolo.dataset.bound) {
        btnHolo.addEventListener('click', () => startSyndicateMission('hologrid'));
        btnHolo.dataset.bound = "true";
    }
    
    const btnMarket = document.getElementById('btn-deploy-blackmarket');
    if (btnMarket && !btnMarket.dataset.bound) {
        btnMarket.addEventListener('click', () => startSyndicateMission('blackmarket'));
        btnMarket.dataset.bound = "true";
    }

    // 1. Render Crew List
    renderCrewList();

    // 2. Check if a mission is currently running
    const now = Date.now();
    if (state.syndicate.activeMission && state.syndicate.missionEndTime > 0) {
        if (now >= state.syndicate.missionEndTime) {
            // Mission completed while player was away!
            completeSyndicateMission(true); // pass true to indicate it was processed on load
        } else {
            // Resume active mission countdown
            resumeActiveMission();
        }
    } else {
        // Ready for action
        updateSyndicateUI();
    }

    // Update emblems across the app
    updateCrestAcrossApp();

    // Initialize Emblem Designer
    initEmblemDesigner();
}

function renderCrewList() {
    const listHolder = document.getElementById('crew-list-holder');
    if (!listHolder) return;

    listHolder.innerHTML = '';
    state.syndicate.crew.forEach(member => {
        const isAgentActive = state.syndicate.activeMission && 
                              ((state.syndicate.activeMission === 'vaporcloud' && member.name === 'Flexbox_Samurai') ||
                               (state.syndicate.activeMission === 'hologrid' && member.name === 'Sarah_SQL') ||
                               (state.syndicate.activeMission === 'blackmarket' && member.name === 'Buffer_Overlord'));
        
        member.status = isAgentActive ? 'deployed' : 'idle';

        const card = document.createElement('div');
        card.className = `crew-item-card ${isAgentActive ? 'active' : ''}`;
        
        // Pick class avatar
        let avatarIcon = 'fa-user-ninja';
        if (member.name === 'Sarah_SQL') avatarIcon = 'fa-user-astronaut';
        if (member.name === 'Buffer_Overlord') avatarIcon = 'fa-user-shield';

        card.innerHTML = `
            <div class="crew-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="crew-info-wrap">
                <h4>${member.name} (Lvl ${member.level})</h4>
                <span class="crew-role">${member.role}</span>
            </div>
            <span class="crew-status ${member.status}">${member.status === 'deployed' ? 'ON RÄD' : 'REDO'}</span>
        `;
        listHolder.appendChild(card);
    });
}

function startSyndicateMission(missionId) {
    if (state.syndicate.activeMission) {
        notif('Ett uppdrag pågår redan! Ditt crew kan bara hantera en räd åt gången.', 'warning');
        return;
    }

    const mission = SYNDICATE_MISSIONS[missionId];
    if (!mission) return;

    // Pick agent based on mission type
    let agent = '';
    if (missionId === 'vaporcloud') agent = 'Flexbox_Samurai';
    else if (missionId === 'hologrid') agent = 'Sarah_SQL';
    else if (missionId === 'blackmarket') agent = 'Buffer_Overlord';

    // Start mission: 30 minutes duration (1800000ms).
    const duration = 30 * 60 * 1000;
    
    state.syndicate.activeMission = missionId;
    state.syndicate.missionEndTime = Date.now() + duration;
    state.syndicate.currentSync = 50; // Starts at 50%
    state.syndicate.rewards = { gold: mission.gold, xp: mission.xp };

    // Update crew status to deployed
    state.syndicate.crew.forEach(member => {
        if (member.name === agent) member.status = 'deployed';
    });

    saveGame();
    playSynthSfx('match_found');
    notif(`RÄD STARTAD: ${mission.name}! Agent ${agent} har skickats ut.`, 'success');

    // UI Updates
    renderCrewList();
    resumeActiveMission();
}

function resumeActiveMission() {
    const selectorCard = document.getElementById('missions-selector-card');
    const activeCard = document.getElementById('active-mission-progress-card');
    
    if (selectorCard) selectorCard.style.display = 'none';
    if (activeCard) {
        activeCard.style.display = 'block';
        
        // Set info
        const mission = SYNDICATE_MISSIONS[state.syndicate.activeMission];
        let agent = '';
        if (state.syndicate.activeMission === 'vaporcloud') agent = 'Flexbox_Samurai';
        else if (state.syndicate.activeMission === 'hologrid') agent = 'Sarah_SQL';
        else if (state.syndicate.activeMission === 'blackmarket') agent = 'Buffer_Overlord';

        document.getElementById('active-mission-name').innerText = mission.name;
        document.getElementById('active-agent-name').innerText = agent;
    }

    // Set badge status
    const statusBadge = document.getElementById('mission-status-badge');
    if (statusBadge) {
        statusBadge.innerText = 'INFILTRATING CYBERSPACE';
        statusBadge.classList.add('active');
    }

    const timerDisplay = document.getElementById('holo-timer-display');
    if (timerDisplay) timerDisplay.style.display = 'block';

    const radioStatus = document.getElementById('radio-sync-status');
    if (radioStatus) {
        radioStatus.innerText = 'SYNC ACTIVE';
        radioStatus.classList.add('active');
    }

    // Clear and print initial logs
    const logs = document.getElementById('transmission-logs');
    if (logs) {
        logs.innerHTML = '';
    }
    
    let agentName = '';
    if (state.syndicate.activeMission === 'vaporcloud') agentName = 'Flexbox_Samurai';
    else if (state.syndicate.activeMission === 'hologrid') agentName = 'Sarah_SQL';
    else if (state.syndicate.activeMission === 'blackmarket') agentName = 'Buffer_Overlord';

    addTransmissionLog('SYSTEM', `Neural Link etablerad med Agent ${agentName}. Infiltration påbörjad.`, true);
    addTransmissionLog(agentName, `Jag är inne i systemet. Synk-hastigheten är stabil på ${state.syndicate.currentSync}%. Börja plugga kod för att boosta mig!`);

    // Start intervals
    if (syndicateTimerInterval) clearInterval(syndicateTimerInterval);
    syndicateTimerInterval = setInterval(tickSyndicateMission, 1000);

    if (syndicateTransmissionInterval) clearInterval(syndicateTransmissionInterval);
    syndicateTransmissionInterval = setInterval(tickSyndicateTransmissions, 90 * 1000); // Transmission every 90 seconds

    updateSyndicateUI();
}

function tickSyndicateMission() {
    const now = Date.now();
    const timeLeft = state.syndicate.missionEndTime - now;

    if (timeLeft <= 0) {
        // Mission finished!
        clearInterval(syndicateTimerInterval);
        clearInterval(syndicateTransmissionInterval);
        completeSyndicateMission(false);
        return;
    }

    // Update countdown text
    const mins = Math.floor(timeLeft / 60000);
    const secs = Math.floor((timeLeft % 60000) / 1000);
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const countDisplay = document.getElementById('holo-timer-countdown');
    if (countDisplay) countDisplay.innerText = timeStr;

    // Passive Focus Synth sync check:
    // If synth is active, we increase sync by 1% per minute.
    // That means 1% chance every 60 ticks.
    if (synthOsc && Math.random() < (1 / 60)) {
        addSyndicateSync(1, 'Focus Synth aktivitet');
    }

    // Update UI elements
    updateSyndicateUI();
}

function tickSyndicateTransmissions() {
    if (!state.syndicate.activeMission) return;
    
    let agentName = '';
    if (state.syndicate.activeMission === 'vaporcloud') agentName = 'Flexbox_Samurai';
    else if (state.syndicate.activeMission === 'hologrid') agentName = 'Sarah_SQL';
    else if (state.syndicate.activeMission === 'blackmarket') agentName = 'Buffer_Overlord';

    const randMsg = SYNDICATE_DIALOGUES[Math.floor(Math.random() * SYNDICATE_DIALOGUES.length)];
    addTransmissionLog(agentName, randMsg);
}

function addSyndicateSync(amount, reason) {
    if (!state.syndicate.activeMission) return;

    const oldSync = state.syndicate.currentSync;
    state.syndicate.currentSync = Math.min(100, state.syndicate.currentSync + amount);

    if (state.syndicate.currentSync > oldSync) {
        saveGame();
        notif(`NEURAL LINK SYNCHRONIZED: +${amount}% Sync (${reason})!`, 'info');
        
        let agentName = '';
        if (state.syndicate.activeMission === 'vaporcloud') agentName = 'Flexbox_Samurai';
        else if (state.syndicate.activeMission === 'hologrid') agentName = 'Sarah_SQL';
        else if (state.syndicate.activeMission === 'blackmarket') agentName = 'Buffer_Overlord';

        addTransmissionLog('SYSTEM', `Sync Rate ökad till ${state.syndicate.currentSync}% via ${reason}.`, true);
        
        // Play synth focus chime
        playSynthSfx('tick');
        updateSyndicateUI();
    }
}

function addTransmissionLog(sender, text, isSystem = false) {
    const logs = document.getElementById('transmission-logs');
    if (!logs) return;

    const msg = document.createElement('div');
    msg.className = `transmission-msg ${isSystem ? 'system' : 'agent-msg'}`;
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (isSystem) {
        msg.innerHTML = `<span class="msg-time">[${timeStr}]</span> <span class="msg-text">${text}</span>`;
    } else {
        msg.innerHTML = `<span class="msg-time">[${timeStr}]</span> <span class="msg-agent">&lt;${sender}&gt;:</span> <span class="msg-text">${text}</span>`;
    }

    logs.appendChild(msg);
    logs.scrollTop = logs.scrollHeight; // Auto scroll to bottom
}

function updateSyndicateUI() {
    if (!state.syndicate) return;

    // Update gauge rotation and text
    const syncVal = document.getElementById('holo-sync-val');
    const syncFill = document.getElementById('holo-sync-fill');
    
    if (state.syndicate.activeMission) {
        if (syncVal) syncVal.innerText = `${state.syndicate.currentSync}%`;
        
        // Gauge fill rotation logic based on sync value
        // 50% = 0deg, 100% = 180deg
        if (syncFill) {
            syncFill.style.filter = `drop-shadow(0 0 ${5 + (state.syndicate.currentSync - 50) * 0.3}px var(--neon-cyan))`;
        }
    } else {
        if (syncVal) syncVal.innerText = 'DISCONNECTED';
        if (syncFill) syncFill.style.filter = 'none';
        
        const statusBadge = document.getElementById('mission-status-badge');
        if (statusBadge) {
            statusBadge.innerText = 'READY FOR DEPLOYMENT';
            statusBadge.classList.remove('active');
        }

        const timerDisplay = document.getElementById('holo-timer-display');
        if (timerDisplay) timerDisplay.style.display = 'none';

        const selectorCard = document.getElementById('missions-selector-card');
        const activeCard = document.getElementById('active-mission-progress-card');
        
        if (selectorCard) selectorCard.style.display = 'block';
        if (activeCard) activeCard.style.display = 'none';

        const radioStatus = document.getElementById('radio-sync-status');
        if (radioStatus) {
            radioStatus.innerText = 'DISCONNECTED';
            radioStatus.classList.remove('active');
        }
    }
}

function completeSyndicateMission(wasAway = false) {
    if (!state.syndicate.activeMission) return;

    const mission = SYNDICATE_MISSIONS[state.syndicate.activeMission];
    let agentName = '';
    if (state.syndicate.activeMission === 'vaporcloud') agentName = 'Flexbox_Samurai';
    else if (state.syndicate.activeMission === 'hologrid') agentName = 'Sarah_SQL';
    else if (state.syndicate.activeMission === 'blackmarket') agentName = 'Buffer_Overlord';

    const syncPct = state.syndicate.currentSync / 100;
    const finalGold = Math.floor(state.syndicate.rewards.gold * syncPct);
    const finalXp = Math.floor(state.syndicate.rewards.xp * syncPct);

    // Apply rewards
    state.gold += finalGold;
    state.goldEarnedTotal += finalGold;
    state.xp += finalXp;

    // Check for level ups
    let levelUps = 0;
    while (state.xp >= state.xpNeeded) {
        state.xp -= state.xpNeeded;
        state.level += 1;
        state.xpNeeded = Math.floor(state.xpNeeded * 1.5);
        levelUps++;
    }

    // Upgrade deployed agent level! (25% chance)
    let agentUpgraded = false;
    state.syndicate.crew.forEach(member => {
        if (member.name === agentName) {
            member.status = 'idle';
            if (Math.random() < 0.25) {
                member.level += 1;
                agentUpgraded = true;
            }
        }
    });

    // Reset mission state
    state.syndicate.activeMission = null;
    state.syndicate.missionEndTime = 0;
    state.syndicate.currentSync = 50;
    state.syndicate.rewards = { gold: 0, xp: 0 };

    saveGame();

    // Trigger UI updates
    updateHUD();
    renderCrewList();
    updateSyndicateUI();

    // Play sounds
    playSynthSfx('victory');
    triggerConfetti();

    // Show report modal or big dialogue
    if (wasAway) {
        alert(`MISSION RAPPORT: RÄDEN AVSLUTAD!\n\nDitt crew genomförde uppdraget "${mission.name}" under din frånvaro.\nEftersom din Neural Link-synk låg på ${Math.floor(syncPct * 100)}% fick du:\n\n💰 +${finalGold} Guld\n⚡ +${finalXp} XP${levelUps > 0 ? `\n\nNIVÅ UPPNÅDD! Du ökade ${levelUps} levels!` : ''}${agentUpgraded ? `\n\nAGENT UPPDATERAD: ${agentName} har befordrats till Lvl ${state.syndicate.crew.find(m => m.name === agentName).level}!` : ''}`);
    } else {
        busterDialogue(`Mission slutförd! ${agentName} kom hem helskinnad från räden "${mission.name}". Genom din aktiva synkning (${Math.floor(syncPct * 100)}%) knep ni +${finalGold} Guld och +${finalXp} XP! ${agentUpgraded ? `${agentName} gick dessutom upp i nivå!` : ''}`);
        notif(`UPPDRAG SLUTFÖRT: +${finalGold} G / +${finalXp} XP!`, 'success');
    }
}

// Secret Cyber-Emblem Designer functions
function initEmblemDesigner() {
    const inputName = document.getElementById('emblem-name-input');
    const selectShape = document.getElementById('emblem-shape-select');
    const selectIcon = document.getElementById('emblem-icon-select');
    const selectColor = document.getElementById('emblem-color-select');
    const saveBtn = document.getElementById('save-emblem-btn');

    if (!inputName || !selectShape || !selectIcon || !selectColor || !saveBtn) return;

    // Initialize with current saved state
    const crest = state.syndicate.crest || {
        name: 'CYBER_SHIELD',
        shape: 'fa-shield',
        icon: 'fa-bolt',
        color: 'cyan'
    };

    inputName.value = crest.name;
    selectShape.value = crest.shape;
    selectIcon.value = crest.icon;
    selectColor.value = crest.color;

    // Apply initial preview
    updateEmblemPreview();

    // Bind real-time change events for preview
    inputName.addEventListener('input', updateEmblemPreview);
    selectShape.addEventListener('change', updateEmblemPreview);
    selectIcon.addEventListener('change', updateEmblemPreview);
    selectColor.addEventListener('change', updateEmblemPreview);

    // Save button event
    if (!saveBtn.dataset.bound) {
        saveBtn.addEventListener('click', () => {
            const nameVal = inputName.value.trim().toUpperCase().replace(/\s+/g, '_');
            if (!nameVal) {
                notif('Vänligen ange ett klan-namn.', 'error');
                return;
            }

            // Save to state
            state.syndicate.crest = {
                name: nameVal,
                shape: selectShape.value,
                icon: selectIcon.value,
                color: selectColor.value
            };

            saveGame();
            updateCrestAcrossApp();

            notif(`Syndikat-emblem sparad för ${nameVal}!`, 'success');
            playSynthSfx('victory');
            triggerConfetti();
        });
        saveBtn.dataset.bound = "true";
    }
}

function updateEmblemPreview() {
    const inputName = document.getElementById('emblem-name-input');
    const selectShape = document.getElementById('emblem-shape-select');
    const selectIcon = document.getElementById('emblem-icon-select');
    const selectColor = document.getElementById('emblem-color-select');

    if (!inputName || !selectShape || !selectIcon || !selectColor) return;

    const name = inputName.value.trim().toUpperCase().replace(/\s+/g, '_') || 'CYBER_SHIELD';
    const shape = selectShape.value;
    const icon = selectIcon.value;
    const color = selectColor.value;

    // Update designer preview
    const previewName = document.getElementById('crest-preview-name-text');
    if (previewName) previewName.innerText = name;

    const previewShape = document.getElementById('crest-preview-shape');
    if (previewShape) {
        previewShape.className = `fa-solid ${shape} crest-bg-shape`;
    }

    const previewIcon = document.getElementById('crest-preview-icon');
    if (previewIcon) {
        previewIcon.className = `fa-solid ${icon} crest-fg-icon crest-glow-${color}`;
    }
}

function updateCrestAcrossApp() {
    if (!state.syndicate || !state.syndicate.crest) return;

    const crest = state.syndicate.crest;

    // 1. Update Character Profile Crest Badge
    const profileBadge = document.getElementById('profile-syndicate-badge');
    const profileCrestShape = document.getElementById('profile-crest-shape');
    const profileCrestIcon = document.getElementById('profile-crest-icon');
    const profileCrestName = document.getElementById('profile-syndicate-name');

    if (profileBadge && profileCrestShape && profileCrestIcon && profileCrestName) {
        profileBadge.style.display = 'flex';
        profileCrestName.innerText = crest.name;
        profileCrestShape.className = `fa-solid ${crest.shape} crest-bg-shape`;
        profileCrestIcon.className = `fa-solid ${crest.icon} crest-fg-icon crest-glow-${crest.color}`;
        
        // Match border color of badge to syndicate theme color
        let neonColorVar = 'var(--neon-purple)';
        if (crest.color === 'cyan') neonColorVar = 'var(--neon-cyan)';
        else if (crest.color === 'amber') neonColorVar = 'var(--neon-amber)';
        else if (crest.color === 'green') neonColorVar = 'var(--neon-green)';
        else if (crest.color === 'red') neonColorVar = 'var(--neon-red)';

        profileBadge.style.borderColor = neonColorVar;
        profileBadge.style.boxShadow = `0 0 10px ${neonColorVar}`;
    }
}

// ==========================================
// 12. CMD PLAYGROUND TERMINAL ENGINE (SEQUENTIAL GUIDED)
// ==========================================
let cmdCurrentStepIndex = 0;
let cmdSessionVars = {};

function initCmdPlayground() {
    const langSelect = document.getElementById('cmd-lang-select');
    const conceptSelect = document.getElementById('cmd-concept-select');
    const inputField = document.getElementById('cmd-term-input');
    const logContainer = document.getElementById('cmd-terminal-log');

    if (!langSelect || !conceptSelect || !inputField || !logContainer) return;

    // Populate concepts initially
    populateCmdConcepts();

    // Event listeners
    langSelect.addEventListener('change', () => {
        cmdCurrentStepIndex = 0;
        cmdSessionVars = {};
        populateCmdConcepts();
        clearTerminalLog();
        appendTerminalText('SYSTEM: Bytt språk till ' + langSelect.value.toUpperCase() + '.', 'text-muted');
        
        const lang = langSelect.value;
        const topics = CMD_PLAYGROUND_TOPICS[lang] || [];
        if (topics[0] && topics[0].steps[0]) {
            appendTerminalText('\n[INSTRUKTION]: ' + topics[0].steps[0].instruction, 'text-green');
        }
    });

    conceptSelect.addEventListener('change', () => {
        cmdCurrentStepIndex = 0;
        cmdSessionVars = {};
        updateCheatSheet();
        clearTerminalLog();
        appendTerminalText('SYSTEM: Bytt ämne till ' + conceptSelect.options[conceptSelect.selectedIndex].text + '.', 'text-muted');
        
        const lang = langSelect.value;
        const conceptId = conceptSelect.value;
        const topics = CMD_PLAYGROUND_TOPICS[lang] || [];
        const topic = topics.find(t => t.id === conceptId);
        if (topic && topic.steps[0]) {
            appendTerminalText('\n[INSTRUKTION]: ' + topic.steps[0].instruction, 'text-green');
        }
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const code = inputField.value;
            if (!code.trim()) return;

            // Output user command
            appendTerminalText(`CHRONO-OS:\\User\\> ${code}`, 'text-white');
            inputField.value = '';

            // Run validation
            setTimeout(() => {
                const lang = langSelect.value;
                const conceptId = conceptSelect.value;
                const topics = CMD_PLAYGROUND_TOPICS[lang] || [];
                const topic = topics.find(t => t.id === conceptId);

                if (topic && topic.steps && topic.steps[cmdCurrentStepIndex]) {
                    const step = topic.steps[cmdCurrentStepIndex];
                    const result = step.validate(code, cmdSessionVars);

                    if (result.pass) {
                        appendTerminalText(`[OK] ${result.msg}`, 'text-green');
                        
                        // Check if there is a next step
                        if (cmdCurrentStepIndex + 1 < topic.steps.length) {
                            cmdCurrentStepIndex++;
                            updateCheatSheet();
                            const nextStep = topic.steps[cmdCurrentStepIndex];
                            
                            // Output the following instruction directly in the terminal log!
                            appendTerminalText(`\n[FÖLJANDE INSTRUKTION]: ${nextStep.instruction}`, 'text-green');
                            playSynthSfx('victory');
                        } else {
                            // Last step completed!
                            appendTerminalText(`\n[GRATULERAR] Du har framgångsrikt slutfört alla delar av "${topic.name}"! Bra jobbat!`, 'text-green');
                            playSynthSfx('victory');
                            triggerConfetti();
                        }
                    } else {
                        appendTerminalText(`[FEL] ${result.msg}`, 'text-red');
                        playSynthSfx('laser');
                    }
                }
            }, 250);
        }
    });

    // Initial update
    updateCheatSheet();
    
    // Initial instruction print in log
    const initialTopics = CMD_PLAYGROUND_TOPICS[langSelect.value] || [];
    if (initialTopics[0] && initialTopics[0].steps[0]) {
        appendTerminalText('\n[INSTRUKTION]: ' + initialTopics[0].steps[0].instruction, 'text-green');
    }
}

function populateCmdConcepts() {
    const langSelect = document.getElementById('cmd-lang-select');
    const conceptSelect = document.getElementById('cmd-concept-select');
    if (!langSelect || !conceptSelect) return;

    const lang = langSelect.value;
    const topics = CMD_PLAYGROUND_TOPICS[lang] || [];

    conceptSelect.innerHTML = '';
    topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.innerText = t.name;
        conceptSelect.appendChild(opt);
    });

    cmdCurrentStepIndex = 0;
    cmdSessionVars = {};
    updateCheatSheet();
}

function updateCheatSheet() {
    const langSelect = document.getElementById('cmd-lang-select');
    const conceptSelect = document.getElementById('cmd-concept-select');
    const how = document.getElementById('cheat-how');
    const think = document.getElementById('cheat-think');
    const misses = document.getElementById('cheat-misses');
    const stepIndicator = document.getElementById('cmd-step-indicator');

    if (!langSelect || !conceptSelect || !how || !think || !misses) return;

    const lang = langSelect.value;
    const conceptId = conceptSelect.value;
    const topics = CMD_PLAYGROUND_TOPICS[lang] || [];
    const topic = topics.find(t => t.id === conceptId);

    if (topic && topic.steps && topic.steps[cmdCurrentStepIndex]) {
        const step = topic.steps[cmdCurrentStepIndex];
        how.innerText = step.how;
        think.innerText = step.think;
        misses.innerText = step.misses;
        
        if (stepIndicator) {
            stepIndicator.innerText = `Steg ${cmdCurrentStepIndex + 1} av ${topic.steps.length}`;
        }
    }
}

function clearTerminalLog() {
    const logContainer = document.getElementById('cmd-terminal-log');
    if (logContainer) {
        logContainer.innerHTML = `
            <p class="term-text text-green">CHRONO-OS [Version 1.0.0]</p>
            <p class="term-text text-green">(c) 2026 Chronosphere Corp. Alla rättigheter reserverade.</p>
            <p class="term-text text-muted" style="margin-top: 5px;">Välj ett språk och ämne till vänster och skriv din kod i prompten nedan för att öva.</p>
        `;
    }
}

function appendTerminalText(text, className) {
    const logContainer = document.getElementById('cmd-terminal-log');
    if (!logContainer) return;

    const p = document.createElement('p');
    p.className = `term-text ${className}`;
    p.innerText = text;
    logContainer.appendChild(p);

    // Keep log short (max 50 lines)
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.firstChild);
    }

    // Auto-scroll log to bottom instantly
    logContainer.scrollTop = logContainer.scrollHeight;
}

function refreshThemeStoreButtons() {
    state.purchasedThemes = state.purchasedThemes || ['theme-default'];
    state.theme = state.theme || 'theme-default';
    state.matrixRainActive = state.matrixRainActive !== undefined ? state.matrixRainActive : false;
    state.companionActive = state.companionActive !== undefined ? state.companionActive : false;
    state.neuralXpMultiplier = state.neuralXpMultiplier !== undefined ? state.neuralXpMultiplier : 1.0;
    
    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
        const item = btn.getAttribute('data-item');
        if (!item) return;
        
        const price = parseInt(btn.getAttribute('data-price'));
        
        if (item.startsWith('theme-')) {
            // Handle VIP locked items
            if (item === 'theme-matrix-rain') {
                if (!isUserPremium()) {
                    btn.innerHTML = '<i class="fa-solid fa-lock"></i> VISA PREVIEW';
                    btn.disabled = false;
                    btn.style.background = 'rgba(255, 215, 0, 0.04)';
                    btn.style.color = '#ffd700';
                    btn.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    btn.style.boxShadow = 'none';
                } else if (state.matrixRainActive) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> AKTIV (PÅ)';
                    btn.disabled = false;
                    btn.style.background = 'rgba(57, 255, 20, 0.2)';
                    btn.style.color = '#39ff14';
                    btn.style.borderColor = '#39ff14';
                    btn.style.boxShadow = '0 0 10px rgba(57, 255, 20, 0.2)';
                } else if (state.purchasedThemes.includes(item)) {
                    btn.innerHTML = '<i class="fa-solid fa-play"></i> STARTA';
                    btn.disabled = false;
                    btn.style.background = 'rgba(255, 255, 255, 0.05)';
                    btn.style.color = 'var(--text-primary)';
                    btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    btn.style.boxShadow = 'none';
                } else {
                    btn.innerHTML = `KÖP (${price} G)`;
                    btn.disabled = false;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.boxShadow = '';
                }
            } else if (item === 'theme-companion') {
                if (!isUserPremium()) {
                    btn.innerHTML = '<i class="fa-solid fa-lock"></i> VISA PREVIEW';
                    btn.disabled = false;
                    btn.style.background = 'rgba(255, 215, 0, 0.04)';
                    btn.style.color = '#ffd700';
                    btn.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    btn.style.boxShadow = 'none';
                } else if (state.companionActive) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> AKTIV (PÅ)';
                    btn.disabled = false;
                    btn.style.background = 'rgba(0, 242, 254, 0.2)';
                    btn.style.color = '#00f2fe';
                    btn.style.borderColor = '#00f2fe';
                    btn.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.2)';
                } else if (state.purchasedThemes.includes(item)) {
                    btn.innerHTML = '<i class="fa-solid fa-play"></i> STARTA';
                    btn.disabled = false;
                    btn.style.background = 'rgba(255, 255, 255, 0.05)';
                    btn.style.color = 'var(--text-primary)';
                    btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    btn.style.boxShadow = 'none';
                } else {
                    btn.innerHTML = `KÖP (${price} G)`;
                    btn.disabled = false;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.boxShadow = '';
                }
            } else if (item === 'theme-neural-booster') {
                if (!isUserPremium()) {
                    btn.innerHTML = '<i class="fa-solid fa-lock"></i> VISA PREVIEW';
                    btn.disabled = false;
                    btn.style.background = 'rgba(255, 215, 0, 0.04)';
                    btn.style.color = '#ffd700';
                    btn.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    btn.style.boxShadow = 'none';
                } else if (state.neuralXpMultiplier > 1.1) {
                    btn.innerHTML = '<i class="fa-solid fa-bolt"></i> DUBBEL XP (AKTIV)';
                    btn.disabled = true;
                    btn.style.background = 'rgba(255, 215, 0, 0.18)';
                    btn.style.color = '#ffd700';
                    btn.style.borderColor = '#ffd700';
                    btn.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.3)';
                } else if (state.purchasedThemes.includes(item)) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> AKTIVERAD';
                    btn.disabled = true;
                    btn.style.background = 'rgba(255, 215, 0, 0.1)';
                    btn.style.color = '#ffd700';
                    btn.style.borderColor = '#ffd700';
                    btn.style.boxShadow = 'none';
                } else {
                    btn.innerHTML = `KÖP (${price} G)`;
                    btn.disabled = false;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.boxShadow = '';
                }
            } else {
                // Normal theme cards
                if (state.theme === item) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> AKTIV (VALT)';
                    btn.disabled = true;
                    btn.style.background = 'rgba(0, 242, 254, 0.15)';
                    btn.style.color = 'var(--neon-cyan)';
                    btn.style.borderColor = 'var(--neon-cyan)';
                    btn.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.2)';
                } else if (state.purchasedThemes.includes(item)) {
                    btn.innerHTML = '<i class="fa-solid fa-unlock"></i> AKTIVERA';
                    btn.disabled = false;
                    btn.style.background = 'rgba(255, 255, 255, 0.05)';
                    btn.style.color = 'var(--text-primary)';
                    btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    btn.style.boxShadow = 'none';
                } else {
                    btn.innerHTML = `KÖP (${price} GOLD)`;
                    btn.disabled = false;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.boxShadow = '';
                }
            }
        }
    });
}

// Live Matrix Digital Rain Backdrop Canvas Engine
let matrixInterval = null;
function initMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charArr = chars.split("");
    
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * -100; // Delay startup drops
    }
    
    if (matrixInterval) clearInterval(matrixInterval);
    
    function draw() {
        if (!state.matrixRainActive) {
            clearInterval(matrixInterval);
            matrixInterval = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff66';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = charArr[Math.floor(Math.random() * charArr.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    matrixInterval = setInterval(draw, 33);
}

// Window resize support for Matrix Rain
window.addEventListener('resize', () => {
    if (state.matrixRainActive) {
        const canvas = document.getElementById('matrix-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initMatrixRain();
        }
    }
});

// Animate Nano-Buster V3 Companion Bot wiggles, blinks, and jokes
let companionTimer = null;
const PET_JOKES = [
    "Skriver du kod, eller spelar du bara gitarr? ( ^_^ )",
    "Gör dig redo för en server-breach! ( o_o )",
    "Glöm inte att spara din speltillgång! ( ^_^ )",
    "Är Busters ränta lite för hög idag? ( >_< )",
    "Din AP är stark i cyberspace! ( o_o )",
    "Min neurala booster vibrerar av spänning! ( *_* )",
    "Din syntax är otroligt vacker. ( ^_^ )",
    "Systemet är online, kodregnet faller! ( o_o )"
];

function initCyberCompanion() {
    if (!state.companionActive) return;
    
    const petContainer = document.getElementById('cyber-pet-container');
    if (petContainer) {
        petContainer.classList.remove('hidden');
    }
    
    if (companionTimer) clearInterval(companionTimer);
    
    function animatePet() {
        const ascii = document.getElementById('pet-ascii-art');
        const speech = document.getElementById('pet-speech');
        if (!ascii || !speech) return;
        
        const eyes = [" o_o ", " ^_^ ", " >_< ", " -_- ", " *_* "];
        const selectedEye = eyes[Math.floor(Math.random() * eyes.length)];
        
        ascii.innerHTML = `   [ ${selectedEye} ]\n  /|  *  |\\\n  / \\___/ \\`;
        
        const joke = PET_JOKES[Math.floor(Math.random() * PET_JOKES.length)];
        speech.innerText = joke.split(" (")[0];
    }
    
    animatePet();
    companionTimer = setInterval(animatePet, 15000);
}

// ==========================================
// 12.5. V7.1 PREMIUM PREVIEW ENGINE & COMPANION CONTROLS
// ==========================================
let previewMatrixInterval = null;
let previewCompanionInterval = null;

function closeVipPreview() {
    const modal = document.getElementById('vip-preview-modal');
    if (modal) modal.classList.remove('active');
    if (previewMatrixInterval) {
        clearInterval(previewMatrixInterval);
        previewMatrixInterval = null;
    }
    if (previewCompanionInterval) {
        clearInterval(previewCompanionInterval);
        previewCompanionInterval = null;
    }
    const visualBox = document.getElementById('vip-preview-visual');
    if (visualBox) visualBox.innerHTML = '';
}

function openVipPreview(itemKey) {
    const modal = document.getElementById('vip-preview-modal');
    if (!modal) return;
    
    closeVipPreview(); // Ensure clean slate
    
    modal.classList.add('active');
    
    const titleEl = document.getElementById('vip-preview-title');
    const descEl = document.getElementById('vip-preview-description');
    const visualBox = document.getElementById('vip-preview-visual');
    const actionBtn = document.getElementById('vip-modal-action-btn');
    
    if (!titleEl || !descEl || !visualBox || !actionBtn) return;
    
    // Bind close btn
    const closeBtn = document.getElementById('close-vip-preview-modal');
    if (closeBtn) {
        closeBtn.onclick = closeVipPreview;
    }
    
    let title = "";
    let desc = "";
    let price = 0;
    
    actionBtn.disabled = false;
    actionBtn.style.opacity = '1';
    
    if (itemKey === 'theme-matrix-rain') {
        title = "Matrix Rain Backdrop";
        desc = "Strömma grön källkod live i bakgrunden bakom alla dina glassmorphic-fönster! Drivs av en extremt lättviktig, högpresterande renderare i cyberspace.";
        price = 150;
        
        // Setup Canvas Matrix Rain inside preview
        const canvas = document.createElement('canvas');
        canvas.id = 'preview-matrix-canvas';
        visualBox.appendChild(canvas);
        
        // Wait for DOM layout
        setTimeout(() => {
            canvas.width = visualBox.clientWidth || 300;
            canvas.height = visualBox.clientHeight || 180;
            const ctx = canvas.getContext('2d');
            const fontSize = 10;
            const columns = Math.floor(canvas.width / fontSize) + 1;
            const drops = Array(columns).fill(0);
            
            previewMatrixInterval = setInterval(() => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#39ff14';
                ctx.font = fontSize + 'px monospace';
                
                for (let i = 0; i < drops.length; i++) {
                    const text = String.fromCharCode(33 + Math.random() * 93);
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }, 40);
        }, 100);
        
    } else if (itemKey === 'theme-companion') {
        title = "Nano-Buster V3 Companion";
        desc = "Din helt egna interaktiva cyber-assistent! Svävar i din HUD, blinkar, gör roliga ASCII-miner och levererar ständigt fyndiga hacker-skämt och moraliskt stöd.";
        price = 200;
        
        // Setup ASCII Bot preview
        const wrap = document.createElement('div');
        wrap.className = 'mini-pet-preview-wrap';
        wrap.innerHTML = `
            <pre class="mini-pet-ascii" id="mini-preview-pet-ascii"></pre>
            <div class="mini-pet-bubble" id="mini-preview-pet-bubble"></div>
        `;
        visualBox.appendChild(wrap);
        
        const asciiEl = document.getElementById('mini-preview-pet-ascii');
        const bubbleEl = document.getElementById('mini-preview-pet-bubble');
        
        const petStates = [
            { eye: " o_o ", joke: "Kodregnet faller perfekt!" },
            { eye: " ^_^ ", joke: "Vilken enastående källkod!" },
            { eye: " >_< ", joke: "Hoppsan, syntax error i molnet?" },
            { eye: " *_* ", joke: "Jag älskar din progress, Creator!" }
        ];
        let index = 0;
        
        function tickMiniPet() {
            const current = petStates[index % petStates.length];
            if (asciiEl) asciiEl.innerHTML = `   [ ${current.eye} ]\n  /|  *  |\\\n  / \\___/ \\`;
            if (bubbleEl) bubbleEl.innerText = current.joke;
            index++;
        }
        tickMiniPet();
        previewCompanionInterval = setInterval(tickMiniPet, 2500);
        
    } else if (itemKey === 'theme-neural-booster') {
        title = "Neural Overclock Booster";
        desc = "Maxa din intelligens progression permanent! Denna neurala booster injicerar överklockning i din hjärnbark och ger dig DUBBEL XP (2.0x permanent) på alla dina quests.";
        price = 250;
        
        // Setup Chip rotating visual preview
        const wrap = document.createElement('div');
        wrap.className = 'mini-booster-preview-wrap';
        wrap.innerHTML = `
            <i class="fa-solid fa-microchip mini-booster-chip"></i>
            <div class="mini-booster-hud">XP MULTIPLIER: 2.0x (AKTIV)</div>
        `;
        visualBox.appendChild(wrap);
    }
    
    titleEl.innerText = title;
    descEl.innerText = desc;
    
    // Configure Action Button
    if (!isUserPremium()) {
        actionBtn.innerHTML = '<i class="fa-solid fa-crown"></i> LÅS UPP CREATOR VIP (GRATIS)';
        actionBtn.onclick = function() {
            closeVipPreview();
            
            // Turn off simulation mode & unlock
            state.simulatedGratis = false;
            state.isPremium = true;
            
            const simCheckbox = document.getElementById('vip-sim-checkbox');
            if (simCheckbox) simCheckbox.checked = false;
            
            saveGame();
            
            // Spectacular unlock visual/audio sequence
            document.body.classList.add('vip-unlock-flash');
            setTimeout(() => {
                document.body.classList.remove('vip-unlock-flash');
            }, 600);
            
            notif('CREATOR VIP AKTIVERAD! Grattis!', 'success');
            busterDialogue("SKAPARNYCKEL ACCEPTERAD! Välkommen tillbaka Creator VIP! Alla dina premium-förmåner är återställda!");
            
            // Fully reload layout states
            const creatorBadge = document.getElementById('hud-creator-badge');
            if (creatorBadge) creatorBadge.style.display = 'flex';
            
            refreshThemeStoreButtons();
            updateHUD();
        };
    } else {
        // User IS VIP
        const isOwned = state.purchasedThemes.includes(itemKey);
        
        if (itemKey === 'theme-matrix-rain') {
            if (state.matrixRainActive) {
                actionBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> INAKTIVERA KODREGN';
                actionBtn.onclick = () => {
                    closeVipPreview();
                    state.matrixRainActive = false;
                    document.body.classList.remove('matrix-rain-active');
                    refreshThemeStoreButtons();
                    saveGame();
                    notif('Matrix-regn avstängt.', 'info');
                    busterDialogue("Matrix-regn avstängt.");
                };
            } else if (isOwned) {
                actionBtn.innerHTML = '<i class="fa-solid fa-play"></i> AKTIVERA KODREGN';
                actionBtn.onclick = () => {
                    closeVipPreview();
                    state.matrixRainActive = true;
                    document.body.classList.add('matrix-rain-active');
                    initMatrixRain();
                    refreshThemeStoreButtons();
                    saveGame();
                    notif('Matrix-regn aktiverat.', 'success');
                    busterDialogue("Matrix-regn rinner nu live.");
                };
            } else {
                actionBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> KÖP NÄR DU VILL (${price} G)`;
                actionBtn.onclick = () => {
                    closeVipPreview();
                    const shopBtn = document.querySelector(`.shop-buy-btn[data-item="${itemKey}"]`);
                    if (shopBtn) shopBtn.click();
                };
            }
        } else if (itemKey === 'theme-companion') {
            if (state.companionActive) {
                actionBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> INAKTIVERA COMPANION';
                actionBtn.onclick = () => {
                    closeVipPreview();
                    state.companionActive = false;
                    const petContainer = document.getElementById('cyber-pet-container');
                    if (petContainer) petContainer.classList.add('hidden');
                    refreshThemeStoreButtons();
                    saveGame();
                    notif('Nano-Buster V3 standbyläge.', 'info');
                };
            } else if (isOwned) {
                actionBtn.innerHTML = '<i class="fa-solid fa-play"></i> AKTIVERA COMPANION';
                actionBtn.onclick = () => {
                    closeVipPreview();
                    state.companionActive = true;
                    initCyberCompanion();
                    refreshThemeStoreButtons();
                    saveGame();
                    notif('Companion aktiverat.', 'success');
                };
            } else {
                actionBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> KÖP NÄR DU VILL (${price} G)`;
                actionBtn.onclick = () => {
                    closeVipPreview();
                    const shopBtn = document.querySelector(`.shop-buy-btn[data-item="${itemKey}"]`);
                    if (shopBtn) shopBtn.click();
                };
            }
        } else if (itemKey === 'theme-neural-booster') {
            if (isOwned) {
                actionBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> DUBBEL XP AKTIV';
                actionBtn.disabled = true;
                actionBtn.style.opacity = '0.7';
                actionBtn.onclick = null;
            } else {
                actionBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> KÖP NÄR DU VILL (${price} G)`;
                actionBtn.onclick = () => {
                    closeVipPreview();
                    const shopBtn = document.querySelector(`.shop-buy-btn[data-item="${itemKey}"]`);
                    if (shopBtn) shopBtn.click();
                };
            }
        }
    }
}


// ==========================================
// 12.6. V7.2 COLOSSEUM GAME ENGINES (RAID, BLITZ, GAUNTLET)
// ==========================================

// --- ENGINE 1: VOID CORE RAID ---
let raidBossHp = 300;
let playerShield = 200;
let raidTimer = null;
let currentRaidQuestion = null;
let crewCooldowns = { samurai: 0, sql: 0, overlord: 0 };
let crewTimers = { samurai: null, sql: null, overlord: null };

const RAID_QUESTIONS = [
    { q: "Vad returnerar uttrycket '5' === 5 i JavaScript?", a: "false", c: ["true", "false", "undefined", "TypeError"] },
    { q: "Vilket tecken används för kommentarer i Python?", a: "#", c: ["//", "/*", "#", "<!--"] },
    { q: "Vilken enhet anger relativ storlek baserat på root-elementets font-size i CSS?", a: "rem", c: ["em", "rem", "px", "vh"] },
    { q: "Vad kallas en funktion som anropar sig själv?", a: "Rekursiv", c: ["Iteration", "Rekursiv", "Callback", "Holografisk"] },
    { q: "Vad blir resultatet av 10 % 3 i programmering?", a: "1", c: ["3.33", "0", "1", "3"] },
    { q: "Vilken SQL-klausul används för att filtrera rader?", a: "WHERE", c: ["HAVING", "GROUP BY", "WHERE", "SELECT"] }
];

function logRaidCombat(msg, type = 'system-notif') {
    const terminal = document.getElementById('combat-log-terminal');
    if (!terminal) return;
    const div = document.createElement('div');
    div.className = `combat-log-entry ${type}`;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

function startVoidRaid() {
    document.getElementById('arena-lobby-view').style.display = 'none';
    document.getElementById('arena-raid-view').style.display = 'block';
    
    raidBossHp = 300;
    playerShield = 200;
    currentRaidQuestion = null;
    crewCooldowns = { samurai: 0, sql: 0, overlord: 0 };
    
    // Clear old intervals
    if (raidTimer) clearInterval(raidTimer);
    Object.values(crewTimers).forEach(t => { if (t) clearInterval(t); });
    
    // Reset visual bars
    document.getElementById('boss-hp-fill').style.width = '100%';
    document.getElementById('boss-hp-text').innerText = '300 / 300 HP';
    document.getElementById('player-shield-fill').style.width = '100%';
    document.getElementById('player-shield-text').innerText = '200 / 200 SP';
    
    // Reset cooldown overlays visually
    document.getElementById('cooldown-samurai').style.height = '0%';
    document.getElementById('cooldown-sql').style.height = '0%';
    document.getElementById('cooldown-overlord').style.height = '0%';
    
    // Enable crew buttons
    document.getElementById('skill-btn-samurai').disabled = false;
    document.getElementById('skill-btn-sql').disabled = false;
    document.getElementById('skill-btn-overlord').disabled = false;
    
    // Clear terminal
    const terminal = document.getElementById('combat-log-terminal');
    if (terminal) terminal.innerHTML = '';
    
    logRaidCombat("STRID INITIERAD: APOCALYPSE_CORE_AI detekterad. Beskydda sköldarna!", 'system-notif');
    logRaidCombat("Deployat Syndicate-crew är i beredskap. Klicka kasta spell-kod för att attackera!", 'system-notif');
    
    // Hide choice box
    document.getElementById('raid-interaction-box').style.display = 'none';
    
    // Bind attack trigger
    document.getElementById('raid-attack-trigger').onclick = generateRaidQuestion;
    
    // Bind exit button
    document.getElementById('exit-raid-btn').onclick = () => {
        if (confirm("Är du säker på att du vill fly fältet? Bossen kommer att regenerera.")) {
            endVoidRaid(false);
        }
    };
    
    // Bind Crew buttons
    document.getElementById('skill-btn-samurai').onclick = () => triggerCrewAbility('samurai');
    document.getElementById('skill-btn-sql').onclick = () => triggerCrewAbility('sql');
    document.getElementById('skill-btn-overlord').onclick = () => triggerCrewAbility('overlord');
    
    // Start Boss Attack clock
    raidTimer = setInterval(bossAttackCycle, 3500);
}

function bossAttackCycle() {
    if (raidBossHp <= 0 || playerShield <= 0) return;
    
    const dmg = Math.floor(Math.random() * 11) + 12; // 12-22 damage
    playerShield = Math.max(0, playerShield - dmg);
    
    document.getElementById('player-shield-fill').style.width = `${(playerShield / 200) * 100}%`;
    document.getElementById('player-shield-text').innerText = `${playerShield} / 200 SP`;
    
    // Trigger red flash laser sweep
    const flash = document.getElementById('laser-flash-effect');
    if (flash) {
        flash.className = 'laser-flash shoot-red';
        setTimeout(() => { flash.className = 'laser-flash'; }, 500);
    }
    
    logRaidCombat(`Apocalypse AI avfyrar en plasma-spik! Sköldarna förlorar -${dmg} SP.`, 'boss-hit');
    
    if (playerShield <= 0) {
        endVoidRaid(false);
    }
}

function triggerCrewAbility(crewId) {
    if (raidBossHp <= 0 || playerShield <= 0) return;
    if (crewCooldowns[crewId] > 0) return;
    
    const btn = document.getElementById(`skill-btn-${crewId}`);
    const cooldownOverlay = document.getElementById(`cooldown-${crewId}`);
    
    if (crewId === 'samurai') {
        // Massive crit slice
        const dmg = Math.floor(Math.random() * 16) + 60; // 60-75 damage
        raidBossHp = Math.max(0, raidBossHp - dmg);
        
        document.getElementById('boss-hp-fill').style.width = `${(raidBossHp / 300) * 100}%`;
        document.getElementById('boss-hp-text').innerText = `${raidBossHp} / 300 HP`;
        
        const flash = document.getElementById('laser-flash-effect');
        if (flash) {
            flash.className = 'laser-flash shoot-purple';
            setTimeout(() => { flash.className = 'laser-flash'; }, 400);
        }
        
        logRaidCombat(`Samurai laddar Flexbox-Klingan! Kritiskt snitt utdelat: -${dmg} DMG på Void Core!`, 'crit-slice');
        crewCooldowns.samurai = 15; // 15s cooldown
        
    } else if (crewId === 'sql') {
        // JS Shield Healing
        const heal = 50;
        playerShield = Math.min(200, playerShield + heal);
        
        document.getElementById('player-shield-fill').style.width = `${(playerShield / 200) * 100}%`;
        document.getElementById('player-shield-text').innerText = `${playerShield} / 200 SP`;
        
        logRaidCombat(`Sarah_SQL kör en återställnings-query. Sköldar laddade med +${heal} SP.`, 'crew-heal');
        crewCooldowns.sql = 12; // 12s cooldown
        
    } else if (crewId === 'overlord') {
        // Fast buffer recharge
        const dmg = 30;
        raidBossHp = Math.max(0, raidBossHp - dmg);
        
        document.getElementById('boss-hp-fill').style.width = `${(raidBossHp / 300) * 100}%`;
        document.getElementById('boss-hp-text').innerText = `${raidBossHp} / 300 HP`;
        
        // Overclock player shield (can go past max temporarily)
        playerShield += 30;
        document.getElementById('player-shield-fill').style.width = `${Math.min(100, (playerShield / 200) * 100)}%`;
        document.getElementById('player-shield-text').innerText = `${playerShield} / 200 SP`;
        
        logRaidCombat(`Buffer Overlord injicerar en nätverks-buff! -30 DMG på AI och +30 SP temporär buffer-sköld!`, 'system-notif');
        crewCooldowns.overlord = 10; // 10s cooldown
    }
    
    // Visualise Cooldown Height ticking
    if (btn && cooldownOverlay) {
        btn.disabled = true;
        let cooldownLeft = crewCooldowns[crewId];
        cooldownOverlay.style.style = 'none';
        cooldownOverlay.style.height = '100%';
        
        crewTimers[crewId] = setInterval(() => {
            cooldownLeft -= 0.1;
            const pct = (cooldownLeft / crewCooldowns[crewId]) * 100;
            cooldownOverlay.style.height = `${pct}%`;
            
            if (cooldownLeft <= 0) {
                clearInterval(crewTimers[crewId]);
                crewCooldowns[crewId] = 0;
                btn.disabled = false;
                cooldownOverlay.style.height = '0%';
            }
        }, 100);
    }
    
    if (raidBossHp <= 0) {
        endVoidRaid(true);
    }
}

function generateRaidQuestion() {
    if (raidBossHp <= 0 || playerShield <= 0) return;
    
    const box = document.getElementById('raid-interaction-box');
    const qText = document.getElementById('raid-question-text');
    const list = document.getElementById('raid-choices-list');
    
    if (!box || !qText || !list) return;
    
    box.style.display = 'block';
    list.innerHTML = '';
    
    const randomQ = RAID_QUESTIONS[Math.floor(Math.random() * RAID_QUESTIONS.length)];
    currentRaidQuestion = randomQ;
    
    qText.innerText = randomQ.q;
    
    randomQ.c.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'crew-skill-btn';
        btn.style.textAlign = 'left';
        btn.style.padding = '8px';
        btn.innerText = choice;
        
        btn.onclick = () => {
            if (choice === currentRaidQuestion.a) {
                // Correct spell!
                const dmg = 45;
                raidBossHp = Math.max(0, raidBossHp - dmg);
                document.getElementById('boss-hp-fill').style.width = `${(raidBossHp / 300) * 100}%`;
                document.getElementById('boss-hp-text').innerText = `${raidBossHp} / 300 HP`;
                
                const flash = document.getElementById('laser-flash-effect');
                if (flash) {
                    flash.className = 'laser-flash shoot-green';
                    setTimeout(() => { flash.className = 'laser-flash'; }, 450);
                }
                
                logRaidCombat(`SPELL UTKASTAD UTAN FEL! Brandvägg genombjuten: -${dmg} DMG på Void Core!`, 'player-hit');
                box.style.display = 'none';
                
                if (raidBossHp <= 0) {
                    endVoidRaid(true);
                }
            } else {
                // Fail - Retaliatory strike!
                const backDmg = 25;
                playerShield = Math.max(0, playerShield - backDmg);
                document.getElementById('player-shield-fill').style.width = `${(playerShield / 200) * 100}%`;
                document.getElementById('player-shield-text').innerText = `${playerShield} / 200 SP`;
                
                logRaidCombat(`SYNTAX ERROR I SPELLET! Retaliations-spik avfyrad av AI: Din sköld förlorar -${backDmg} SP!`, 'boss-hit');
                box.style.display = 'none';
                
                if (playerShield <= 0) {
                    endVoidRaid(false);
                }
            }
        };
        list.appendChild(btn);
    });
}

function endVoidRaid(victory) {
    if (raidTimer) clearInterval(raidTimer);
    Object.values(crewTimers).forEach(t => { if (t) clearInterval(t); });
    
    document.getElementById('arena-raid-view').style.display = 'none';
    document.getElementById('arena-lobby-view').style.display = 'block';
    
    if (victory) {
        const rewardGold = 150;
        const rewardXp = 150;
        
        gainRewards(rewardXp, rewardGold, 'kod');
        state.raidsCompleted = (state.raidsCompleted || 0) + 1;
        
        alert(`VICTORIA! Du och ditt Syndicate crew har förintat Apocalypse AI kärna och återställt nätverket!\nBelöningar: +${rewardGold} Guld, +${rewardXp} XP!`);
        busterDialogue("Felfritt samarbete! Du och din besättning har raderat glitch-kärnan. Det kallar jag äkta cyber-taktik.");
    } else {
        alert("MISSLYCKANDE: Sköldarna bröts och systemet överhettades. Du tvingades fly striden.");
        busterDialogue("Reträtt?! Ajdå, bossen visade sig vara lite för stark för ditt nuvarande neurala gränssnitt. Gå hem och uppgradera.");
    }
    
    saveGame();
}


// --- ENGINE 2: NEURAL BLITZ SPEEDRUN ---
let blitzTime = 30.0;
let blitzScore = 0;
let blitzInterval = null;
let currentBlitzSnippet = "";

const BLITZ_SNIPPETS = [
    "print(\"HELLO\")",
    "for i in range(10):",
    "let data = []",
    "const unique = new Set()",
    "let v = a if a > b else b",
    "const mod = x % 2;",
    "def hack(node):",
    "let r = fetch(url);",
    "if user == \"admin\":",
    "const isVip = true;",
    "class CyberDeck:",
    "import sys",
    "data.append(x)",
    "return true",
    "console.log(msg);"
];

function startNeuralBlitz() {
    blitzTime = 30.0;
    blitzScore = 0;
    currentBlitzSnippet = "";
    
    const clock = document.getElementById('blitz-timer-clock');
    if (clock) {
        clock.classList.remove('timer-warning');
        clock.innerText = '30.0s';
    }
    
    document.getElementById('blitz-score-display').innerText = 'POÄNG: 0';
    document.getElementById('blitz-firewall-level').innerText = 'FIREWALL LAYER: 1';
    
    // Enable typing input
    const input = document.getElementById('blitz-typing-input');
    if (input) {
        input.disabled = false;
        input.placeholder = "Skriv koden här så fort du kan!";
        input.value = "";
        input.focus();
        
        // Remove old listeners and bind typing checker
        input.oninput = checkBlitzInput;
    }
    
    // Disable start button
    document.getElementById('blitz-start-btn').disabled = true;
    
    generateBlitzSnippet();
    
    if (blitzInterval) clearInterval(blitzInterval);
    blitzInterval = setInterval(tickBlitz, 100);
    
    notif('Blitz startad! Klockan tickar!', 'success');
}

function tickBlitz() {
    blitzTime -= 0.1;
    const clock = document.getElementById('blitz-timer-clock');
    
    if (clock) {
        clock.innerText = `${Math.max(0, blitzTime).toFixed(1)}s`;
        if (blitzTime <= 7.0) {
            clock.classList.add('timer-warning');
        } else {
            clock.classList.remove('timer-warning');
        }
    }
    
    if (blitzTime <= 0) {
        endNeuralBlitz();
    }
}

function generateBlitzSnippet() {
    const display = document.getElementById('blitz-prompt-text');
    if (!display) return;
    
    const rand = BLITZ_SNIPPETS[Math.floor(Math.random() * BLITZ_SNIPPETS.length)];
    currentBlitzSnippet = rand;
    display.innerText = rand;
    
    const input = document.getElementById('blitz-typing-input');
    if (input) input.value = "";
}

function checkBlitzInput() {
    const inputVal = this.value;
    const display = document.getElementById('blitz-prompt-text');
    if (!display) return;
    
    let rendered = "";
    let isMatch = true;
    
    for (let i = 0; i < currentBlitzSnippet.length; i++) {
        if (i < inputVal.length) {
            if (inputVal[i] === currentBlitzSnippet[i] && isMatch) {
                rendered += `<span class="matched">${currentBlitzSnippet[i]}</span>`;
            } else {
                isMatch = false;
                rendered += `<span class="mismatched">${currentBlitzSnippet[i]}</span>`;
            }
        } else {
            rendered += currentBlitzSnippet[i];
        }
    }
    
    display.innerHTML = rendered;
    
    // Exact full match completed!
    if (inputVal === currentBlitzSnippet) {
        blitzScore++;
        blitzTime += 4.0; // add 4 seconds!
        
        document.getElementById('blitz-score-display').innerText = `POÄNG: ${blitzScore}`;
        document.getElementById('blitz-firewall-level').innerText = `FIREWALL LAYER: ${blitzScore + 1}`;
        document.getElementById('blitz-max-score-hud').innerText = `COMBO: ${(1.0 + (blitzScore * 0.1)).toFixed(1)}x`;
        
        notif('+4s brandvägg sprängd!', 'success');
        generateBlitzSnippet();
    }
}

function endNeuralBlitz() {
    if (blitzInterval) clearInterval(blitzInterval);
    
    const input = document.getElementById('blitz-typing-input');
    if (input) {
        input.disabled = true;
        input.value = "";
        input.placeholder = "Tiden ute! Hacket avslutat.";
    }
    
    document.getElementById('blitz-start-btn').disabled = false;
    
    const goldEarned = blitzScore * 8;
    const xpEarned = blitzScore * 12;
    
    gainRewards(xpEarned, goldEarned, 'kod');
    
    let msg = `TRACE FULLBORDAD: brandväggar anslöt och stängde ner dig. Du sprängde ${blitzScore} lager och belönades med +${goldEarned} Guld, +${xpEarned} XP!`;
    
    if (blitzScore > state.blitzHighScore) {
        state.blitzHighScore = blitzScore;
        msg += `\n🌟 NYTT PERSONLIGT REKORD: ${blitzScore}!`;
        notif('NYTT BLITZ-REKORD UTGIVET!', 'success');
    }
    
    alert(msg);
    busterDialogue(`Neural Blitz avbruten. Du lyckades knäcka ${blitzScore} lager brandväggar. Ett helt okej Netrunner blitz-hastighet!`);
    
    // Update lobby record
    const recordHud = document.getElementById('lobby-blitz-record');
    if (recordHud) recordHud.innerText = `${state.blitzHighScore} Brandväggar`;
    const inGameRecord = document.getElementById('blitz-record-hud');
    if (inGameRecord) inGameRecord.innerText = `PERSONLIGT REKORD: ${state.blitzHighScore}`;
    
    saveGame();
}


// --- ENGINE 3: DAILY CRYPTO GAUNTLET ---
const GAUNTLET_PHRASES = [
    { dec: "CYBERPUNK", enc: "F|ehu#Srxqn", shift: -3 },
    { dec: "NETRUNNER", enc: "Qhwuxqqhu", shift: -3 },
    { dec: "CHRONOSPHERE", enc: "Fkurqrvskhuh", shift: -3 },
    { dec: "DATABASE", enc: "Gdwdedvh", shift: -3 },
    { dec: "VOID_CORE", enc: "Yrlg#Fruh", shift: -3 },
    { dec: "SYNTAX_ERROR", enc: "V|qwd{#Huuru", shift: -3 }
];

function loadDailyGauntlet() {
    document.getElementById('arena-lobby-view').style.display = 'none';
    document.getElementById('arena-gauntlet-view').style.display = 'block';
    
    const streakEl = document.getElementById('gauntlet-streak-count');
    if (streakEl) streakEl.innerText = state.dailyStreak || 0;
    
    const todayStr = new Date().toDateString();
    
    if (state.lastGauntletCompleted === todayStr) {
        // Already completed today!
        document.getElementById('gauntlet-active-panel').style.display = 'none';
        document.getElementById('gauntlet-victory-panel').style.display = 'flex';
    } else {
        // Not completed yet
        document.getElementById('gauntlet-active-panel').style.display = 'flex';
        document.getElementById('gauntlet-victory-panel').style.display = 'none';
        
        // Generate daily puzzle deterministically based on date to ensure everyone gets the same puzzle each day!
        const dayOfMonth = new Date().getDate();
        const puzzle = GAUNTLET_PHRASES[dayOfMonth % GAUNTLET_PHRASES.length];
        
        const codeEl = document.getElementById('gauntlet-cipher-code');
        const hintEl = document.getElementById('gauntlet-cipher-hint');
        
        if (codeEl && hintEl) {
            codeEl.innerText = puzzle.enc;
            hintEl.innerHTML = `<i class="fa-solid fa-key text-gold"></i> ALGORITM: <strong>Caesar chiffer</strong> // SKIFTFAKTOR: <strong class="text-gold" id="gauntlet-shift-val">${puzzle.shift}</strong>`;
        }
        
        const input = document.getElementById('gauntlet-solution-input');
        if (input) input.value = "";
        
        // Bind submit button
        document.getElementById('gauntlet-submit-trigger').onclick = checkGauntletAnswer;
    }
    
    // Bind Exit
    document.getElementById('exit-gauntlet-btn').onclick = () => {
        document.getElementById('arena-gauntlet-view').style.display = 'none';
        document.getElementById('arena-lobby-view').style.display = 'block';
        
        // Update lobby streak stat
        const lobbyStreak = document.getElementById('lobby-gauntlet-streak');
        if (lobbyStreak) lobbyStreak.innerText = `${state.dailyStreak || 0} Dagliga`;
    };
}

function checkGauntletAnswer() {
    const input = document.getElementById('gauntlet-solution-input');
    if (!input) return;
    
    const ans = input.value.trim().toUpperCase();
    
    const dayOfMonth = new Date().getDate();
    const puzzle = GAUNTLET_PHRASES[dayOfMonth % GAUNTLET_PHRASES.length];
    
    if (ans === puzzle.dec) {
        // Correct decryption!
        state.lastGauntletCompleted = new Date().toDateString();
        state.dailyStreak = (state.dailyStreak || 0) + 1;
        
        gainRewards(0, 80, 'kod'); // +80 gold reward!
        
        document.getElementById('gauntlet-active-panel').style.display = 'none';
        document.getElementById('gauntlet-victory-panel').style.display = 'flex';
        
        document.getElementById('gauntlet-streak-count').innerText = state.dailyStreak;
        
        notif('Chiffer knäckt! +80 Gold!', 'success');
        busterDialogue(`ENASTÅENDE! Du har dekrypterat loggen "${puzzle.dec}" med skiftfaktor ${puzzle.shift}. Din dagliga streak är nu uppe i ${state.dailyStreak} dagar!`);
        
        saveGame();
    } else {
        // Incorrect
        input.classList.add('error-shake');
        setTimeout(() => { input.classList.remove('error-shake'); }, 500);
        
        notif('Fel dekryptering! Försök igen.', 'error');
        busterDialogue("Nähä du! Den strängen stämmer inte alls med den krypterade chiffernyckeln. Räkna skiftena en gång till...");
    }
}


// ==========================================
// 13. APP STARTUP
// ==========================================
window.addEventListener('load', () => {
    loadGame();
    selectNode('start-1');
    updateSandboxPreview();
    updateMagibokenSnippets();
    initCmdPlayground();
    
    // VIP Simulation Switch Binding
    const simCheckbox = document.getElementById('vip-sim-checkbox');
    if (simCheckbox) {
        simCheckbox.addEventListener('change', function() {
            state.simulatedGratis = this.checked;
            
            // Live toggle elements state
            const creatorBadge = document.getElementById('hud-creator-badge');
            if (isUserPremium()) {
                if (creatorBadge) creatorBadge.style.display = 'flex';
                notif('Creator VIP-behörighet återställd!', 'success');
                busterDialogue("Välkommen tillbaka, Skapare! Alla VIP-kontroller är aktiva.");
            } else {
                if (creatorBadge) creatorBadge.style.display = 'none';
                notif('Simulerar gratis-medlem. Butiken låst.', 'warning');
                busterDialogue("Simuleringsläge: VIP-erbjudanden kräver premium. Klicka Preview för att se förhandsvisningen.");
            }
            
            refreshThemeStoreButtons();
            saveGame();
        });
    }

    // Sub-Tabs Navigation Binding for Shop Card
    const tabStandard = document.getElementById('tab-shop-standard');
    const tabVip = document.getElementById('tab-shop-vip');
    const paneStandard = document.getElementById('shop-pane-standard');
    const paneVip = document.getElementById('shop-pane-vip');
    
    if (tabStandard && tabVip && paneStandard && paneVip) {
        tabStandard.addEventListener('click', () => {
            tabStandard.classList.add('active');
            tabVip.classList.remove('active');
            paneStandard.classList.add('active');
            paneVip.classList.remove('active');
            paneStandard.style.display = 'block';
            paneVip.style.display = 'none';
        });
        tabVip.addEventListener('click', () => {
            tabVip.classList.add('active');
            tabStandard.classList.remove('active');
            paneVip.classList.add('active');
            paneStandard.classList.remove('active');
            paneVip.style.display = 'block';
            paneStandard.style.display = 'none';
        });
    }

    // Eye Buttons VIP Preview click binding
    document.querySelectorAll('.vip-preview-eye-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemKey = this.getAttribute('data-item');
            openVipPreview(itemKey);
        });
    });

    // Companion Minimizer Button & Card restore binding
    const petToggleBtn = document.getElementById('pet-toggle-btn');
    const petContainer = document.getElementById('cyber-pet-container');
    if (petToggleBtn && petContainer) {
        petToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Stop click propagating to the container
            petContainer.classList.toggle('minimized');
            if (petContainer.classList.contains('minimized')) {
                this.innerHTML = '<i class="fa-solid fa-plus"></i>';
                this.title = "Expandera";
                notif('Nano-Buster V3 minimerad.', 'info');
            } else {
                this.innerHTML = '<i class="fa-solid fa-minus"></i>';
                this.title = "Minimera";
                notif('Nano-Buster V3 maximerad.', 'success');
            }
        });
        
        petContainer.addEventListener('click', function() {
            if (this.classList.contains('minimized')) {
                this.classList.remove('minimized');
                if (petToggleBtn) {
                    petToggleBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
                    petToggleBtn.title = "Minimera";
                }
                notif('Nano-Buster V3 återställd.', 'success');
            }
        });
    }
    
    const originalStartQuest = startQuest;
    startQuest = function(questId) {
        document.getElementById('buster-hint-box').style.display = 'none';
        originalStartQuest(questId);
    };
    
    // Bind Arena Lobby Action buttons
    const searchBtn = document.getElementById('arena-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', searchArenaMatch);
    
    const cancelBtn = document.getElementById('cancel-search-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelSearch);
    
    const bossBtn = document.getElementById('arena-boss-btn');
    if (bossBtn) bossBtn.addEventListener('click', () => startArenaMatch(true));
    
    const exitBtn = document.getElementById('exit-match-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            if (isArenaActive) {
                if (confirm("Är du säker på att du vill ge upp matchen? Du kommer att förlora -10 AP.")) {
                    handleMatchLose();
                    exitMatch();
                }
            } else {
                exitMatch();
            }
        });
    }
    
    // Bind Arena Spectator Tab buttons
    const tabPreview = document.getElementById('btn-tab-preview');
    if (tabPreview) {
        tabPreview.addEventListener('click', () => {
            tabPreview.classList.add('active');
            document.getElementById('btn-tab-spectator').classList.remove('active');
            document.getElementById('arena-content-preview').style.display = 'block';
            document.getElementById('arena-content-spectator').style.display = 'none';
        });
    }
    
    const tabSpectator = document.getElementById('btn-tab-spectator');
    if (tabSpectator) {
        tabSpectator.addEventListener('click', () => {
            document.getElementById('btn-tab-preview').classList.remove('active');
            tabSpectator.classList.add('active');
            document.getElementById('arena-content-preview').style.display = 'none';
            document.getElementById('arena-content-spectator').style.display = 'block';
        });
    }
    
    // Bind Cheat Codes Console
    const cheatBtn = document.getElementById('cheat-code-btn');
    if (cheatBtn) cheatBtn.addEventListener('click', redeemPromoCode);
    
    const cheatInput = document.getElementById('cheat-code-input');
    if (cheatInput) {
        cheatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                redeemPromoCode();
            }
        });
    }

    // Bind Custom Promo Code Creator Console
    const createBtn = document.getElementById('create-code-btn');
    if (createBtn) createBtn.addEventListener('click', createPromoCode);

    const createInput = document.getElementById('create-code-input');
    if (createInput) {
        createInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createPromoCode();
            }
        });
    }
    
    // Bind CRT toggle button
    const crtTrigger = document.getElementById('crt-toggle-trigger');
    if (crtTrigger) {
        crtTrigger.addEventListener('click', () => {
            state.crtActive = !state.crtActive;
            if (state.crtActive) {
                document.body.classList.add('crt-active');
                crtTrigger.classList.add('active');
                crtTrigger.querySelector('span').innerText = 'CRT: ON';
                notif('Retro CRT-skärmfilter aktiverat.', 'success');
                busterDialogue("CRT-filter tänt. Känner du de varma, analoga scanlinerna flimra?");
            } else {
                document.body.classList.remove('crt-active');
                crtTrigger.classList.remove('active');
                crtTrigger.querySelector('span').innerText = 'CRT: OFF';
                notif('CRT-skärmfilter inaktiverat.', 'info');
                busterDialogue("CRT-filter släckt. Tillbaka till det moderna digitala gränssnittet.");
            }
            saveGame();
        });
    }

    // Drag-to-Scroll Panorering för stjärnkartan
    const viewport = document.getElementById('skill-tree-viewport');
    if (viewport) {
        let isDown = false;
        let startX, startY;
        let scrollLeft, scrollTop;
        
        viewport.addEventListener('mousedown', (e) => {
            // Dragga endast om vi klickar på bakgrunden/linjerna och inte direkt på noderna/knapparna
            if (e.target.closest('.skill-node') || e.target.closest('.node-start-btn')) return;
            isDown = true;
            viewport.classList.add('grabbing');
            startX = e.pageX - viewport.offsetLeft;
            startY = e.pageY - viewport.offsetTop;
            scrollLeft = viewport.scrollLeft;
            scrollTop = viewport.scrollTop;
        });
        
        viewport.addEventListener('mouseleave', () => {
            isDown = false;
            viewport.classList.remove('grabbing');
        });
        
        viewport.addEventListener('mouseup', () => {
            isDown = false;
            viewport.classList.remove('grabbing');
        });
        
        viewport.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - viewport.offsetLeft;
            const y = e.pageY - viewport.offsetTop;
            const walkX = (x - startX) * 1.5; // Känslighets-multiplikator
            const walkY = (y - startY) * 1.5;
            viewport.scrollLeft = scrollLeft - walkX;
            viewport.scrollTop = scrollTop - walkY;
        });

        // Auto-scrolla till botten vid allra första sidstart
        setTimeout(() => {
            viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight;
        }, 200);
    }
    
    // Bind Colosseum Spelläges lobby buttons (V7.2)
    const startRaidBtn = document.getElementById('colosseum-start-raid');
    if (startRaidBtn) startRaidBtn.addEventListener('click', startVoidRaid);
    
    const startBlitzBtn = document.getElementById('colosseum-start-blitz');
    if (startBlitzBtn) {
        startBlitzBtn.addEventListener('click', () => {
            document.getElementById('arena-lobby-view').style.display = 'none';
            document.getElementById('arena-blitz-view').style.display = 'block';
            
            // Initialise Blitz view state
            document.getElementById('blitz-record-hud').innerText = `PERSONLIGT REKORD: ${state.blitzHighScore || 0}`;
            document.getElementById('blitz-timer-clock').innerText = "30.0s";
            document.getElementById('blitz-prompt-text').innerText = "Klicka STARTA BLITZ i högra spalten för att påbörja brandväggshacket.";
            
            const input = document.getElementById('blitz-typing-input');
            if (input) {
                input.value = "";
                input.disabled = true;
            }
            
            document.getElementById('blitz-start-btn').disabled = false;
        });
    }
    
    const blitzStartBtn = document.getElementById('blitz-start-btn');
    if (blitzStartBtn) blitzStartBtn.addEventListener('click', startNeuralBlitz);
    
    const exitBlitzBtn = document.getElementById('exit-blitz-btn');
    if (exitBlitzBtn) {
        exitBlitzBtn.addEventListener('click', () => {
            if (blitzInterval) clearInterval(blitzInterval);
            document.getElementById('arena-blitz-view').style.display = 'none';
            document.getElementById('arena-lobby-view').style.display = 'block';
            
            const recordHud = document.getElementById('lobby-blitz-record');
            if (recordHud) recordHud.innerText = `${state.blitzHighScore || 0} Brandväggar`;
        });
    }
    
    const startGauntletBtn = document.getElementById('colosseum-start-gauntlet');
    if (startGauntletBtn) startGauntletBtn.addEventListener('click', loadDailyGauntlet);

    // Initialise Lobby UI stats records at page load
    const lobbyBlitz = document.getElementById('lobby-blitz-record');
    if (lobbyBlitz) lobbyBlitz.innerText = `${state.blitzHighScore || 0} Brandväggar`;
    
    const lobbyGauntlet = document.getElementById('lobby-gauntlet-streak');
    if (lobbyGauntlet) lobbyGauntlet.innerText = `${state.dailyStreak || 0} Dagliga`;
    
    notif('Chronosphere aktiverad. Välkommen tillbaka!', 'success');
});
