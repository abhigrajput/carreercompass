export interface Badge {
  id: string;
  emoji: string;
  name: string;
  nameKn: string;
  condition: string;
}

export const BADGES: Badge[] = [
  { id: "explorer", emoji: "🎯", name: "Explorer", nameKn: "ಅನ್ವೇಷಕ", condition: "Viewed 5+ careers" },
  { id: "game-master", emoji: "🎮", name: "Game Master", nameKn: "ಆಟ ಮಾಸ್ಟರ್", condition: "Completed 3+ games" },
  { id: "top-scorer", emoji: "🌟", name: "Top Scorer", nameKn: "ಟಾಪ್ ಸ್ಕೋರರ್", condition: "Scored 80%+ on any game" },
  { id: "pathfinder", emoji: "🗺️", name: "Pathfinder", nameKn: "ಮಾರ್ಗದರ್ಶಕ", condition: "Generated a roadmap" },
  { id: "community", emoji: "🤝", name: "Community", nameKn: "ಸಮುದಾಯ", condition: "Shared with parents" },
  { id: "on-fire", emoji: "🔥", name: "On Fire", nameKn: "ಬೆಂಕಿಯಲ್ಲಿ", condition: "7 day streak" },
  { id: "chatterbox", emoji: "💬", name: "Chatterbox", nameKn: "ಮಾತುಗಾರ", condition: "Sent 20+ chat messages" },
  { id: "karnataka-star", emoji: "🏆", name: "Karnataka Star", nameKn: "ಕರ್ನಾಟಕ ಸ್ಟಾರ್", condition: "Top 10 on leaderboard" },
];

export interface StudentStats {
  careersViewed: number;
  gamesCompleted: number;
  highestGameScore: number;
  roadmapsGenerated: number;
  sharedWithParents: boolean;
  streakDays: number;
  chatMessages: number;
  isTopTen: boolean;
}

export function checkBadges(stats: StudentStats, existingBadges: string[]): string[] {
  const newBadges: string[] = [];

  if (stats.careersViewed >= 5 && !existingBadges.includes("explorer")) newBadges.push("explorer");
  if (stats.gamesCompleted >= 3 && !existingBadges.includes("game-master")) newBadges.push("game-master");
  if (stats.highestGameScore >= 80 && !existingBadges.includes("top-scorer")) newBadges.push("top-scorer");
  if (stats.roadmapsGenerated >= 1 && !existingBadges.includes("pathfinder")) newBadges.push("pathfinder");
  if (stats.sharedWithParents && !existingBadges.includes("community")) newBadges.push("community");
  if (stats.streakDays >= 7 && !existingBadges.includes("on-fire")) newBadges.push("on-fire");
  if (stats.chatMessages >= 20 && !existingBadges.includes("chatterbox")) newBadges.push("chatterbox");
  if (stats.isTopTen && !existingBadges.includes("karnataka-star")) newBadges.push("karnataka-star");

  return newBadges;
}

export function getBadge(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id);
}
