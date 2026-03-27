import { z } from "zod";

export const SignUpSchema = z.object({
  full_name: z.string().min(2).max(120),
  company_name: z.string().min(2).max(160),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export type SignUpPayload = z.infer<typeof SignUpSchema>;
export type SignInPayload = z.infer<typeof SignInSchema>;
