import { randomUUID } from "node:crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool } from "./db";
import { CATEGORIES, type Category, type EventRecord, type Store } from "./types";

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

type EventRow = RowDataPacket & {
  id: string;
  title: string;
  category: Category;
  city: string;
  date: string;
  price: number;
  description: string;
  imageUrl: string;
  active: number;
};

type UserRow = RowDataPacket & { id: string; email: string; passwordHash: string };
type FavoriteRow = RowDataPacket & { userId: string; category: Category };
type ReminderRow = RowDataPacket & { userId: string; eventId: string };
type DesignRow = RowDataPacket & { userId: string; eventId: string; theme: string; stickers: string[] | string };

async function readStoreWith(connection: PoolConnection): Promise<Store> {
  const [events] = await connection.query<EventRow[]>(
    `SELECT id, title, category, city,
            DATE_FORMAT(event_date, '%Y-%m-%dT%H:%i:%s.000Z') AS date,
            price, description, image_url AS imageUrl, active
     FROM events`
  );
  const [users] = await connection.query<UserRow[]>(
    "SELECT id, email, password_hash AS passwordHash FROM users"
  );
  const [favorites] = await connection.query<FavoriteRow[]>(
    "SELECT user_id AS userId, category FROM user_favorites"
  );
  const [reminders] = await connection.query<ReminderRow[]>(
    "SELECT user_id AS userId, event_id AS eventId FROM user_reminders"
  );
  const [designs] = await connection.query<DesignRow[]>(
    "SELECT user_id AS userId, event_id AS eventId, theme, stickers FROM user_event_designs"
  );

  return {
    events: events.map((event) => ({
      ...event,
      price: Number(event.price),
      active: Boolean(event.active)
    })),
    users: users.map((user) => {
      const userDesigns: Record<string, { theme: string; stickers: string[] }> = {};
      for (const design of designs) {
        if (design.userId === user.id) {
          userDesigns[design.eventId] = {
            theme: design.theme,
            stickers: typeof design.stickers === "string" ? JSON.parse(design.stickers) as string[] : design.stickers
          };
        }
      }
      return {
        ...user,
        favorites: favorites.filter((favorite) => favorite.userId === user.id).map((favorite) => favorite.category),
        reminders: reminders.filter((reminder) => reminder.userId === user.id).map((reminder) => reminder.eventId),
        designs: userDesigns
      };
    })
  };
}

export async function readStore(): Promise<Store> {
  await seedIfEmpty();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const store = await readStoreWith(connection);
    await connection.commit();
    return store;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

let seedPromise: Promise<void> | undefined;

function seedIfEmpty(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query("SELECT id FROM store_write_lock WHERE id = 1 FOR UPDATE");
        const [rows] = await connection.query<Array<RowDataPacket & { count: number }>>(
          "SELECT COUNT(*) AS count FROM events"
        );
        if (Number(rows[0].count) === 0) {
          const seed = await createSeed();
          for (const event of seed.events) await saveEvent(connection, event);
        }
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    })().catch((error: unknown) => {
      seedPromise = undefined;
      throw error;
    });
  }
  return seedPromise;
}

async function saveEvent(connection: PoolConnection, event: EventRecord) {
  await connection.execute(
    `INSERT INTO events (id, title, category, city, event_date, price, description, image_url, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), category = VALUES(category), city = VALUES(city),
       event_date = VALUES(event_date), price = VALUES(price), description = VALUES(description),
       image_url = VALUES(image_url), active = VALUES(active)`,
    [event.id, event.title, event.category, event.city, event.date.slice(0, 19).replace("T", " "), event.price, event.description, event.imageUrl, event.active]
  );
}

async function saveUser(connection: PoolConnection, user: Store["users"][number]) {
  await connection.execute(
    `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE email = VALUES(email), password_hash = VALUES(password_hash)`,
    [user.id, user.email, user.passwordHash]
  );
  await connection.execute("DELETE FROM user_favorites WHERE user_id = ?", [user.id]);
  await connection.execute("DELETE FROM user_reminders WHERE user_id = ?", [user.id]);
  await connection.execute("DELETE FROM user_event_designs WHERE user_id = ?", [user.id]);

  for (const category of user.favorites) {
    await connection.execute("INSERT INTO user_favorites (user_id, category) VALUES (?, ?)", [user.id, category]);
  }
  for (const eventId of user.reminders) {
    await connection.execute("INSERT INTO user_reminders (user_id, event_id) VALUES (?, ?)", [user.id, eventId]);
  }
  for (const [eventId, design] of Object.entries(user.designs)) {
    await connection.execute(
      "INSERT INTO user_event_designs (user_id, event_id, theme, stickers) VALUES (?, ?, ?, ?)",
      [user.id, eventId, design.theme, JSON.stringify(design.stickers)]
    );
  }
}

export async function updateStore<T>(update: (store: Store) => T | Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SELECT id FROM store_write_lock WHERE id = 1 FOR UPDATE");
    const before = await readStoreWith(connection);
    const after = structuredClone(before);
    const result = await update(after);
    const oldUsers = new Map(before.users.map((user) => [user.id, user]));
    const newUsers = new Map(after.users.map((user) => [user.id, user]));
    const oldEvents = new Map(before.events.map((event) => [event.id, event]));
    const newEvents = new Map(after.events.map((event) => [event.id, event]));

    for (const id of oldUsers.keys()) {
      if (!newUsers.has(id)) await connection.execute("DELETE FROM users WHERE id = ?", [id]);
    }
    for (const id of oldEvents.keys()) {
      if (!newEvents.has(id)) await connection.execute("DELETE FROM events WHERE id = ?", [id]);
    }
    for (const [id, event] of newEvents) {
      if (JSON.stringify(oldEvents.get(id)) !== JSON.stringify(event)) await saveEvent(connection, event);
    }
    for (const [id, user] of newUsers) {
      if (JSON.stringify(oldUsers.get(id)) !== JSON.stringify(user)) await saveUser(connection, user);
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
