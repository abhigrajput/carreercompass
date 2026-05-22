import fs from "fs";
const p = "app/pitch/page.tsx";
let s = fs.readFileSync(p, "utf8");
const bad = "motion" + "lessPage";
s = s.replace(`      <${bad} />\n        <motion.div`, `      <motion.div className="h-1 bg-white/10">\n        <motion.div`);
s = s.replace(`      </${bad}>\n      <main`, `      </motion.div>\n      <main`);
fs.writeFileSync(p, s);
console.log("pitch fixed");
