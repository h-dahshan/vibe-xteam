import { registerAs } from "@nestjs/config";
import type { CommunicationConfig } from "../types/config.types";

/**
 * Communication configuration namespace
 * Loads email and SMS provider configurations
 */
export default registerAs(
  "communication",
  (): CommunicationConfig => ({
    resend: {
      apiKey: process.env.RESEND_API_KEY!, // REQ
      fromEmail: process.env.RESEND_FROM_EMAIL!, // REQ
      fromName: process.env.RESEND_FROM_NAME!, // REQ
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID!, // REQ
      authToken: process.env.TWILIO_AUTH_TOKEN!, // REQ
      phoneNumber: process.env.TWILIO_PHONE_NUMBER!, // REQ
    },
  })
);
