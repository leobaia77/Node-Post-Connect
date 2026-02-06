import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : undefined;

app.use(cors({
  origin: allowedOrigins || true,
  credentials: true,
}));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const redacted = { ...capturedJsonResponse };
        const sensitiveKeys = ["token", "passwordHash", "securityWordHash", "email"];
        for (const key of sensitiveKeys) {
          if (key in redacted) {
            redacted[key] = "[REDACTED]";
          }
        }
        if (redacted.user) {
          redacted.user = "[REDACTED]";
        }
        logLine += ` :: ${JSON.stringify(redacted).substring(0, 200)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // Add a simple health check endpoint for the mobile app
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "GrowthTrack API Server" });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    async () => {
      log(`serving on port ${port}`);
      
      // Start safety check scheduler if enabled via env var
      // Default: enabled in production, disabled in development
      const enableScheduler = process.env.ENABLE_SAFETY_SCHEDULER === "true" || 
                              process.env.NODE_ENV === "production";
      const schedulerTargetHour = parseInt(process.env.SAFETY_CHECK_HOUR || "8", 10);
      const schedulerTimezone = process.env.SAFETY_CHECK_TIMEZONE || "America/New_York";
      
      if (enableScheduler) {
        const { startSafetyCheckScheduler } = await import("./services/safetyChecker");
        startSafetyCheckScheduler(schedulerTargetHour, schedulerTimezone);
        log(`Safety check scheduler started (daily at ${schedulerTargetHour}:00 ${schedulerTimezone})`);
      }
    },
  );
})();
