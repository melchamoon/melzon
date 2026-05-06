export type GameResult = {
  game: 'slot' | 'click' | 'memory';
  earnedPoints: number;
};

export type BannerSlide = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  image?: string;
};

export type PresentSummary = {
  items: { id: string; name: string; qty: number; price: number }[];
  totalPoints: number;
};
