import { z } from "zod";

/**
 * Communication services configuration schema - Required
 */
export const communicationSchema = z.object({
  // Resend Email Service
  RESEND_API_KEY: z
    .string()
    .min(1, "RESEND_API_KEY is required")
    .startsWith("re_", "RESEND_API_KEY must start with re_"),
  RESEND_FROM_EMAIL: z.email("RESEND_FROM_EMAIL must be a valid email address"),
  RESEND_FROM_NAME: z.string().min(1, "RESEND_FROM_NAME is required"),

  // Twilio SMS Service
  TWILIO_ACCOUNT_SID: z
    .string()
    .min(1, "TWILIO_ACCOUNT_SID is required")
    .startsWith("AC", "TWILIO_ACCOUNT_SID must start with AC"),
  TWILIO_AUTH_TOKEN: z.string().min(1, "TWILIO_AUTH_TOKEN is required"),
  TWILIO_PHONE_NUMBER: z
    .string()
    .min(1, "TWILIO_PHONE_NUMBER is required")
    .regex(
      /^\+\d{10,15}$/,
      "TWILIO_PHONE_NUMBER must be in E.164 format (+1234567890)"
    ),
});

export type CommunicationSchemaType = z.infer<typeof communicationSchema>;
