import { z } from "zod";

import { User, UserResponse } from "./user";

export const LoginSchema = z.strictObject({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.strictObject({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export type LoginResponse = {
  token: string;
  user: UserResponse;
};

export type LoginExtensionResponse = {
  token: string;
} & Pick<User, "isExtensionEnabled" | "imageFilterMode">;
