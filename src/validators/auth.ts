import { z } from "zod";

export const LoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export const RegisterSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginSchema>;

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export type LoginResponse = {
  token: string;
};

export type RegisterResponse = {
  token: string;
};
