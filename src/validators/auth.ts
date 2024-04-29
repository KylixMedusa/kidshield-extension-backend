import { z } from "zod";

export const LoginSchema = z.strictObject({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.strictObject({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export type LoginResponse = {
  token: string;
};

export type RegisterResponse = {
  token: string;
};
