var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function roll(dice) {
    /**
      * Emulates a dice roll.
      *
      * @param dice - The dice size
      * @returns the random dice roll (number in range of 1 to dice size)
      */
    return Math.floor(Math.random() * dice + 1);
}
function rollStat() {
    /**
      * 3D6 roller for stats.
      *
      * @returns total of three D6 rolls
      **/
    return roll(6) + roll(6) + roll(6);
}
function getBSJson() {
    return __awaiter(this, void 0, void 0, function* () {
        /**
          * Fetches the Broken Shores character json from github
          *
          * @returns text promise
          **/
        const url = "https://raw.githubusercontent.com/snowkeep/bscg/main/data/bscd.json";
        // TODO: remove reload in production
        //let resp = await fetch(url, {cache: "reload"});
        let resp = yield fetch(url);
        return JSON.parse(yield resp.text());
    });
}
function shuffleList(array) {
    /**
      * Shuffles a list
      *
      * @returns a list
      **/
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function getRandomfromList(arr) {
    /**
      * Pulls a random item from a list
      *
      * @returns any (list item type)
      **/
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}
function rollChartopia(id) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
          * API lookup on chartopia for random name
          *
          * @returns name as promise<string>
          **/
        const apiRoot = "https://chartopia.d12dev.com/api/charts";
        let resp = yield fetch(`${apiRoot}/${id}/roll/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ mult: 1 })
        });
        const payload = yield resp.json();
        console.log(payload);
        let name = payload["results"][0];
        if (name.includes("result")) {
            name = name.split("\n")[1];
        }
        return name;
    });
}
;
;
;
;
;
function genChar() {
    return __awaiter(this, void 0, void 0, function* () {
        /**
          * Generates character information
          *
          * @return bsCharacter
          **/
        // Ironsworn, Ravenloft male, Ravenloft female, fantasy, Ulun, Yen
        const nameCharts = [38643, 394, 395, 32000, 59263, 59268];
        const charName = yield rollChartopia(getRandomfromList(nameCharts));
        let stats = {
            str: rollStat(),
            dex: rollStat(),
            con: rollStat(),
            wil: rollStat(),
            int: rollStat(),
            cha: rollStat()
        };
        // modifiers based on picks
        let hpMod = 0;
        let chpMod = 0;
        let ppMod = 0;
        // determine the number of starting spells
        const numSpells = roll(3) - 1;
        console.log(`Taking ${numSpells} spells and  ${5 - numSpells} +20 skills`);
        // get the character data json
        let bsdata = yield getBSJson();
        // shuffle the skill list
        let skills = shuffleList(Object.keys(bsdata["skills"]));
        // one skill gets +60
        const sixty = skills.shift();
        bsdata["skills"][sixty]["score"] = 60;
        // three skills get +40
        for (let _ = 0; _ < 3; _++) {
            const forty = skills.shift();
            bsdata["skills"][forty]["score"] = 40;
        }
        // 5 minus the number of starting spells get +20
        for (let _ = 0; _ < 5 - numSpells; _++) {
            const twenty = skills.shift();
            bsdata["skills"][twenty]["score"] = 20;
        }
        // two skills get +10
        for (let _ = 0; _ < 2; _++) {
            const ten = skills.shift();
            bsdata["skills"][ten]["score"] = 10;
        }
        // rest of the skills get 0
        skills.forEach((name) => { bsdata["skills"][name]["score"] = 0; });
        // spells in place of +20 skills
        // TODO: some idosyncracies adjust spell stats
        let mySpells = [];
        const spells = shuffleList(Object.keys(bsdata["spells"]));
        if (numSpells > 0) {
            for (let i = 0; i < numSpells; i++) {
                const thisSpell = bsdata["spells"][spells[i]];
                mySpells.push({
                    name: spells[i],
                    pp: thisSpell["pp"],
                    range: thisSpell["range"],
                    resisted: thisSpell["resisted"],
                    duration: thisSpell["duration"],
                    description: thisSpell["description"],
                    idiosyncracy: getRandomfromList(bsdata["idiosyncracies"])
                });
            }
        }
        // talents
        const talents = shuffleList(Object.keys(bsdata["talents"]));
        let myTalents = [];
        for (let i = 0; i < 2; i++) {
            const talent = talents[i];
            myTalents.push(`${talent} - ${bsdata["talents"][talent]}`);
            // stat adjustments from the talents
            // there are only 6 that adjust so hardcoding because they're all different - tough to abstract
            switch (talent) {
                case "Ancient Soul":
                    console.log("Modifying PP for Ancient Soul talent");
                    ppMod += 5;
                    break;
                case "Marksman":
                    console.log("Modifying Ranged Weapons for Marksman talent");
                    bsdata["skills"]["Ranged Weapons"]["score"] += 20;
                    break;
                case "Quick-Handed":
                    console.log("Modifying Sleigt of Hand for Quick-Handed talent");
                    bsdata["skills"]["Sleight of Hand"]["score"] += 30;
                    break;
                case "Silent":
                    console.log("Modifying Stealth for Silent talent");
                    bsdata["skills"]["Stealth"]["score"] += 30;
                    break;
                case "Sorcerer":
                    console.log("Adding spell for Sorcerer talent");
                    const thisSpell = bsdata["spells"][spells[numSpells]];
                    mySpells.push({
                        name: spells[i],
                        pp: thisSpell["pp"],
                        range: thisSpell["range"],
                        resisted: thisSpell["resisted"],
                        duration: thisSpell["duration"],
                        description: thisSpell["description"],
                        idiosyncracy: getRandomfromList(bsdata["idiosyncracies"])
                    });
                    break;
                case "Vigorous":
                    console.log("Modifying HP for Vigorous talent");
                    hpMod += 5;
                    break;
            }
            ;
        }
        // modify spells for idiosyncracies
        mySpells.forEach((spell) => {
            if (spell.idiosyncracy.includes("twice as usual PP")) {
                console.log("Adjusting spell due to idiosyncracy");
                spell.pp *= 2;
            }
            else if (spell.idiosyncracy.includes("touch range")) {
                console.log("Adjusting spell due to idiosyncracy");
                spell.range = "Touch";
            }
            else if (spell.idiosyncracy.includes("PP cost reduced")) {
                console.log("Adjusting spell due to idiosyncracy");
                spell.pp = Math.ceil(spell.pp / 2);
            }
        });
        // cult info
        let notes = [];
        notes.push(`Captured by <em>${getRandomfromList(Object.keys(bsdata["cults"]))}</em> because "${getRandomfromList(bsdata["why"])}."`);
        const escape = getRandomfromList(bsdata["escape"]);
        notes.push(`After ${getRandomfromList(bsdata["length"]).toLowerCase()}, ${escape["means"]} to escape.`);
        // adjust skill based on escape method
        const skill = escape["adjust"].replace("+5 ", "");
        console.log(`Adjusting ${skill} skill for escape attempt`);
        bsdata["skills"][skill]["score"] += 5;
        // do we steal something from the cult?
        let myWeapons = [];
        let myItems = [];
        let myNEItems = [];
        if (getRandomfromList([true, false])) {
            let stole = getRandomfromList(Object.keys(bsdata["steal"]));
            let stoleText = stole;
            if (stole.includes("An enchanted weapon")) {
                // roll on the weapons and adjust for enchantment
                const wn = roll(100);
                Object.keys(bsdata["weapons"]).forEach((weapon) => {
                    if ((wn >= bsdata["weapons"][weapon]["min"]) && (wn <= bsdata["weapons"][weapon]["max"])) {
                        const thisWeapon = bsdata["weapons"][weapon];
                        stoleText = `an enchanted ${weapon}`;
                        myWeapons.push({ name: weapon, wtype: thisWeapon["type"], damage: `${thisWeapon["damage"]} + D4`, notes: `enchanted, ${thisWeapon["notes"]}` });
                        myItems.push(`Enchanted ${weapon} (${thisWeapon["weight"]})`);
                        if (weapon == "Bow") {
                            myItems.push("Quiver (UD6 arrows)");
                        }
                    }
                });
            }
            if (bsdata["steal"][stole]["encumbering"]) {
                if (!stoleText.includes("enchanted")) {
                    stoleText = stoleText.replace("3D10", `${roll(10) + roll(10) + roll(10)}`);
                    myItems.push(stoleText);
                }
            }
            else {
                myNEItems.push(stoleText);
            }
            notes.push(`I stole ${stoleText} from the cult.  ${bsdata["steal"][stole]["price"]}.`);
            // reducing from stealing
            const red = bsdata["steal"][stole]["reduce"];
            if (red.slice(0, 1) == "-1") {
                const redStat = stole["reduce"].slice(-3).toLowerCase();
                console.log(`Reducing ${redStat} by 1 because of theft.`);
                stats[redStat] -= 1;
            }
            else if (red == "-5 HP") {
                chpMod -= 5;
                console.log(`Reducing starting HP by 5 because of theft.`);
            }
        }
        // starting coins and ally?
        let wealth = roll(20) + roll(20) + roll(20) + roll(20) + roll(20);
        let rations = roll(4) + 6;
        let ally = getRandomfromList([true, false]);
        if (ally) {
            notes.push(`I freed an ally during my escape`);
            wealth -= 20;
            rations -= 1;
            ally = true;
        }
        myItems.push(`${rations} rations`);
        // weapon
        const wn = roll(100);
        Object.keys(bsdata["weapons"]).forEach((weapon) => {
            if ((wn >= bsdata["weapons"][weapon]["min"]) && (wn <= bsdata["weapons"][weapon]["max"])) {
                const thisWeapon = bsdata["weapons"][weapon];
                myWeapons.push({ name: weapon, wtype: thisWeapon["type"], damage: thisWeapon["damage"], notes: thisWeapon["notes"] });
                myItems.push(`${weapon} (${thisWeapon["weight"]})`);
                if (weapon == "Bow") {
                    myItems.push("Quiver (UD6 arrows)");
                }
            }
        });
        // gear
        // if it starts with Dx, roll and replace
        const gear = getRandomfromList(bsdata["gear"]);
        if (gear[0] == "D") {
            const tokens = gear.split(" ");
            const amount = roll(Number(tokens[0].replace("D", "")));
            tokens.shift();
            myItems.push(`${amount} ${tokens.join(" ")}`);
        }
        else {
            myItems.push(gear);
        }
        // derived values - go last because some of the above adjust stats
        let attribs = {
            brawn: stats.str * 5,
            coordination: stats.dex * 5,
            vitality: stats.con * 5,
            tenacity: stats.wil * 5,
            intellect: stats.int * 5,
            charm: stats.cha * 5
        };
        // set the skills -  after any adjusts
        let mySkills = [];
        for (const name in bsdata["skills"]) {
            mySkills.push({ name: name, stat: bsdata["skills"][name]["attribute"], value: bsdata["skills"][name]["score"] });
        }
        return {
            name: charName,
            hp: stats.con * 2 + hpMod,
            chp: stats.con * 2 + chpMod + hpMod,
            pp: stats.wil + ppMod,
            speed_walk: stats.dex * 2,
            speed_run: stats.dex * 4,
            stats: stats,
            attributes: attribs,
            skills: mySkills,
            talents: myTalents,
            weapons: myWeapons,
            wealth: wealth,
            slots: stats.str + 10,
            items: myItems,
            neitems: myNEItems,
            spells: mySpells,
            ally: ally,
            notes: notes
        };
    });
}
function genHTML() {
    return __awaiter(this, void 0, void 0, function* () {
        /**
          * Creates a bsCharacter and displays it as htmn
          *
          * @returns none
          **/
        const charObject = yield genChar();
        globalChar = charObject;
        console.log(charObject);
        // name
        const nameElem = document.getElementById("charName");
        const headerElem = document.createElement("h1");
        headerElem.textContent = charObject["name"];
        nameElem === null || nameElem === void 0 ? void 0 : nameElem.appendChild(headerElem);
        // stats
        const statTableElem = document.getElementById("stats");
        for (const [name, val] of Object.entries(charObject["stats"])) {
            const rowElem = document.createElement("tr");
            const value = document.createElement("td");
            const stat = document.createElement("td");
            value.textContent = val;
            stat.textContent = name.slice(0, 1).toUpperCase() + name.slice(1);
            rowElem.appendChild(stat);
            rowElem.appendChild(value);
            statTableElem === null || statTableElem === void 0 ? void 0 : statTableElem.appendChild(rowElem);
        }
        // attributes
        const attribTableElem = document.getElementById("attribs");
        for (const [name, val] of Object.entries(charObject["attributes"])) {
            const rowElem = document.createElement("tr");
            const value = document.createElement("td");
            const attrib = document.createElement("td");
            value.textContent = val;
            attrib.textContent = name.slice(0, 1).toUpperCase() + name.slice(1);
            rowElem.appendChild(attrib);
            rowElem.appendChild(value);
            attribTableElem === null || attribTableElem === void 0 ? void 0 : attribTableElem.appendChild(rowElem);
        }
        // secondary attributes
        const secondsTableElem = document.getElementById("seconds");
        const hpli = document.createElement("tr");
        const ppli = document.createElement("tr");
        const spli = document.createElement("tr");
        const rspli = document.createElement("tr");
        const strength = document.createElement("tr");
        hpli.innerHTML = `<td>HP</td> <td>${charObject["chp"]} / ${charObject["hp"]}</td>`;
        ppli.innerHTML = `<td>PP</td> <td>${charObject["pp"]}</td>`;
        spli.innerHTML = `<td>Walk speed</td> <td>${charObject["speed_walk"]}</td>`;
        rspli.innerHTML = `<td>Run speed</td> <td>${charObject["speed_walk"] * 2}</td>`;
        strength.innerHTML = `<td>Strength</td> <td>${charObject["stats"]["str"] + 10}</td>`;
        secondsTableElem === null || secondsTableElem === void 0 ? void 0 : secondsTableElem.appendChild(hpli);
        secondsTableElem === null || secondsTableElem === void 0 ? void 0 : secondsTableElem.appendChild(ppli);
        secondsTableElem === null || secondsTableElem === void 0 ? void 0 : secondsTableElem.appendChild(spli);
        secondsTableElem === null || secondsTableElem === void 0 ? void 0 : secondsTableElem.appendChild(rspli);
        secondsTableElem === null || secondsTableElem === void 0 ? void 0 : secondsTableElem.appendChild(strength);
        // skills
        const skillTableElem = document.getElementById("skills");
        for (const skill of Object.values(charObject["skills"])) {
            const rowElem = document.createElement("tr");
            const name = document.createElement("td");
            const stat = document.createElement("td");
            const value = document.createElement("td");
            name.textContent = skill["name"];
            stat.textContent = `(${skill["stat"]})`;
            value.textContent = `+${skill["value"]}`;
            value.classList.add("right");
            rowElem.appendChild(name);
            rowElem.appendChild(stat);
            rowElem.appendChild(value);
            skillTableElem === null || skillTableElem === void 0 ? void 0 : skillTableElem.appendChild(rowElem);
        }
        // weapons
        const wpnTableElem = document.getElementById("weapons");
        for (const weapon of Object.values(charObject["weapons"])) {
            const rowElem = document.createElement("tr");
            const name = document.createElement("td");
            const type = document.createElement("td");
            const dmg = document.createElement("td");
            const notes = document.createElement("td");
            name.textContent = weapon["name"];
            type.textContent = `${weapon["wtype"]}`;
            dmg.textContent = `${weapon["damage"]}`;
            notes.textContent = `${weapon["notes"]}`;
            rowElem.appendChild(name);
            rowElem.appendChild(type);
            rowElem.appendChild(dmg);
            rowElem.appendChild(notes);
            wpnTableElem === null || wpnTableElem === void 0 ? void 0 : wpnTableElem.appendChild(rowElem);
        }
        // talents
        const talentListElem = document.getElementById("talents");
        for (const talent of Object.values(charObject["talents"])) {
            const item = document.createElement("li");
            item.textContent = `${talent}`;
            talentListElem === null || talentListElem === void 0 ? void 0 : talentListElem.appendChild(item);
        }
        // notes
        const noteListElem = document.getElementById("notes");
        for (const note of Object.values(charObject["notes"])) {
            const item = document.createElement("li");
            item.innerHTML = `${note}`;
            noteListElem === null || noteListElem === void 0 ? void 0 : noteListElem.appendChild(item);
        }
        // Encumburing Items
        const eiListElem = document.getElementById("eitems");
        const wealth = document.createElement("li");
        wealth.textContent = `${charObject["wealth"]}Ҁ`;
        eiListElem === null || eiListElem === void 0 ? void 0 : eiListElem.appendChild(wealth);
        for (const eitem of Object.values(charObject["items"])) {
            const item = document.createElement("li");
            item.textContent = eitem;
            eiListElem === null || eiListElem === void 0 ? void 0 : eiListElem.appendChild(item);
        }
        // Non-encumbering items
        const neiListElem = document.getElementById("neitems");
        for (const neitem of Object.values(charObject["neitems"])) {
            const item = document.createElement("li");
            item.textContent = neitem;
            neiListElem === null || neiListElem === void 0 ? void 0 : neiListElem.appendChild(item);
        }
        // spells
        const spellListElem = document.getElementById("spells");
        for (const spell of Object.values(charObject["spells"])) {
            const item = document.createElement("li");
            const details = document.createElement("ul");
            const itemPP = document.createElement("li");
            const itemIdio = document.createElement("li");
            const itemRng = document.createElement("li");
            const itemDur = document.createElement("li");
            const itemRes = document.createElement("li");
            const itemDesc = document.createElement("li");
            item.textContent = `${spell["name"]}`;
            itemPP.textContent = (`PP: ${spell["pp"]}`);
            itemIdio.textContent = (`Idiosyncracy: ${spell["idiosyncracy"]}`);
            itemRng.textContent = (`Range: ${spell["range"]}`);
            itemDur.textContent = (`Duration: ${spell["duration"]}`);
            itemRes.textContent = (`Resisted: ${spell["resisted"]}`);
            itemDesc.textContent = spell["description"];
            details.appendChild(itemPP);
            details.appendChild(itemIdio);
            details.appendChild(itemRng);
            details.appendChild(itemDur);
            details.appendChild(itemRes);
            details.appendChild(itemDesc);
            spellListElem === null || spellListElem === void 0 ? void 0 : spellListElem.appendChild(item);
            spellListElem === null || spellListElem === void 0 ? void 0 : spellListElem.appendChild(details);
        }
    });
}
function sendJson() {
    /**
      * Converts bsCharacter to a json file and downloads item
      *
      *@returns: None
      **/
    let exportData = "data:text/json;charset=utf-8,";
    exportData += encodeURIComponent(JSON.stringify(globalChar, null, 2));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", exportData);
    downloadAnchorNode.setAttribute("download", "broken_shores_character.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
function fillPDF() {
    return __awaiter(this, void 0, void 0, function* () {
        const charObject = globalChar;
        const csUrl = "https://raw.githubusercontent.com/snowkeep/bscg/main/assets/Broken_Shores_Sheets_Fillable_v1_0.pdf";
        const formPdfBytes = yield fetch(csUrl).then(res => res.arrayBuffer());
        // @ts-ignore
        const pdfDoc = yield PDFLib.PDFDocument.load(formPdfBytes);
        const form = pdfDoc.getForm();
        const topFieldMap = new Map([
            ["name", "Text1"],
            ["chp", "Text14"],
            ["hp", "Text15"],
            ["cpp", "Text16"],
            ["pp", "Text17"],
            ["speed_walk", "Text18"],
            ["speed_run", "Text19"],
            ["wealth", "Coin"],
            ["strength", "MiS"],
            ["notes", "not1"]
        ]);
        const statFieldMap = new Map([
            ["str", "Text2"],
            ["dex", "Text4"],
            ["con", "Text6"],
            ["wil", "Text8"],
            ["int", "Text10"],
            ["cha", "Text12"]
        ]);
        const attribFieldMap = new Map([
            ["brawn", "Text3"],
            ["coordination", "Text5"],
            ["vitality", "Text7"],
            ["tenacity", "Text9"],
            ["intellect", "Text11"],
            ["charm", "Text13"],
        ]);
        const skillFieldMap = new Map([
            ["Acrobatics", "ac"],
            ["Animal Handling", "ah"],
            ["Athletics", "at"],
            ["Command", "com"],
            ["Crafting", "cr"],
            ["Dodge", "dod"],
            ["Insight", "ins"],
            ["Literacy", "lit"],
            ["Manipulation", "man"],
            ["Martial Weapons", "maw"],
            ["Medicine", "med"],
            ["Nature", "nat"],
            ["Perception", "perc"],
            ["Performance", "perf"],
            ["Ranged Weapons", "ranw"],
            ["Sailing", "sal"],
            ["Siege Weapons", "siw"],
            ["Simple Melee Weapons", "smw"],
            ["Sleight of Hand", "soh"],
            ["Stealth", "sth"],
            ["Survival", "sur"],
            ["Unarmed Combat", "uc"]
        ]);
        const weaponFields = [
            ["Text20", "ty1", "dmg1", "no1"],
            ["Text21", "ty2", "dmg2", "no2"],
            ["Text22", "ty3", "dmg3", "no3"],
            ["Text23", "ty4", "dmg3", "no3"],
        ];
        const talentFields = ["tal1", "tal2", "tal3", "tal4", "tal5"];
        const encFields = ["enc1", "ec2", "enc3", "enc4", "enc5"];
        const neFields = ["NeI1", "NeI2", "NeI3", "NeI4", "NeI5"];
        const spellFieldMapTempl = new Map([
            ["name", "so"],
            ["pp", "sopp"],
            ["idiosyncracy", "soi"],
            ["details", "soid"]
        ]);
        const nameField = form.getTextField(topFieldMap.get("name"));
        nameField.setText(`${charObject["name"]}`);
        // stats
        for (const [name, val] of Object.entries(charObject["stats"])) {
            const field = form.getTextField(statFieldMap.get(name));
            field.setText(`${val}`);
        }
        // attributes
        for (const [name, val] of Object.entries(charObject["attributes"])) {
            const field = form.getTextField(attribFieldMap.get(name));
            field.setText(`${val}`);
        }
        // secondary attributes
        const chpField = form.getTextField(topFieldMap.get("chp"));
        const hpField = form.getTextField(topFieldMap.get("hp"));
        const cppField = form.getTextField(topFieldMap.get("cpp"));
        const ppField = form.getTextField(topFieldMap.get("pp"));
        const swField = form.getTextField(topFieldMap.get("speed_walk"));
        const srField = form.getTextField(topFieldMap.get("speed_run"));
        const strengthField = form.getTextField(topFieldMap.get("strength"));
        chpField.setText(`${charObject["chp"]}`);
        chpField.setFontSize(8);
        // @ts-ignore
        chpField.setAlignment(PDFLib.TextAlignment.Right);
        hpField.setText(`${charObject["hp"]}`);
        cppField.setText(`${charObject["pp"]}`);
        cppField.setFontSize(8);
        // @ts-ignore
        cppField.setAlignment(PDFLib.TextAlignment.Right);
        ppField.setText(`${charObject["pp"]}`);
        swField.setText(`${charObject["speed_walk"]}`);
        srField.setText(`${charObject["speed_walk"] * 2}`);
        strengthField.setText(`${charObject["stats"]["str"] + 10}`);
        // skills
        for (const skill of Object.values(charObject["skills"])) {
            const field = form.getTextField(skillFieldMap.get(skill["name"]));
            field.setText(`+${skill["value"]}`);
        }
        // weapons
        let count = 0;
        for (const weapon of Object.values(charObject["weapons"])) {
            const nameField = form.getTextField(weaponFields[count][0]);
            const typeField = form.getTextField(weaponFields[count][1]);
            const dmgField = form.getTextField(weaponFields[count][2]);
            const noteField = form.getTextField(weaponFields[count][3]);
            nameField.setText(weapon["name"]);
            typeField.setText(weapon["wtype"]);
            typeField.setFontSize(6);
            dmgField.setText(weapon["damage"]);
            dmgField.setFontSize(6);
            noteField.setText(weapon["notes"]);
            noteField.setFontSize(6);
            count += 1;
        }
        // talents
        count = 0;
        for (const talent of Object.values(charObject["talents"])) {
            const field = form.getTextField(talentFields[count]);
            // not enough space for the full talent - need to look it up
            field.setText(talent.split(" - ")[0]);
            count += 1;
        }
        // notes
        let notes = "";
        for (const note of Object.values(charObject["notes"])) {
            notes += "• " + note.replace("<em>", "").replace("</em>", "") + "\n";
        }
        const noteField = form.getTextField(topFieldMap.get("notes"));
        noteField.setText(notes);
        // coins
        const wealthField = form.getTextField(topFieldMap.get("wealth"));
        wealthField.setText(`${charObject["wealth"]}`);
        wealthField.setFontSize(8);
        // @ts-ignore
        wealthField.setAlignment(PDFLib.TextAlignment.Right);
        // encumbering items
        count = 0;
        for (const eitem of Object.values(charObject["items"])) {
            const itemField = form.getTextField(encFields[count]);
            itemField.setText(eitem);
            if (eitem.includes("(Heavy)")) {
                count += 1;
                const heavyField = form.getTextField(encFields[count]);
                heavyField.setText("^");
                // @ts-ignore
                heavyField.setAlignment(PDFLib.TextAlignment.Center);
            }
            count += 1;
        }
        // non-encumbering items
        count = 0;
        for (const neitem of Object.values(charObject["neitems"])) {
            const itemField = form.getTextField(neFields[count]);
            itemField.setText(neitem.split("(")[0]);
            count += 1;
        }
        // spells
        count = 1;
        for (const spell of Object.values(charObject["spells"])) {
            const nameField = form.getTextField(spellFieldMapTempl.get("name") + String(count));
            const ppField = form.getTextField(spellFieldMapTempl.get("pp") + String(count));
            const idioField = form.getTextField(spellFieldMapTempl.get("idiosyncracy") + String(count));
            const descField = form.getTextField(spellFieldMapTempl.get("details") + String(count));
            nameField.setText(spell["name"]);
            ppField.setText(spell["pp"]);
            // @ts-ignore
            ppField.setAlignment(PDFLib.TextAlignment.Center);
            idioField.enableMultiline();
            idioField.setFontSize(5);
            idioField.setText(spell["idiosyncracy"] + ".");
            descField.setFontSize(6);
            let desc = `Range: ${spell["range"]} / Resisted: ${spell["resisted"]} / Duration: ${spell["duration"]}\n${spell["description"]}`;
            descField.setText(desc);
            count += 1;
        }
        const pdfBytes = yield pdfDoc.save();
        // @ts-ignore
        download(pdfBytes, "broken_shores_character.pdf", "application/pdf");
    });
}
let globalChar;
