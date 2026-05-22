import fs from "fs";

const d = "motionlessPage".replace("motionlessPage", "div");

const body = `import Link from "next/link";
import { CAREERS } from "@/lib/careers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  return CAREERS.map((career) => ({ id: career.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const career = CAREERS.find((x) => x.id === params.id);
  if (!career) return { title: "Career" };
  return {
    title: career.name + " Career Guide Karnataka | CareerCompass",
    description: "Salary " + career.avgSalary,
  };
}

export default function CareerPage({ params }: Props) {
  const career = CAREERS.find((x) => x.id === params.id);
  if (!career) notFound();
  const related = CAREERS.filter((c) => c.domain === career.domain && c.id !== career.id).slice(0, 3);
  return (
    <${d} className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <p className="text-4xl">{career.icon}</p>
      <h1 className="mt-4 font-display text-4xl text-white">{career.name}</h1>
      <p className="mt-2 text-emerald-300">{career.avgSalary}</p>
      <p className="mt-6 text-white/75">{career.description}</p>
      <h2 className="mt-8 font-display text-xl text-white">Entrance exams</h2>
      <p className="text-white/70">{career.entranceExams.join(", ")}</p>
      <h2 className="mt-6 font-display text-xl text-white">Top colleges</h2>
      <ul className="mt-2 list-disc pl-5 text-white/70">
        {career.topCollegesKarnataka.map((col) => (
          <li key={col}>{col}</li>
        ))}
      </ul>
      <h2 className="mt-8 font-display text-xl text-white">Related careers</h2>
      <${d} className="mt-3 grid gap-3 sm:grid-cols-3">
        {related.map((r) => (
          <Link key={r.id} href={"/careers/" + r.id} className="rounded-xl border border-white/10 bg-[#12121F] p-3 text-sm text-white">
            {r.icon} {r.name}
          </Link>
        ))}
      </${d}>
      <Link href={"/games?career=" + career.id} className="mt-8 inline-block rounded-xl bg-[#FF6B35] px-6 py-3 text-[#080814]">
        Test your aptitude
      </Link>
    </${d}>
  );
}
`;

fs.mkdirSync("app/careers/[id]", { recursive: true });
fs.writeFileSync("app/careers/[id]/page.tsx", body);
console.log("ok");
