import { createServiceRoleClient } from "@/lib/supabase/admin";

const STATIC = [
  {
    id: "static-1",
    name: "Priya Sharma",
    career: "Software Engineer",
    company: "Infosys Bengaluru",
    city: "Bengaluru",
    experience_years: 5,
    languages: ["Kannada", "English", "Hindi"],
    bio: "VTU graduate, now at Infosys. Helps students navigate engineering + placement preparation.",
    price_per_session: 199,
    available: true,
  },
  {
    id: "static-2",
    name: "Dr. Ramesh Kumar",
    career: "Doctor (MBBS)",
    company: "Manipal Hospital",
    city: "Bengaluru",
    experience_years: 8,
    languages: ["Kannada", "English"],
    bio: "MBBS from Bangalore Medical College. Guides NEET aspirants from Karnataka.",
    price_per_session: 299,
    available: true,
  },
  {
    id: "static-3",
    name: "Kavitha Nair",
    career: "UX Designer",
    company: "Byju's",
    city: "Bengaluru",
    experience_years: 4,
    languages: ["Kannada", "English"],
    bio: "Self-taught designer. Helps students build portfolios without engineering degree.",
    price_per_session: 199,
    available: true,
  },
  {
    id: "static-4",
    name: "Suresh Patil",
    career: "IAS Officer",
    company: "Karnataka Government",
    city: "Hubballi",
    experience_years: 12,
    languages: ["Kannada", "Hindi", "English"],
    bio: "UPSC 2011 batch. Guides rural Karnataka students on civil services preparation.",
    price_per_session: 399,
    available: true,
  },
  {
    id: "static-5",
    name: "Ananya Reddy",
    career: "CA",
    company: "Deloitte",
    city: "Bengaluru",
    experience_years: 6,
    languages: ["Kannada", "Telugu", "English"],
    bio: "CA in 3 attempts. Guides commerce students through CA Foundation and Inter.",
    price_per_session: 199,
    available: true,
  },
  {
    id: "static-6",
    name: "Vijay Gowda",
    career: "Game Developer",
    company: "Junglee Games",
    city: "Bengaluru",
    experience_years: 3,
    languages: ["Kannada", "English"],
    bio: "Started coding at 16. Now building games. Helps students enter the gaming industry.",
    price_per_session: 149,
    available: true,
  },
];

export async function GET() {
  const admin = createServiceRoleClient();
  if (admin) {
    const { data, error } = await admin
      .from("mentors")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: true });
    if (!error && data?.length) {
      return Response.json({ mentors: data });
    }
  }
  return Response.json({ mentors: STATIC });
}
