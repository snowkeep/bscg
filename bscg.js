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
        // modified for starting hit points
        let chpMod = 0;
        // determine the number of starting spells
        let numSpells = roll(3) - 1;
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
        // set the skills
        let mySkills = [];
        for (const name in bsdata["skills"]) {
            mySkills.push({ name: name, value: bsdata["skills"][name]["score"] });
        }
        // TODO : spell details
        let mySpells = [];
        if (numSpells > 0) {
            const spells = shuffleList(bsdata["spells"]);
            for (let i = 0; i < numSpells; i++) {
                mySpells.push({ name: spells[i], idiosyncracy: getRandomfromList(bsdata["idiosyncracies"]) });
            }
        }
        // talents
        const talents = shuffleList(Object.keys(bsdata["talents"]));
        let myTalents = [];
        for (let i = 0; i < 2; i++) {
            myTalents.push(`${talents[i]} - ${bsdata["talents"][talents[i]]}`);
        }
        // TODO - any stat adjustments from the talents
        // cult info
        let notes = [];
        notes.push(`Captured by ${getRandomfromList(Object.keys(bsdata["cults"]))} because ${getRandomfromList(bsdata["why"])}.`);
        const escape = getRandomfromList(bsdata["escape"]);
        notes.push(`After ${getRandomfromList(bsdata["length"]).toLowerCase()}, ${escape["means"]}.`);
        // TODO: adjustment skill from escape
        // do we steal something from the cult?
        let myWeapons = [];
        let myItems = [];
        let myNEItems = [];
        if (getRandomfromList([true, false])) {
            const stole = getRandomfromList(Object.keys(bsdata["steal"]));
            if (bsdata["steal"][stole]["encumbering"]) {
                myItems.push(stole);
            }
            else {
                myNEItems.push(stole);
            }
            notes.push(`You stole ${stole} from the cult.  ${bsdata["steal"][stole]["price"]}.`);
            // TODO: adjust attribute fron theft
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
        // TODO: make a function in case we steal a magic weapon
        const wn = roll(100);
        Object.keys(bsdata["weapons"]).forEach((weapon) => {
            if ((wn >= bsdata["weapons"][weapon]["min"]) && (wn <= bsdata["weapons"][weapon]["max"])) {
                myWeapons.push({ name: weapon, wtype: "foo", damage: "bar" });
            }
        });
        // gear
        myItems.push(getRandomfromList(bsdata["gear"]));
        // derived values - go last because some of the above adjust stats
        let attribs = {
            brawn: stats.str * 5,
            coordination: stats.dex * 5,
            vitality: stats.con * 5,
            tenacity: stats.wil * 5,
            intellect: stats.int * 5,
            charm: stats.cha * 5
        };
        return {
            hp: stats.con * 2,
            chp: stats.con * 2 - chpMod,
            pp: stats.wil,
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
