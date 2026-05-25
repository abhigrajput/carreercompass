import type { LocaleCode } from "@/types";

export const STUDY_QUOTES: Record<LocaleCode, string[]> = {
  en: [
    "Focus on the step in front of you, not the whole staircase.",
    "Your future self is watching. Make them proud.",
    "Every expert was once a beginner. Keep going.",
    "The secret of getting ahead is getting started.",
    "Small daily improvements lead to stunning results.",
  ],
  kn: [
    "ಮುಂದಿನ ಹೆಜ್ಜೆಯ ಮೇಲೆ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಿ.",
    "ನಿಮ್ಮ ಭವಿಷ್ಯ ನೋಡುತ್ತಿದೆ. ಅವರನ್ನು ಹೆಮ್ಮೆಪಡಿಸಿ.",
    "ಪ್ರತಿ ತಜ್ಞರೂ ಒಮ್ಮೆ ಆರಂಭಿಕರಾಗಿದ್ದರು.",
    "ಮುಂದುವರಿಯಿರಿ — ನೀವು ಸಾಧಿಸಬಲ್ಲಿರಿ.",
    "ಪ್ರತಿದಿನ ಸ್ವಲ್ಪ ಸುಧಾರಣೆ ದೊಡ್ಡ ಫಲಿತಾಂಶ ತರುತ್ತದೆ.",
  ],
  hi: [
    "सामने के कदम पर ध्यान दो, पूरी सीढ़ी पर नहीं।",
    "तुम्हारा भविष्य देख रहा है। उसे गर्वित करो।",
    "हर विशेषज्ञ कभी शुरुआत करने वाला था।",
    "आगे बढ़ते रहो — तुम कर सकते हो।",
    "रोज़ाना छोटे सुधार बड़े नतीजे देते हैं।",
  ],
};

export function getStudyQuote(language: LocaleCode, index: number): string {
  const quotes = STUDY_QUOTES[language] ?? STUDY_QUOTES.en;
  return quotes[index % quotes.length] ?? STUDY_QUOTES.en[0];
}
