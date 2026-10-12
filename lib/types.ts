export const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"] as const;
export type Category = (typeof CATEGORIES)[number];

export type EventRecord = {
  id: string;
  title: string;
  category: Category;
  city: string;
  date: string;
  price: number;
  description: string;
  imageUrl: string;
  active: boolean;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  favorites: Category[];
  reminders: string[];
  designs: Record<string, { theme: string; stickers: string[] }>;
};

export type Store = {
  events: EventRecord[];
  users: UserRecord[];
};
