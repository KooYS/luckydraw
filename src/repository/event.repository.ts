import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { BaseRepository } from "./base.repository";

/** 이벤트 리포지토리 */
class EventRepository extends BaseRepository<typeof events> {
  constructor() {
    super(events);
  }

  /** 활성 이벤트 조회 */
  async findActive() {
    return db
      .select()
      .from(this.table)
      .where(and(this.notDeleted, eq(events.isActive, true)));
  }

  /** 이벤트 생성 */
  async createEvent(data: {
    name: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    posterUrl?: string;
    logoUrl?: string;
    isActive?: boolean;
  }) {
    const [result] = await db.insert(events).values({
      name: data.name,
      description: data.description,
      primaryColor: data.primaryColor ?? "#c026d3",
      secondaryColor: data.secondaryColor ?? "#701a75",
      backgroundColor: data.backgroundColor ?? "#fdf4ff",
      textColor: data.textColor ?? "#1f2937",
      accentColor: data.accentColor ?? "#e879f9",
      posterUrl: data.posterUrl,
      logoUrl: data.logoUrl,
      isActive: data.isActive ?? true,
    });
    return result;
  }

  /** 이벤트 활성 상태 토글 */
  async toggleActive(id: number) {
    const event = await this.findById(id);
    if (!event) return null;

    await this.update(id, { isActive: !event.isActive });
    return { ...event, isActive: !event.isActive };
  }
}

export const eventRepository = new EventRepository();
