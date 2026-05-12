export interface Mission {
  id: string;
  type: string;
  label: string;
  labelKn: string;
  completed: boolean;
  points: number;
}

const MISSION_POOL = [
  { type: "explore", label: "Explore 1 new career", labelKn: "1 ಹೊಸ ವೃತ್ತಿ ಅನ್ವೇಷಿಸಿ", points: 10 },
  { type: "chat", label: "Send 3 messages to AI guide", labelKn: "AI ಗೈಡ್\u200Cಗೆ 3 ಸಂದೇಶ ಕಳುಹಿಸಿ", points: 15 },
  { type: "game", label: "Complete 1 ability game", labelKn: "1 ಸಾಮರ್ಥ್ಯ ಆಟ ಮುಗಿಸಿ", points: 20 },
  { type: "college", label: "View college details", labelKn: "ಕಾಲೇಜ್ ವಿವರ ನೋಡಿ", points: 10 },
  { type: "share", label: "Share with a friend", labelKn: "ಸ್ನೇಹಿತನೊಂದಿಗೆ ಹಂಚಿ", points: 25 },
];

export function generateDailyMissions(dateStr: string): Mission[] {
  const hash = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = [...MISSION_POOL].sort((a, b) => {
    const ha = (hash * (MISSION_POOL.indexOf(a) + 1)) % 100;
    const hb = (hash * (MISSION_POOL.indexOf(b) + 1)) % 100;
    return ha - hb;
  });
  return shuffled.slice(0, 3).map((m, i) => ({
    id: `${dateStr}-${i}`,
    ...m,
    completed: false,
  }));
}
