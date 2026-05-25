import { z } from "zod";

const citySlug = z.enum(["bengaluru", "mysuru", "hubballi"]);
const citySlugOrOther = z.enum(["bengaluru", "mysuru", "hubballi", "other"]);
const language = z.enum(["en", "kn", "hi"]);
const studentClass = z.enum(["10", "11", "12"]);

const namePattern = /^[a-zA-Z\s\u0C00-\u0C7F\u0900-\u097F]+$/;

export const StudentSchema = z.object({
  name: z.string().min(1).max(100).regex(namePattern),
  class: studentClass,
  city: citySlugOrOther,
  language,
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal("")),
  known_goal: z.string().max(200).optional(),
  knownGoal: z.string().max(200).optional(),
  school_name: z.string().max(200).optional(),
  schoolName: z.string().max(200).optional(),
  referral_code: z.string().max(32).optional(),
  referred_by: z.string().max(32).optional(),
  auth_id: z.string().uuid().optional(),
  stream: z.enum(["science", "commerce", "arts"]).optional().nullable(),
});

export const ChatMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1000),
      }),
    )
    .max(50),
  language,
  studentName: z.string().max(100).optional(),
  city: z.string().max(50).optional(),
  careersDiscussed: z.array(z.string().max(80)).max(20).optional(),
});

export const GameStartSchema = z.object({
  studentId: z.string().uuid().optional().nullable(),
  domain: z.string().min(1).max(50),
});

export const GameResultSchema = z.object({
  gameToken: z.string().uuid(),
  studentId: z.string().uuid().optional().nullable(),
  studentName: z.string().max(100).optional(),
  careerDomain: z.string().max(50),
  correctAnswers: z.number().int().min(0).max(20),
  totalQuestions: z.number().int().min(1).max(20),
});

export const GameResultLegacySchema = z.object({
  studentId: z.string().uuid().optional().nullable(),
  studentName: z.string().max(100).optional(),
  careerDomain: z.string().max(50),
  score: z.number().min(0).max(100).optional(),
  totalQuestions: z.number().int().min(1).max(20).optional(),
  correctAnswers: z.number().int().min(0).max(20).optional(),
});

const postTypeEnum = z.enum([
  "Question",
  "Achievement",
  "Advice",
  "CareerStory",
]);

const communityCityInput = z.union([
  citySlugOrOther,
  z.enum(["Bengaluru", "Mysuru", "Hubballi", "Other"]),
]);

function normalizeCommunityCity(raw: string): string {
  const map: Record<string, string> = {
    bengaluru: "Bengaluru",
    Bengaluru: "Bengaluru",
    mysuru: "Mysuru",
    Mysuru: "Mysuru",
    hubballi: "Hubballi",
    Hubballi: "Hubballi",
    other: "Other",
    Other: "Other",
  };
  return map[raw] ?? raw.slice(0, 50);
}

export const CommunityPostSchema = z
  .object({
    studentId: z.string().uuid().optional().nullable(),
    student_name: z.string().max(100).optional(),
    studentName: z.string().max(100).optional(),
    student_city: communityCityInput.optional(),
    studentCity: z.string().max(50).optional(),
    content: z.string().min(1).max(280),
    post_type: postTypeEnum.optional(),
    postType: postTypeEnum.optional(),
    career_tag: z.string().max(50).optional().nullable(),
    careerTag: z.string().max(50).optional().nullable(),
  })
  .superRefine((d, ctx) => {
    if (!d.student_name && !d.studentName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "studentName required",
        path: ["studentName"],
      });
    }
    if (!d.post_type && !d.postType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "postType required",
        path: ["postType"],
      });
    }
  })
  .transform((d) => ({
    studentId: d.studentId ?? null,
    student_name: (d.student_name ?? d.studentName)!,
    student_city: normalizeCommunityCity(
      String(d.student_city ?? d.studentCity ?? "bengaluru"),
    ),
    content: d.content.trim(),
    post_type: (d.post_type ?? d.postType)!,
    career_tag: d.career_tag ?? d.careerTag ?? null,
  }));

export const CommunityLikeSchema = z.object({
  postId: z.string().min(1).max(80),
  studentId: z.string().uuid(),
});

export const PaymentCreateSchema = z.object({
  plan: z.enum(["pro", "pro_yearly", "school_starter", "school_pro"]),
  studentId: z.string().uuid().optional().or(z.literal("guest")),
});

export const PaymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(256),
  plan: z.enum(["pro", "pro_yearly", "school_starter", "school_pro"]),
  studentId: z.string().uuid().optional(),
});

export const SubscribeSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email(),
  language: language.default("en"),
  source: z.string().max(50).optional(),
});

export const ContactSchema = z.object({
  name: z.string().min(1).max(100).regex(namePattern),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  role: z.enum(["Student", "Parent", "Teacher", "School Admin", "Other"]),
});

export const PointsSchema = z.object({
  studentId: z.string().uuid(),
  action: z.enum([
    "explore_career",
    "complete_game",
    "skill_game_correct",
    "chat_message",
    "generate_roadmap",
    "view_college",
    "share_parent",
    "daily_login",
    "complete_mission",
    "referral_signup",
    "streak_7_days",
    "streak_30_days",
  ]),
  points: z.number().int().min(0).max(500).optional(),
});

export const StreakSchema = z.object({
  studentId: z.string().uuid(),
});

export const RoadmapSchema = z.object({
  career: z.object({
    id: z.string().max(80),
    name: z.string().max(120),
    domain: z.string().max(80),
  }),
  studentClass: studentClass.optional(),
  city: citySlug.optional(),
  language: language.optional(),
});

export const TimetableSchema = z.object({
  careerId: z.string().max(80),
  careerLabel: z.string().max(120).optional(),
  examName: z.string().max(40),
  examDate: z.string().max(20),
  hoursPerDay: z.number().int().min(1).max(8),
  weakSubjects: z.array(z.string().max(40)).max(12),
  strongSubjects: z.array(z.string().max(40)).max(12),
  studentId: z.string().uuid().optional().nullable(),
});

export const DailyBriefSchema = z.object({
  name: z.string().max(100).optional(),
  class: z.string().max(4).optional(),
  city: z.string().max(50).optional(),
  career: z.string().max(120).optional(),
  language: language.optional(),
});

export const WhatsAppShareSchema = z.object({
  type: z.enum(["game", "roadmap", "challenge"]),
  personalityType: z.string().max(80).optional(),
  careerName: z.string().max(120).optional(),
  salary: z.string().max(40).optional(),
  score: z.number().int().min(0).max(100).optional(),
  total: z.number().int().min(1).max(20).optional(),
  studentName: z.string().max(100).optional(),
  examName: z.string().max(80).optional(),
  collegeName: z.string().max(120).optional(),
  link: z.string().url().max(500).optional(),
  challengeCode: z.string().max(80).optional(),
  points: z.number().int().min(0).max(10000).optional(),
  gameName: z.string().max(80).optional(),
});

export const AdminAuthSchema = z.object({
  password: z.string().min(1).max(200),
});

export const SchoolPilotSchema = z.object({
  schoolName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  city: z.string().max(80),
  students: z.union([z.string(), z.number()]).optional(),
  plan: z.string().max(40).optional(),
});

export const SchoolAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export const MentorBookingSchema = z.object({
  mentorId: z.string().min(1).max(80),
  studentId: z.string().uuid().optional().nullable(),
  studentName: z.string().min(1).max(100),
  studentEmail: z.string().email().optional().or(z.literal("")),
  preferredDate: z.string().max(20).optional(),
  message: z.string().max(500).optional(),
});

export const CareerSuggestSchema = z.object({
  careerId: z.string().max(80),
  language: language.optional(),
});

export const CollegeRecommendSchema = z.object({
  cetScore: z.number().int().min(0).max(180),
  careerGoal: z.string().max(80),
  cityPreference: z.enum(["Bengaluru", "Mysuru", "Hubballi", "Any"]),
});

export const CareerMatchSchema = z.object({
  hollandCode: z.string().max(12),
  gameResults: z
    .array(
      z.object({
        domain: z.string().max(50),
        score: z.number().min(0).max(100),
      }),
    )
    .max(20)
    .optional(),
  exploredCareers: z.array(z.string().max(80)).max(50).optional(),
});

export const AnalyticsSchema = z.object({
  event: z.string().min(1).max(80),
  properties: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  studentId: z.string().uuid().optional().nullable(),
  timestamp: z.string().max(40).optional(),
});

export const ErrorLogSchema = z.object({
  error: z.string().max(2000),
  url: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
});

export const ChatSessionSchema = z.object({
  messages: z.array(z.unknown()).max(100),
  studentName: z.string().max(100).optional(),
  language: language.optional(),
  studentId: z.string().uuid().optional().nullable(),
});

export const ParentTokenSchema = z.object({
  studentId: z.string().uuid(),
});

export const NotificationPatchSchema = z.object({
  ids: z.array(z.string().uuid()).max(50).optional(),
  markAll: z.boolean().optional(),
});

export function mapCityForDb(
  city: z.infer<typeof citySlugOrOther>,
): z.infer<typeof citySlug> {
  if (city === "other") return "hubballi";
  return city;
}

export async function readJson<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Validation failed",
          details: result.error.flatten(),
        },
        { status: 400 },
      ),
    };
  }

  return { ok: true, data: result.data };
}
