import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { CATEGORIES, type Category, type EventRecord, type Store } from "./types";

const storePath = path.join(process.cwd(), "data", "store.json");

function dateIn(days: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const seedEvents: Omit<EventRecord, "id">[] = [
  { title: "Moonlight Indie Night", category: "Music", city: "Coimbatore", date: dateIn(4, 18), price: 499, description: "An intimate night of indie sounds, local artists and good company under the open sky.", imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Clay & Chai: Pottery Workshop", category: "Workshop", city: "Chennai", date: dateIn(7, 10), price: 850, description: "Get your hands muddy and make something lovely. All materials, tea and friendly guidance are included.", imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "The Sunday Food Fair", category: "Food", city: "Coimbatore", date: dateIn(2, 11), price: 0, description: "A delicious little gathering of neighbourhood kitchens, seasonal produce and street-food favourites.", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Neighbourhood 5K & Breakfast", category: "Sports", city: "Bengaluru", date: dateIn(12, 6), price: 250, description: "A relaxed community run for every pace, with a fresh breakfast waiting at the finish line.", imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Little Explorers' Garden Day", category: "Kids", city: "Chennai", date: dateIn(9, 9), price: 150, description: "A playful morning of nature crafts, seed planting and tiny discoveries for curious kids.", imageUrl: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Acoustic Rooftop Night", category: "Music", city: "Bengaluru", date: dateIn(16, 19), price: 699, description: "Golden-hour views, stripped-back sets and a rooftop full of new friends.", imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Make Your Own Pasta", category: "Workshop", city: "Coimbatore", date: dateIn(20, 15), price: 1200, description: "Learn the art of fresh pasta from scratch in this hands-on, small-group kitchen session.", imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Monsoon Millet Festival", category: "Food", city: "Chennai", date: dateIn(24, 12), price: 99, description: "Meet the makers and taste the many delicious ways local millets are finding their way back to our plates.", imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Community Badminton Social", category: "Sports", city: "Coimbatore", date: dateIn(28, 8), price: 100, description: "Easy-going doubles, friendly faces and no experience required. Rackets available to borrow.", imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Storytime Under the Banyan", category: "Kids", city: "Bengaluru", date: dateIn(32, 16), price: 0, description: "Bring a blanket for an afternoon of stories, songs and a little make-believe beneath the trees.", imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Coastal Sounds: Live", category: "Music", city: "Chennai", date: dateIn(-5, 18), price: 450, description: "A celebration of new sounds from across the coast, hosted by the local music community.", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=85", active: true },
  { title: "Watercolour for Beginners", category: "Workshop", city: "Bengaluru", date: dateIn(5, 14), price: 700, description: "Explore colour, brushwork and the joy of making a mess in this beginner-friendly art class.", imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85", active: false },
  { title: "Sunday Brunch Club", category: "Food", city: "Bengaluru", date: dateIn(13, 11), price: 599, description: "A long-table brunch with local cooks, seasonal menus and the kind of conversations that linger.", imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85", active: false },
  { title: "Parkside Mini Olympics", category: "Kids", city: "Coimbatore", date: dateIn(18, 9), price: 0, description: "A joyful morning of silly races, team games and small victories for kids of all ages.", imageUrl: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=1200&q=85", active: false },
  { title: "Open-Air Film & Food Night", category: "Food", city: "Chennai", date: dateIn(-12, 19), price: 350, description: "A film, a picnic blanket and great food from local vendors. The perfect evening out.", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85", active: true }
];

async function createSeed(): Promise<Store> {
  return {
    events: seedEvents.map((event) => ({ ...event, id: randomUUID() })),
    users: []
  };
}

export async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await readFile(storePath, "utf8")) as Store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const initial = await createSeed();
    await writeStore(initial);
    return initial;
  }
}

export async function writeStore(store: Store) {
  await mkdir(path.dirname(storePath), { recursive: true });
  const temporary = `${storePath}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(store, null, 2), "utf8");
  await rename(temporary, storePath);
}

let pendingWrite = Promise.resolve();
export function updateStore<T>(update: (store: Store) => T | Promise<T>): Promise<T> {
  const operation = pendingWrite.then(async () => {
    const store = await readStore();
    const result = await update(store);
    await writeStore(store);
    return result;
  });
  pendingWrite = operation.then(() => undefined, () => undefined);
  return operation;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
