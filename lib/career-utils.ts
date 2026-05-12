import type { CareerItem, LocaleCode } from "@/types";

export function careerDisplayName(career: CareerItem, lang: LocaleCode) {
  if (lang === "kn") {
    return career.nameKn;
  }
  if (lang === "hi") {
    return career.nameHi;
  }
  return career.name;
}

export function careerDescription(career: CareerItem, lang: LocaleCode) {
  if (lang === "kn") {
    return career.descriptionKn;
  }
  return career.description;
}
