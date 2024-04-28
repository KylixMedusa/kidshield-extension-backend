import { z } from "zod";

export type User = {
  name: string;
  email: string;
  password: string;

  isExtensionEnabled: boolean;
  filterStrictness: number;
  imageFilterMode: "blur" | "hide" | "grayscale";
};

export const UpdateUserSchema = z
  .object({
    name: z.string().optional(),
    password: z.string().optional(),

    isExtensionEnabled: z.boolean().optional(),
    filterStrictness: z.number().optional(),
    imageFilterMode: z.enum(["blur", "hide", "grayscale"]).optional(),
  })
  .strict();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
