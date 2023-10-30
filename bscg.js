var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
    return __awaiter(this, void 0, void 0, function () {
        var url, resp, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    url = "https://raw.githubusercontent.com/snowkeep/bscg/main/data/bscd.json";
                    return [4 /*yield*/, fetch(url, { cache: "reload" })];
                case 1:
                    resp = _c.sent();
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, resp.text()];
                case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            }
        });
    });
}
function shuffleList(array) {
    var _a;
    /**
      * Shuffles a list
      *
      * @returns a list
      **/
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
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
    return __awaiter(this, void 0, void 0, function () {
        var stats, chpMod, numSpells, bsdata, skills, sixty, _, forty, _, twenty, _, ten, mySkills, name_1, mySpells, spells, i, talents, myTalents, i, notes, escape, myWeapons, myItems, myNEItems, stole, wealth, rations, ally, wn, attribs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stats = {
                        str: rollStat(),
                        dex: rollStat(),
                        con: rollStat(),
                        wil: rollStat(),
                        int: rollStat(),
                        cha: rollStat()
                    };
                    chpMod = 0;
                    numSpells = roll(3) - 1;
                    return [4 /*yield*/, getBSJson()];
                case 1:
                    bsdata = _a.sent();
                    skills = shuffleList(Object.keys(bsdata["skills"]));
                    sixty = skills.shift();
                    bsdata["skills"][sixty]["score"] = 60;
                    // three skills get +40
                    for (_ = 0; _ < 3; _++) {
                        forty = skills.shift();
                        bsdata["skills"][forty]["score"] = 40;
                    }
                    // 5 minus the number of starting spells get +20
                    for (_ = 0; _ < 5 - numSpells; _++) {
                        twenty = skills.shift();
                        bsdata["skills"][twenty]["score"] = 20;
                    }
                    // two skills get +10
                    for (_ = 0; _ < 2; _++) {
                        ten = skills.shift();
                        bsdata["skills"][ten]["score"] = 10;
                    }
                    // rest of the skills get 0
                    skills.forEach(function (name) { bsdata["skills"][name]["score"] = 0; });
                    mySkills = [];
                    for (name_1 in bsdata["skills"]) {
                        mySkills.push({ name: name_1, value: bsdata["skills"][name_1]["score"] });
                    }
                    mySpells = [];
                    if (numSpells > 0) {
                        spells = shuffleList(bsdata["spells"]);
                        for (i = 0; i < numSpells; i++) {
                            mySpells.push({ name: spells[i], idiosyncracy: getRandomfromList(bsdata["idiosyncracies"]) });
                        }
                    }
                    talents = shuffleList(Object.keys(bsdata["talents"]));
                    myTalents = [];
                    for (i = 0; i < 2; i++) {
                        myTalents.push("".concat(talents[i], " - ").concat(bsdata["talents"][talents[i]]));
                    }
                    notes = [];
                    notes.push("Captured by ".concat(getRandomfromList(Object.keys(bsdata["cults"])), " because ").concat(getRandomfromList(bsdata["why"]), "."));
                    escape = getRandomfromList(bsdata["escape"]);
                    notes.push("After ".concat(getRandomfromList(bsdata["length"]).toLowerCase(), ", ").concat(escape["means"], "."));
                    myWeapons = [];
                    myItems = [];
                    myNEItems = [];
                    if (getRandomfromList([true, false])) {
                        stole = getRandomfromList(Object.keys(bsdata["steal"]));
                        if (bsdata["steal"][stole]["encumbering"]) {
                            myItems.push(stole);
                        }
                        else {
                            myNEItems.push(stole);
                        }
                        notes.push("You stole ".concat(stole, " from the cult.  ").concat(bsdata["steal"][stole]["price"], "."));
                        // TODO: adjust attribute fron theft
                    }
                    wealth = roll(20) + roll(20) + roll(20) + roll(20) + roll(20);
                    rations = roll(4) + 6;
                    ally = getRandomfromList([true, false]);
                    if (ally) {
                        notes.push("You freed an ally during your escape");
                        wealth -= 20;
                        rations -= 1;
                        ally = true;
                    }
                    wn = roll(100);
                    Object.keys(bsdata["weapons"]).forEach(function (weapon) {
                        if ((wn >= bsdata["weapons"][weapon]["min"]) && (wn <= bsdata["weapons"][weapon]["max"])) {
                            myWeapons.push({ name: weapon, wtype: "foo", damage: "bar" });
                        }
                    });
                    // gear
                    myItems.push(getRandomfromList(bsdata["gear"]));
                    attribs = {
                        brawn: stats.str * 5,
                        coordination: stats.dex * 5,
                        vitality: stats.con * 5,
                        tenacity: stats.wil * 5,
                        intellect: stats.int * 5,
                        charm: stats.cha * 5
                    };
                    return [2 /*return*/, {
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
                        }];
            }
        });
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
genChar().then(function (res) { return console.log(res); });
