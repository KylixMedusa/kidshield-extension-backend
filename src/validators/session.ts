import { z } from "zod";

export const SessionSchema = z.strictObject({
  url: z.string().url(),
  metadata: z.strictObject({
    icon: z.string().url(),
    title: z.string(),
    description: z.string().optional(),
  }),
  userId: z.string(),
  createdAt: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;

export const CreateSessionRequestSchema = z.strictObject({
  url: z.string().url(),
  metadata: z.strictObject({
    icon: z.string().url(),
    title: z.string(),
    description: z.string().optional(),
  }),
});

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const ReadSessionsRequestSchema = z.strictObject({
  page: z.string(),
  limit: z.string().optional(),
});

export type ReadSessionsRequest = z.infer<typeof ReadSessionsRequestSchema>;

export type ReadSessionsResponse = Omit<Session, "userId">[];

export const DeleteSessionRequestSchema = z
  .strictObject({
    sessionId: z.string(),
  })
  .strict();

export type DeleteSessionRequest = z.infer<typeof DeleteSessionRequestSchema>;
