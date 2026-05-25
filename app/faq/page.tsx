import Link from "next/link";

const FAQS = [
  {
    question: "What careers are available after Class 10 in Karnataka?",
    answer:
      "After Class 10 in Karnataka, students usually move into Science, Commerce, or Arts and then build toward a much wider set of careers. Science can lead to engineering, medicine, data, defence, architecture, and many technical pathways. Commerce can lead to CA, banking, finance, business, analytics, and entrepreneurship. Arts can lead to law, psychology, journalism, design, teaching, civil services, and communication-heavy roles. The best next step is not choosing the stream with the loudest reputation, but the one that fits your strengths, study habits, and long-term interests. Students who explore early make better decisions than those who follow pressure blindly.",
    links: [
      { label: "Explore careers", href: "/explore" },
      { label: "Play the career game", href: "/games" },
    ],
  },
  {
    question: "How to prepare for Karnataka CET 2025?",
    answer:
      "A strong Karnataka CET plan should begin with PUC basics, chapter tracking, and repeated problem practice. Start by listing Physics, Chemistry, and Mathematics or Biology chapters in order of strength. Build a weekly routine where you revise theory, solve previous-year papers, and then test yourself under timed conditions. CET rewards consistency more than last-minute panic. Students should also study cutoff trends so they understand how marks connect to realistic college options. The best preparation systems include one revision notebook, one formula sheet, and a weekly mock-test review habit.",
    links: [
      { label: "Entrance exams guide", href: "/exams" },
      { label: "Study timer", href: "/study-timer" },
    ],
  },
  {
    question: "What is the salary of a software engineer in Bengaluru?",
    answer:
      "A software engineer in Bengaluru can start anywhere from a modest fresher package to a strong product-company offer depending on skills, college, internships, and project quality. A practical student-facing range is roughly ₹8-40 LPA across the early-to-mid growth window, with fresher salaries usually clustering lower and scaling up through strong skill-building. The number matters, but the more useful question is what helps you reach the higher bands. Good coding foundations, projects, communication, internships, and problem solving matter much more than the title alone. Bengaluru rewards students who build proof of skill early.",
    links: [{ label: "Software Engineer path", href: "/careers/software-engineer" }],
  },
  {
    question: "Which is better — engineering or medicine for Karnataka students?",
    answer:
      "Neither engineering nor medicine is automatically better for all Karnataka students. Engineering usually suits students who enjoy building, maths, systems, coding, or technical design. Medicine suits students who can handle long study timelines, Biology-heavy learning, patient care, and emotionally demanding work. Engineering can offer faster time-to-job and more branch variety. Medicine often offers strong social value and long-term stability, but it demands a longer training path. The right decision comes from interest, subject strength, lifestyle fit, and how you respond to pressure, not only prestige. If you are torn, compare exam routes, years to qualification, and day-to-day work honestly.",
    links: [
      { label: "Compare careers", href: "/compare" },
      { label: "Doctor career path", href: "/careers/doctor" },
    ],
  },
  {
    question: "How to become an IAS officer from Karnataka?",
    answer:
      "The path to IAS from Karnataka usually starts with finishing school well, choosing a graduation route you can sustain, and then preparing seriously for UPSC. There is no single mandatory degree. Students from engineering, arts, commerce, and law all enter civil services. The key is to develop strong reading habits, current affairs awareness, writing clarity, and long-term discipline. Karnataka students should also compare UPSC with KPSC because state-level public-service roles may fit some goals better. Early exposure to polity, history, geography, and public issues helps a lot, but the deeper question is whether you are genuinely motivated by administration and service rather than just the title.",
    links: [{ label: "IAS Officer career page", href: "/careers/ias-officer" }],
  },
  {
    question: "What are the best colleges in Karnataka for engineering?",
    answer:
      "The best engineering colleges in Karnataka depend on branch, budget, rank, and learning goals, but the names students commonly shortlist include NITK Surathkal, RV College of Engineering, BMS College of Engineering, PES University, UVCE, and MSRIT. Students should compare more than brand value. Look at cutoff ranges, placement consistency, branch quality, city exposure, fees, and internship access. Bengaluru colleges often benefit from stronger industry visibility, while some government options offer better value for money. The best list for you should include dream, realistic, and safe choices instead of one ideal college with no backup planning.",
    links: [
      { label: "College explorer", href: "/colleges" },
      { label: "Engineering careers", href: "/explore?filter=engineering" },
    ],
  },
  {
    question: "How to get scholarship for SC/ST students in Karnataka?",
    answer:
      "SC and ST students in Karnataka should start scholarship planning early by checking official state welfare portals, income rules, domicile requirements, and class eligibility. Post-matric scholarships are among the most important routes, especially for students in Classes 10-12 and beyond. The biggest mistake is waiting until the deadline without preparing documents. Keep bank details, caste certificate, income certificate, marks cards, and Aadhaar-linked records ready well in advance. Students should also watch for both state and national opportunities because some support systems overlap. A scholarship strategy works best when it is treated like exam planning: track dates, gather documents, and verify official sources carefully.",
    links: [{ label: "Scholarships page", href: "/scholarships" }],
  },
  {
    question: "What is the NEET cutoff for Karnataka medical colleges?",
    answer:
      "The NEET cutoff for Karnataka medical colleges changes every year based on seat availability, reservation, competition, and the type of college being targeted. Government colleges usually demand much stronger ranks and scores than private colleges. State quota dynamics also matter. Instead of memorizing one number, students should think in ranges and compare expected cutoff movement across government, semi-government, and private options. This helps you decide whether to remain fully MBBS-focused or also explore allied healthcare and backup plans. Students who track cutoffs along with mock-test trends make more realistic and calmer decisions than those who wait for final counselling pressure.",
    links: [
      { label: "Doctor career page", href: "/careers/doctor" },
      { label: "Exams page", href: "/exams" },
    ],
  },
  {
    question: "What careers can I choose after Class 12 Commerce?",
    answer:
      "After Class 12 Commerce, students can move into CA, CMA, CS, banking, BBA, finance, economics, analytics, digital marketing, business operations, entrepreneurship, and law, among other routes. The strongest choice depends on whether you enjoy accounting depth, markets, communication, strategy, structured exams, or business building. Commerce is much broader than only CA. Students should compare effort, timeline, and long-term work style before locking in a path. A well-planned Commerce student can build excellent careers in Karnataka, especially when they combine academics with internships, communication skill, and digital fluency.",
    links: [
      { label: "Explore commerce careers", href: "/explore?filter=commerce" },
      { label: "Compare careers", href: "/compare" },
    ],
  },
  {
    question: "How to become a pilot in India?",
    answer:
      "To become a pilot in India, students usually complete Class 12 with Physics and Mathematics, clear the required medical standards, and then pursue flight training toward a Commercial Pilot Licence. Some students enter through defence routes such as NDA, while others follow civil aviation training through approved flying schools. The path can be expensive, so financial planning matters. Students also need to understand that being a pilot is not only about glamour. It requires discipline, technical focus, calm decision-making, and medical fitness. If aviation excites you, compare cost, training timelines, and backup options before committing.",
    links: [{ label: "Explore aviation careers", href: "/explore" }],
  },
  {
    question: "What is the salary of a doctor in Karnataka?",
    answer:
      "Doctor salaries in Karnataka vary widely by specialization, city, institution type, and career stage. A fresh MBBS graduate's early income can look very different from the earning level of a specialist, private practitioner, or hospital administrator. A practical public-facing range is often described as ₹10-50 LPA across the broader journey, but students should remember that medicine is a long path. The important planning question is not only final salary, but whether you are ready for the training years, emotional intensity, and patient-care responsibilities. For the right student, medicine offers both social meaning and long-term financial stability.",
    links: [{ label: "Doctor career path", href: "/careers/doctor" }],
  },
  {
    question: "What are the emerging careers in Bengaluru tech sector?",
    answer:
      "Emerging careers in Bengaluru tech include AI and ML engineering, cybersecurity, data science, product operations, cloud engineering, robotics, full-stack development, UX design, and startup-focused growth roles. Some of these jobs come from large established companies, while others come from startups where students learn quickly by handling broader responsibilities. The main lesson for students is that tech is not one job family. Different roles reward different strengths. Some need deep coding, some need design thinking, and some need analytical and communication skills. Students should explore the ecosystem early instead of assuming every tech job looks the same.",
    links: [
      { label: "Explore tech careers", href: "/explore?filter=tech" },
      { label: "Mock interview", href: "/mock-interview" },
    ],
  },
  {
    question: "How to crack Karnataka CET in 3 months?",
    answer:
      "Cracking Karnataka CET in 3 months requires ruthless prioritization, not random long study hours. Start by identifying high-yield chapters from Physics, Chemistry, and Mathematics or Biology. Build a weekly cycle with theory revision, daily question practice, and regular timed tests. In a 3-month window, mock analysis becomes extremely important because it reveals the chapters where marks are leaking. Students should avoid collecting too many resources. One strong concept source, previous-year papers, and consistent revision will usually outperform scattered preparation. The final 3-month plan should feel measurable: chapters completed, mistakes tracked, and tests reviewed.",
    links: [
      { label: "Study timer", href: "/study-timer" },
      { label: "Exams page", href: "/exams" },
    ],
  },
  {
    question: "What is the best career for a creative person in Karnataka?",
    answer:
      "There is no single best career for every creative person in Karnataka, because creativity shows up in different ways. Some students are visual and may fit design, UX, architecture, film, or branding. Others are expressive through writing, storytelling, teaching, or journalism. Some creative students also enjoy building products and may do well in game development or entrepreneurial roles. The right path depends on whether your creativity is visual, verbal, strategic, social, or problem-solving oriented. Students should compare the environment they enjoy, the kind of work they want to make, and the stability they want over time.",
    links: [
      { label: "Explore creative careers", href: "/explore?filter=creative" },
      { label: "Career discovery game", href: "/games" },
    ],
  },
  {
    question: "How to become a game developer in India?",
    answer:
      "To become a game developer in India, students usually build foundations in programming, logic, storytelling, design thinking, and game engines such as Unity or Unreal over time. A degree in computer science can help, but projects matter a lot. Students can start by learning one programming language, creating small playable demos, joining game jams, and building a portfolio. The Indian market rewards students who can show real work, not just interest. In Karnataka, being close to the broader tech ecosystem can also help because skills learned in software development, design, and graphics often support game development too.",
    links: [
      { label: "Explore game-related careers", href: "/explore?career=game-developer" },
      { label: "Skill games", href: "/skill-games" },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#080814] px-4 pb-16 pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="font-display text-4xl text-white">Career FAQ for Karnataka Students</h1>
          <p className="mt-3 max-w-3xl text-white/65">
            Clear answers to the questions students and parents ask most often about careers, exams, colleges, salaries, and planning in Karnataka.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-white/10 bg-[#12121F] p-6"
            >
              <h2 className="font-display text-2xl text-white">{item.question}</h2>
              <p className="mt-4 leading-7 text-white/80">{item.answer}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {item.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border border-[#FF6B35]/30 px-4 py-2 text-sm text-[#FF6B35]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
