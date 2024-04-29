import { z } from "zod";

export const HTMLNodeSchema = z.strictObject({
  tag: z.string(),
  text: z.string().nullable(),
  id: z.string().nullable().optional(),
});

export const FilterContentRequestSchema = z.strictObject({
  url: z.string(),
  dom: z.array(HTMLNodeSchema),
  images: z.array(z.string()),
});

export type FilterContentRequest = z.infer<typeof FilterContentRequestSchema>;

export type HTMLNode = z.infer<typeof HTMLNodeSchema>;

export const HTMLNodesSchema = z.array(HTMLNodeSchema);

export type HTMLNodes = z.infer<typeof HTMLNodesSchema>;

export type Modification = {
  id: string;
  text: string;
};

export interface FilterContentResponse {
  modifications: Modification[];
  images: string[];
}
