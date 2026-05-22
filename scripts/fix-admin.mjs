import fs from "fs";

const path = "app/admin/page.tsx";
let s = fs.readFileSync(path, "utf8");
const typo = "<" + "motion.div" + " />";
const d = "div";
const replacement = `<${d} className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <${d} className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-white">CareerCompass Analytics — Live</h1>
        <Button type="button" variant="outline" className="border-white/20 text-white" onClick={() => void mutate()}>
          Refresh
        </Button>
      </${d}>
      <${d} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-white/10 bg-[#12121F]">
            <CardHeader><CardTitle className="text-sm text-white/60">{c.label}</CardTitle></CardHeader>
            <CardContent><p className="font-display text-2xl text-[#FFD60A]">{c.val}</p></CardContent>
          </Card>
        ))}
      </${d}>
      <Card className="border-white/10 bg-[#12121F]">
        <CardHeader><CardTitle className="text-white">Top careers</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={m?.topCareers ?? []}>
              <XAxis dataKey="career" tick={{ fill: "#aaa", fontSize: 10 }} />
              <YAxis tick={{ fill: "#aaa" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B35" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </${d}>`;

if (s.includes(typo)) {
  s = s.replace(typo, replacement);
  fs.writeFileSync(path, s);
  console.log("fixed admin");
} else {
  console.log("typo not found", typo);
}
