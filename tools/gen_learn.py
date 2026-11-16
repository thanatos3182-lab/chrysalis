#!/usr/bin/env python3
"""Build data/learn.js (quizzes + practice scenarios) from the Android app source.

Usage (from the web repo root):
  python3 tools/gen_learn.py ~/projects/recovery-app/app/src/main/java/com/thanatos/recoveryapp

It reads QuizStore*.java and PracticeStore.java, so the web app always matches the Android app.
Re-run it whenever you add or edit quizzes or scenarios there, then bump CACHE in sw.js.
"""
import glob, json, os, re, sys

# ---------- a tiny Java tokenizer / call parser (just enough for these files) ----------
def tokenize(src):
    toks, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c.isspace():
            i += 1
        elif src.startswith("//", i):
            j = src.find("\n", i); i = n if j < 0 else j + 1
        elif src.startswith("/*", i):
            j = src.find("*/", i + 2); i = n if j < 0 else j + 2
        elif c == '"':
            j, out = i + 1, []
            while j < n and src[j] != '"':
                if src[j] == "\\":
                    e = src[j + 1]
                    if e == "n": out.append("\n"); j += 2
                    elif e == "t": out.append("\t"); j += 2
                    elif e == "u": out.append(chr(int(src[j + 2:j + 6], 16))); j += 6
                    else: out.append(e); j += 2
                else:
                    out.append(src[j]); j += 1
            toks.append(("S", "".join(out))); i = j + 1
        elif c == "'":
            j = i + 1
            while j < n and src[j] != "'":
                j += 2 if src[j] == "\\" else 1
            toks.append(("C", src[i:j + 1])); i = j + 1
        elif c.isdigit():
            j = i
            while j < n and src[j].isdigit(): j += 1
            toks.append(("N", src[i:j])); i = j
        elif c.isalpha() or c == "_":
            j = i
            while j < n and (src[j].isalnum() or src[j] == "_"): j += 1
            toks.append(("I", src[i:j])); i = j
        else:
            toks.append(("P", c)); i += 1
    return toks

class Parser:
    def __init__(self, toks, i=0):
        self.t, self.i = toks, i
    def expr(self):
        tok = self.t[self.i]
        if tok[0] == "S":
            s = tok[1]; self.i += 1
            while self.t[self.i] == ("P", "+") and self.t[self.i + 1][0] == "S":
                s += self.t[self.i + 1][1]; self.i += 2
            return s
        if tok[0] == "N":
            self.i += 1; return int(tok[1])
        if tok[0] == "I":
            self.i += 1
            if self.t[self.i] == ("P", "("): return self.call()
            return ("ident", tok[1])
        raise ValueError("unexpected token %r" % (tok,))
    def call(self):  # positioned on "("
        self.i += 1; args = []
        if self.t[self.i] == ("P", ")"):
            self.i += 1; return args
        while True:
            args.append(self.expr())
            if self.t[self.i] == ("P", ","): self.i += 1
            elif self.t[self.i] == ("P", ")"): self.i += 1; return args
            else: raise ValueError("expected , or ) but got %r" % (self.t[self.i],))

def strings(v):
    return isinstance(v, list) and all(isinstance(x, str) for x in v)

# ---------- quizzes: q("question", answerIndex, "why", "option", ...) inside case "Topic": ----------
def read_quizzes(path, out, warn):
    toks, case, i = tokenize(open(path, encoding="utf-8").read()), None, 0
    while i < len(toks):
        t = toks[i]
        if t == ("I", "case") and toks[i + 1][0] == "S" and toks[i + 2] == ("P", ":"):
            case = toks[i + 1][1]; i += 3; continue
        if t == ("I", "default"):
            case = None
        if t == ("I", "q") and case and toks[i + 1] == ("P", "(") and toks[i + 2][0] == "S":
            try:
                p = Parser(toks, i + 1); a = p.call(); i = p.i
                text, ans, why, opts = a[0], a[1], a[2], a[3:]
                assert isinstance(text, str) and isinstance(ans, int) and isinstance(why, str) and strings(opts)
                assert len(opts) >= 2 and 0 <= ans < len(opts)
                out.setdefault(case, []).append({"q": text, "a": ans, "w": why, "o": opts})
            except Exception as e:
                warn.append("%s: skipped a quiz question in '%s' (%s)" % (os.path.basename(path), case, e)); i += 1
            continue
        i += 1

# ---------- scenarios: s(id, title, setup, t(topics), t(skills), best, why, ok, why, risky, why) ----------
def read_scenarios(path, out, warn):
    toks, i = tokenize(open(path, encoding="utf-8").read()), 0
    while i < len(toks):
        if toks[i] == ("I", "s") and toks[i + 1] == ("P", "(") and toks[i + 2][0] == "S":
            try:
                p = Parser(toks, i + 1); a = p.call(); i = p.i
                assert len(a) == 11 and strings(a[3]) and strings(a[4])
                assert all(isinstance(a[k], str) for k in (0, 1, 2, 5, 6, 7, 8, 9, 10))
                out.append({"id": a[0], "title": a[1], "setup": a[2], "topics": a[3], "skills": a[4],
                            "choices": [a[5], a[7], a[9]], "feedback": [a[6], a[8], a[10]]})
            except Exception as e:
                warn.append("PracticeStore.java: skipped a scenario (%s)" % e); i += 1
            continue
        i += 1

def main():
    if len(sys.argv) < 2 or not os.path.isdir(sys.argv[1]):
        sys.exit(__doc__)
    src = sys.argv[1]
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(root, "data", "learn.js")
    warn, quizzes, scenarios = [], {}, []
    files = sorted(glob.glob(os.path.join(src, "QuizStore*.java")))
    if not files:
        sys.exit("No QuizStore*.java found in " + src)
    for f in files:
        read_quizzes(f, quizzes, warn)
    ps = os.path.join(src, "PracticeStore.java")
    if os.path.exists(ps):
        read_scenarios(ps, scenarios, warn)
    else:
        warn.append("PracticeStore.java not found: no scenarios")

    # cross-check against the web app's own lesson and skill titles
    content = os.path.join(root, "data", "content.js")
    if os.path.exists(content):
        txt = open(content, encoding="utf-8").read()
        data = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
        titles = [x["title"] for x in data["lessons"]] + [x["title"] for x in data["skills"]]
        for t in titles:
            if t not in quizzes: warn.append("No quiz for: " + t)
        for t in quizzes:
            if t not in titles: warn.append("Quiz topic not in the web app: " + t)
        known = set(x["title"] for x in data["lessons"]) | set(["delay", "breathing", "called someone", "movement", "grounding", "meeting"])
        for s in scenarios:
            for t in s["topics"]:
                if t not in known: warn.append("Scenario '%s' uses unknown topic: %s" % (s["id"], t))

    body = "/* Generated by tools/gen_learn.py from the Android app source. Do not edit by hand. */\n"
    body += "window.RC_LEARN = " + json.dumps({"quizzes": quizzes, "scenarios": scenarios}, indent=1, ensure_ascii=False) + ";\n"
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(body)
    nq = sum(len(v) for v in quizzes.values())
    print("Wrote %s" % out_path)
    print("  %d quiz topics, %d questions, %d scenarios" % (len(quizzes), nq, len(scenarios)))
    for w in warn:
        print("  WARNING:", w)
    if warn:
        print("Check the warnings above. The site still works; anything missing just won't show a quiz or scenario.")

if __name__ == "__main__":
    main()
