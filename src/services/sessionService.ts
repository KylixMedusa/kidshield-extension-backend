import { InsertOneResult, ObjectId, WithId } from "mongodb";

import Mongo from "../db";
import { SessionValidator } from "../validators";

class SessionService {
  async createSession(
    session: SessionValidator.Session
  ): Promise<InsertOneResult<SessionValidator.Session>> {
    const newSession = await Mongo.sessions().insertOne(session);
    return newSession;
  }

  async getSessions(
    userId: string,
    query: SessionValidator.ReadSessionsRequest
  ): Promise<WithId<SessionValidator.ReadSessionsResponse>[]> {
    const page = Number(query.page);
    const limit = Number(query.limit || 10);

    const sessions = (await Mongo.sessions()
      .aggregate([
        {
          $match: {
            userId: userId,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: {
            userId: 0,
          },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ])
      .toArray()) as WithId<SessionValidator.ReadSessionsResponse>[];

    return sessions;
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const result = await Mongo.sessions().deleteOne({
      _id: new ObjectId(sessionId),
      userId,
    });

    if (result.deletedCount === 0) {
      throw new Error("Session not found");
    }

    return;
  }
}

export default new SessionService();
