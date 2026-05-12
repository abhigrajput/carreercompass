import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/common.json";
import kn from "@/locales/kn/common.json";
import hi from "@/locales/hi/common.json";

const resources = {
  en: { common: en },
  kn: { common: kn },
  hi: { common: hi },
};

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    ns: ["common"],
    defaultNS: "common",
  });
}

export default i18next;
