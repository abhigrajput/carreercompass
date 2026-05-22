import fs from "fs";
import path from "path";

const typo = "motion" + "lessPage";

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === "node_modules" || f === ".next") continue;
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts") || p.endsWith(".mjs")) {
      let c = fs.readFileSync(p, "utf8");
      if (c.includes(typo)) {
        c = c.split(typo).join("div");
        fs.writeFileSync(p, c);
        console.log("fixed", p);
      }
    }
  }
}

walk(".");
