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
        let resp = yield fetch(url, { cache: "reload" });
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
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
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
        let numSpells = roll(3) - 1;
        console.log(`Taking ${numSpells} spells and  ${5 - numSpells} +20 skills`);
        // get the character data json
        let bsdata = yield getBSJson();
        // shuffle the skill list
        let skills = shuffleList(Object.keys(bsdata["skills"]));
        // one skill gets +60
        let sixty = skills.shift();
        bsdata["skills"][sixty]["score"] = 60;
        // three skills get +40
        for (let _ = 0; _ < 3; _++) {
            let forty = skills.shift();
            bsdata["skills"][forty]["score"] = 40;
        }
        // 5 minus the number of starting spells get +20
        for (let _ = 0; _ < 5 - numSpells; _++) {
            let twenty = skills.shift();
            bsdata["skills"][twenty]["score"] = 20;
        }
        // two skills get +10
        for (let _ = 0; _ < 2; _++) {
            let ten = skills.shift();
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
        // cult info
        let notes = [];
        notes.push(`Captured by ${getRandomfromList(Object.keys(bsdata["cults"]))} because ${getRandomfromList(bsdata["why"])}.`);
        const escape = getRandomfromList(bsdata["escape"]);
        notes.push(`After ${getRandomfromList(bsdata["length"]).toLowerCase()}, ${escape["means"]}.`);
        // adjust skill based on escape method
        const skill = escape["adjust"].replace("+5 ", "");
        console.log(`Adjusting ${skill} skill for escape attempt`);
        bsdata["skills"][skill]["score"] += 5;
        // do we steal something from the cult?
        let myWeapons = [];
        let myItems = [];
        let myNEItems = [];
        if (getRandomfromList([true, false])) {
            const stole = getRandomfromList(Object.keys(bsdata["steal"]));
            if (stole.slice(0, 18) == "An enchanted weapon") {
                // roll on the weapons and adjust for enchantment
                const wn = roll(100);
                Object.keys(bsdata["weapons"]).forEach((weapon) => {
                    if ((wn >= bsdata["weapons"][weapon]["min"]) && (wn <= bsdata["weapons"][weapon]["max"])) {
                        const thisWeapon = bsdata["weapons"][weapon];
                        myWeapons.push({ name: weapon, wtype: thisWeapon["type"], damage: `${thisWeapon["damage"]} + D4`, notes: `enchanted, ${thisWeapon["notes"]}` });
                        myItems.push(`enchanted ${weapon} (${thisWeapon["weight"]})`);
                        if (weapon == "Bow") {
                            myItems.push("Quiver (UD6 arrows)");
                        }
                    }
                });
            }
            if (bsdata["steal"][stole]["encumbering"]) {
                if (stole.slice(0, 3) == "3D10") {
                    myItems.push(`Shards (${roll(10) + roll(10) + roll(10)})`);
                }
                else {
                    myItems.push(stole);
                }
            }
            else {
                myNEItems.push(stole);
            }
            notes.push(`You stole ${stole} from the cult.  ${bsdata["steal"][stole]["price"]}.`);
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
            notes.push(`You freed an ally during your escape`);
            wealth -= 20;
            rations -= 1;
            ally = true;
        }
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
        // TODO: look for starting with D and roll amount
        const gear = getRandomfromList(bsdata["gear"]);
        if (gear[0] == "D") {
            console.log(gear);
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
            mySkills.push({ name: name, value: bsdata["skills"][name]["score"] });
        }
        return {
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
/*
function genHTML() {
  // write stats and attributes to the HTML doc
  let statListElem = document.getElementById("stats");
  statMap.forEach((value: number, stat: string) => {
    let item = document.createElement("li");
    item.textContent = `${ key }: ${ value }`;
    statListElem?.appendChild(item);
  });
  /*
  let attribListElem = document.getElementById("attribs");
  attribMap.forEach((value: number, stat: string) => {
    let item = document.createElement("li");
    item.textContent = `${ stat }: ${ value }`;
    attribListElem?.appendChild(item);
  });
  let secondsListElem = document.getElementById("seconds");
  let hpli = document.createElement("li");
  let ppli = document.createElement("li");
  let spli = document.createElement("li");

  hpli.textContent = `HP: ${ statMap.get("CON") * 2 }`;
  ppli.textContent = `PP: ${ statMap.get("WIL") }`;
  spli.textContent = `Speed: ${ statMap.get("DEX") * 2 }`;
  secondsListElem?.appendChild(hpli);
  secondsListElem?.appendChild(ppli);
  secondsListElem?.appendChild(spli);

  // write skills to html doc
  let skillListElem = document.getElementById("skills");
  for (const name in bsdata["skills"]) {
    let item = document.createElement("li");
    item.textContent = `${ name } ${ bsdata["skills"][name]["attribute"] } : +${ bsdata["skills"][name]["score"] }`;
    skillListElem?.appendChild(item);
  }

    let spellListElem = document.getElementById("spells");
    for (let i = 0; i < numSpells; i++) {
      let myspell = spells[i];
      let myideo = getRandomfromList(bsdata["idiosyncracies"]);
      let item = document.createElement("li");
      item.textContent = `${ myspell } -- ${ myideo }`;
      spellListElem?.appendChild(item);
    }

  let talentListElem = document.getElementById("talents");
  for (let i = 0; i < 2; i++) {
    let item = document.createElement("li");
    item.textContent = `${ talents[i] } - ${ bsdata["talents"][talents[i]] }`
    talentListElem?.appendChild(item);
  }
}
*/
//genChar();
genChar().then((res) => console.log(res));
