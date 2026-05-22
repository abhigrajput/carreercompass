import fs from "fs";
import { CAREERS } from "../lib/careers.ts";

// Static career page template - generate one sample file for build
const id = "software-engineer";
const c = {
  id,
  name: "Software Engineer",
  icon: "💻",
  avgSalary: "8-40 LPA",
  description: "Build apps, websites, and software systems",
  entranceExams: ["JEE", "Karnataka CET"],
  topCollegesKarnataka: ["IISc", "NITK", "RV College"],
};

const page = `import Link from "next/link";
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
    title: \`\${career.name} Career Guide Karnataka | CareerCompass\`,
    description: \`Salary \${career.avgSalary}. Colleges: \${career.topCollegesKarnataka.join(", ")}. Exams: \${career.entranceExams.join(", ")}.\`,
  };
}

export default function CareerPage({ params }: Props) {
  const career = CAREERS.find((x) => x.id === params.id);
  if (!career) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <p className="text-4xl">{career.icon}</p>
      <h1 className="mt-4 font-display text-4xl text-white">{career.name}</h1>
      <p className="mt-2 text-emerald-300">{career.avgSalary}</p>
      <p className="mt-6 text-white/75">{career.description}</p>
      <h2 className="mt-8 font-display text-xl text-white">Top colleges</h2>
      <ul className="mt-2 list-disc pl-5 text-white/70">
        {career.topCollegesKarnataka.map((col) => (
          <li key={col}>{col}</li>
        ))}
      </ul>
      <Link href={\`/games?career=\${career.id}\`} className="mt-8 inline-block rounded-xl bg-[#FF6B35] px-6 py-3 text-[#080814]">
        Test your aptitude
      </Link>
    </div>
  );
}
`;

fs.mkdirSync("app/careers/[id]", { recursive: true });
fs.writeFileSync("app/careers/[id]/page.tsx", page);
console.log("career page ok");
