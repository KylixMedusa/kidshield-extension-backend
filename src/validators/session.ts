import { z } from "zod";

export const SessionSchema = z
  .object({
    url: z.string().url(),
    metadata: z
      .object({
        icon: z.string().url(),
        title: z.string(),
        description: z.string().optional(),
      })
      .strict(),
    userId: z.string(),
    createdAt: z.string(),
  })
  .strict();

export type Session = z.infer<typeof SessionSchema>;

export const CreateSessionRequestSchema = z
  .object({
    url: z.string().url(),
    metadata: z
      .object({
        icon: z.string().url(),
        title: z.string(),
        description: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const ReadSessionsRequestSchema = z
  .object({
    page: z.string(),
    limit: z.string().optional(),
  })
  .strict();

export type ReadSessionsRequest = z.infer<typeof ReadSessionsRequestSchema>;

export type ReadSessionsResponse = Omit<Session, "userId">[];

export const DeleteSessionRequestSchema = z
  .object({
    sessionId: z.string(),
  })
  .strict();

export type DeleteSessionRequest = z.infer<typeof DeleteSessionRequestSchema>;
