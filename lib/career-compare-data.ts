export type CompareCareerId =
  | "software-engineer"
  | "doctor"
  | "ias-officer"
  | "ux-designer"
  | "ca"
  | "lawyer"
  | "data-scientist"
  | "architect"
  | "teacher";

export type CompareEntry = {
  id: CompareCareerId;
  avgSalaryLpa: number;
  salaryLabel: string;
  yearsToJob: number;
  timeToJobLabel: string;
  entranceExam: string;
  jobSecurity: number;
  jobSecurityLabel: string;
  workLifeBalance: number;
  workLifeBalanceLabel: string;
  karnatakaColleges: number;
  collegesLabel: string;
  fitWeights: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
};

export const CAREER_COMPARE_DATA: Record<CompareCareerId, CompareEntry> = {
  "software-engineer": {
    id: "software-engineer",
    avgSalaryLpa: 24,
    salaryLabel: "₹8-40 LPA",
    yearsToJob: 4,
    timeToJobLabel: "4 years",
    entranceExam: "JEE / KCET / COMEDK",
    jobSecurity: 3,
    jobSecurityLabel: "High",
    workLifeBalance: 3,
    workLifeBalanceLabel: "Medium",
    karnatakaColleges: 50,
    collegesLabel: "50+",
    fitWeights: { R: 15, I: 30, A: 5, S: 5, E: 10, C: 15 },
  },
  doctor: {
    id: "doctor",
    avgSalaryLpa: 28,
    salaryLabel: "₹10-50 LPA",
    yearsToJob: 9,
    timeToJobLabel: "9 years",
    entranceExam: "NEET",
    jobSecurity: 4,
    jobSecurityLabel: "Very High",
    workLifeBalance: 1,
    workLifeBalanceLabel: "Low",
    karnatakaColleges: 15,
    collegesLabel: "15+",
    fitWeights: { R: 5, I: 25, A: 0, S: 25, E: 5, C: 10 },
  },
  "ias-officer": {
    id: "ias-officer",
    avgSalaryLpa: 14,
    salaryLabel: "₹8-20 LPA",
    yearsToJob: 5,
    timeToJobLabel: "3-7 years",
    entranceExam: "UPSC / KPSC",
    jobSecurity: 4,
    jobSecurityLabel: "Very High",
    workLifeBalance: 3,
    workLifeBalanceLabel: "Medium",
    karnatakaColleges: 999,
    collegesLabel: "Any degree college",
    fitWeights: { R: 0, I: 10, A: 0, S: 20, E: 25, C: 20 },
  },
  "ux-designer": {
    id: "ux-designer",
    avgSalaryLpa: 16,
    salaryLabel: "₹5-25 LPA",
    yearsToJob: 3,
    timeToJobLabel: "3-4 years",
    entranceExam: "Portfolio / NID / NIFT",
    jobSecurity: 2,
    jobSecurityLabel: "Medium",
    workLifeBalance: 4,
    workLifeBalanceLabel: "High",
    karnatakaColleges: 12,
    collegesLabel: "10+",
    fitWeights: { R: 0, I: 10, A: 30, S: 10, E: 10, C: 5 },
  },
  ca: {
    id: "ca",
    avgSalaryLpa: 18,
    salaryLabel: "₹7-30 LPA",
    yearsToJob: 5,
    timeToJobLabel: "4-5 years",
    entranceExam: "CA Foundation / ICAI",
    jobSecurity: 4,
    jobSecurityLabel: "Very High",
    workLifeBalance: 2,
    workLifeBalanceLabel: "Medium-Low",
    karnatakaColleges: 25,
    collegesLabel: "25+",
    fitWeights: { R: 0, I: 15, A: 0, S: 0, E: 10, C: 30 },
  },
  lawyer: {
    id: "lawyer",
    avgSalaryLpa: 16,
    salaryLabel: "₹5-30 LPA",
    yearsToJob: 5,
    timeToJobLabel: "5 years",
    entranceExam: "CLAT / LSAT",
    jobSecurity: 3,
    jobSecurityLabel: "High",
    workLifeBalance: 2,
    workLifeBalanceLabel: "Medium-Low",
    karnatakaColleges: 18,
    collegesLabel: "18+",
    fitWeights: { R: 0, I: 10, A: 5, S: 10, E: 20, C: 20 },
  },
  "data-scientist": {
    id: "data-scientist",
    avgSalaryLpa: 26,
    salaryLabel: "₹10-50 LPA",
    yearsToJob: 4,
    timeToJobLabel: "4 years",
    entranceExam: "JEE / KCET / B.Tech / BSc",
    jobSecurity: 3,
    jobSecurityLabel: "High",
    workLifeBalance: 3,
    workLifeBalanceLabel: "Medium",
    karnatakaColleges: 20,
    collegesLabel: "20+",
    fitWeights: { R: 5, I: 35, A: 5, S: 0, E: 5, C: 20 },
  },
  architect: {
    id: "architect",
    avgSalaryLpa: 14,
    salaryLabel: "₹5-20 LPA",
    yearsToJob: 5,
    timeToJobLabel: "5 years",
    entranceExam: "NATA / JEE",
    jobSecurity: 3,
    jobSecurityLabel: "High",
    workLifeBalance: 3,
    workLifeBalanceLabel: "Medium",
    karnatakaColleges: 14,
    collegesLabel: "14+",
    fitWeights: { R: 10, I: 10, A: 25, S: 0, E: 10, C: 5 },
  },
  teacher: {
    id: "teacher",
    avgSalaryLpa: 9,
    salaryLabel: "₹3-15 LPA",
    yearsToJob: 3,
    timeToJobLabel: "3-4 years",
    entranceExam: "B.Ed / TET / CTET",
    jobSecurity: 4,
    jobSecurityLabel: "Very High",
    workLifeBalance: 4,
    workLifeBalanceLabel: "High",
    karnatakaColleges: 40,
    collegesLabel: "40+",
    fitWeights: { R: 0, I: 10, A: 10, S: 30, E: 10, C: 10 },
  },
};
