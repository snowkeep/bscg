#! /usr/bin/env python

from pypdf import PdfReader
import re
import json

skillRe = re.compile("-\s?(.*)\((\w+)\):(.*)")
talentRe = re.compile("-\s?(.*):(.*)")
numRe = re.compile("\d+(-\d+)?$")

reader =  PdfReader("Broken Shores_Digital.pdf")

def visitor_body(text, cm, tm, font_dict, font_size):
    y = cm[5]
    if y > 20 and y < 570 and text:
        parts.append(text.replace(u"\ufffd", "f").replace(u"\u2019", "'").replace(u"\u2013", "-"))

data = {}

# skills
data["skills"] = {}
for i in range(13-1,14):

    parts = []
    page = reader.pages[i]
    page.extract_text(visitor_text=visitor_body)

    formated = []

    constr = ""
    for line in parts:
        if line.startswith("-"):
            formated.append(constr.replace("  ", " "))
            constr = line.strip()
        else:
            constr = constr + " " + line.strip()

    for sk in formated[1:]:
        m = skillRe.match(sk)
        data["skills"][m.group(1).strip()] =  ({"attribute": m.group(2), "description": m.group(3).strip()})

# talents
data["talents"] = {}
for i in range(15-1,17):
    parts = []
    page = reader.pages[i]
    page.extract_text(visitor_text=visitor_body)

    formated = []

    constr = ""
    for line in parts:
        if line.startswith("-"):
            formated.append(constr.replace("  ", " "))
            constr = line.strip()
        elif line.startswith("You start your story"):
            formated.append(constr.replace("  ", " "))
            break
        else:
            constr = constr + " " + line.strip()

    for sk in formated[1:]:
        m = talentRe.match(sk)
        data["talents"][m.group(1).strip()] =  m.group(2).strip()

# cults
data["cults"] = {}
parts = []
page = reader.pages[17-1]
page.extract_text(visitor_text=visitor_body)
parts = list(filter("\n".__ne__, parts))
tblstart = parts.index("1")

constr = ""
for sk in parts[tblstart:]:
    if numRe.match(sk):
        if constr:
            tokens = constr.split(",")
            data["cults"][tokens[0]] =  ",".join(tokens[1:]).strip()
            constr = ""
    else:
        constr = constr + sk
tokens = constr.split(",")
data["cults"][tokens[0]] =  ",".join(tokens[1:]).strip()

# capturedWhy
data["why"] = []
parts = []
page = reader.pages[18-1]
page.extract_text(visitor_text=visitor_body)
parts = list(filter("\n".__ne__, parts[3:]))

constr = ""
for sk in parts:
    if numRe.match(sk):
        if constr:
            data["why"].append(constr)
            constr = ""
    elif sk.startswith("D"):
        data["why"].append(constr)
        break
    else:
        constr = constr + sk

# capture length
data["length"] = []
lenstart = parts.index("D10")

for sk in parts[lenstart+3:]:
    if numRe.match(sk):
        continue
    elif sk.startswith("D"):
        break
    else:
        data["length"].append(sk)

# escape
data["escape"] = []
escstart = parts.index("D8")

for sk in parts[escstart+2:]:
    if numRe.match(sk):
        continue
    else:
        tokens = sk.split("(")
        data["escape"].append({"means": tokens[0], "adjust": tokens[1].removesuffix(")")})

# steal
data["steal"] = {}
parts = []
page = reader.pages[19-1]
page.extract_text(visitor_text=visitor_body)
parts = list(filter("\n".__ne__, parts))

stealstart = parts.index("D6")
constr = ""
for sk in parts[stealstart+3:-1]:
    if numRe.match(sk):
        if constr:
            tokens = constr.split(".")
            tokens2 = tokens[1].split("(")
            if len(tokens2) > 1:
                red = tokens2[1].removesuffix(")")
            else:
                red = ""
            if "shards" in tokens[0] or "moonstone" in tokens[0]:
                encumbering = True
            else:
                encumbering = False

            data["steal"][tokens[0]] =  {"price": tokens2[0], "reduce": red, "encumbering": encumbering}
            constr = ""
    else:
        constr = constr + sk
tokens = constr.split(".")
tokens2 = tokens[1].split("(")
if len(tokens2) > 1:
    red = tokens2[1].removesuffix(")")
# explicit put the HP drop for ring of healing
elif tokens2[0].endswith("HP"):
    red = "-5 HP"
else:
    red = ""

data["steal"][tokens[0]] =  {"price": tokens2[0], "reduce": red, "encumbering": False}

# gear
data["gear"] = []
gearstart = parts.index("D10")

for sk in parts[gearstart+2:]:
    if numRe.match(sk):
        continue
    elif sk == "D6":
        break
    else:
        data["gear"].append(sk)

# weapon
data["weapons"] = {}
parts = []
page = reader.pages[112-1]
page.extract_text(visitor_text=visitor_body)
parts = list(filter("\n".__ne__, parts))

for sk in parts[2:]:
    if numRe.match(sk):
        [min,max] = sk.split("-")
    elif sk.startswith("Wfff"):
        break
    else:
        data["weapons"][sk] = {"min": int(min), "max": int(max)}

# spells
# TODO: get spell details
data["spells"] = []
parts = []
page = reader.pages[56-1]
page.extract_text(visitor_text=visitor_body)
parts = list(filter("\n".__ne__, parts))

spellstart = parts.index("D20")
for sk in parts[spellstart+2:]:

    if numRe.match(sk):
        continue
    else:
        data["spells"].append(sk)

# spell idosyncracies
data["idiosyncracies"] = []
parts = []
page1 = reader.pages[54-1]
page1.extract_text(visitor_text=visitor_body)
idilist = list(filter("\n".__ne__, parts))
parts = []
page2 = reader.pages[55-1]
page2.extract_text(visitor_text=visitor_body)
idilist += list(filter("\n".__ne__, parts[3:]))

idiostart = idilist.index("D66")

constr = ""
for sk in idilist[idiostart+2:]:
    if numRe.match(sk):
        if constr:
            data["idiosyncracies"].append(constr)
            constr = ""
    else:
        constr = constr + sk
data["idiosyncracies"].append(constr)



json_object = json.dumps(data, indent = 4)
print(json_object)
