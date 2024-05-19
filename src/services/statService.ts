import Mongo from "../db";
import { StatsValidator } from "../validators";

class StatService {
  async getStats(userId: string): Promise<StatsValidator.StatValues> {
    const stats = await Mongo.stats().findOne({ userId });

    return {
      totalVisits: stats?.stats.totalVisits ?? 0,
      totalFilteredVisits: stats?.stats.totalFilteredVisits ?? 0,
      totalBlockedImages: stats?.stats.totalBlockedImages ?? 0,
    };
  }

  async updateStats(userId: string, stats: Partial<StatsValidator.StatValues>) {
    let updatedStats = await Mongo.stats().findOne({ userId });

    if (!updatedStats) {
      await Mongo.stats().insertOne({
        userId,
        stats: {
          totalVisits: 0,
          totalFilteredVisits: 0,
          totalBlockedImages: 0,
          ...stats,
        },
      });
    } else {
      await Mongo.stats().updateOne(
        { userId },
        {
          $inc: {
            "stats.totalVisits": stats.totalVisits ?? 0,
            "stats.totalFilteredVisits": stats.totalFilteredVisits ?? 0,
            "stats.totalBlockedImages": stats.totalBlockedImages ?? 0,
          },
        }
      );
    }
  }
}

export default new StatService();
