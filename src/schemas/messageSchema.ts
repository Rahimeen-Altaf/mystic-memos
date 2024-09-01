import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(5, { message: "Message must be at least 3 character long" })
    .max(300, { message: "Message must be at most 300 characters long" }),
});
