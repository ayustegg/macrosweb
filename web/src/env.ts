import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("Invalid or missing NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Missing SUPABASE_SERVICE_ROLE_KEY")
    .optional(),
  OPENFOODFACTS_USER_AGENT: z
    .string()
    .min(1, "Missing OPENFOODFACTS_USER_AGENT")
    .optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

// Extract only the variables we care about to avoid Next.js static optimization issues
// We use a try/catch to ensure it fails with a clear message during boot
const parseEnv = () => {
  const isServer = typeof window === "undefined";

  const processEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Only access server variables on the server
    ...(isServer && {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENFOODFACTS_USER_AGENT: process.env.OPENFOODFACTS_USER_AGENT,
      SENTRY_DSN: process.env.SENTRY_DSN,
    }),
  };

  const parsed = envSchema.safeParse(processEnv);

  if (!parsed.success) {
    const errors = parsed.error.format();
    const missingKeys = Object.keys(errors).filter((key) => key !== "_errors");

    const message = `❌ Invalid or missing environment variables: ${missingKeys.join(", ")}\nCheck your .env.local file.`;

    console.error(message);
    throw new Error(message);
  }

  // Enforce server-only variables on the server
  if (isServer) {
    if (!parsed.data.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "❌ Missing environment variable: SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    if (!parsed.data.OPENFOODFACTS_USER_AGENT) {
      throw new Error(
        "❌ Missing environment variable: OPENFOODFACTS_USER_AGENT"
      );
    }
  }

  return parsed.data as {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    OPENFOODFACTS_USER_AGENT: string;
    SENTRY_DSN?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
  };
};

export const env = parseEnv();
