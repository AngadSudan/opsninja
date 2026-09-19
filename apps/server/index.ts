import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { getConfigValue, loadConfig } from "./utils/config";
import { seedDB } from "./utils/db";
import {
  AtlassianOAuthHandler,
  AtlassianOAuthInitiator,
  cognitoOAuthHandler,
  cognitoOAuthInitiator,
  logoutHandler,
} from "./utils/provider";
import projectRouter from "./routes/project.route";
import userRouter from "./routes/user.route";
import integrationRouter from "./routes/integration.route";
import chatRouter from "./routes/chat.route";
import messageRouter from "./routes/message.route";
import meetingRouter from "./routes/meeting.route";
import actionRouter from "./routes/action.route";

await loadConfig();

const app: Express = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 200,
  message: "Too many requests from this IP, please try again after 10 minutes",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 auth requests per window
  message: "Too many authentication attempts, please try again after 15 minutes",
});

app.use(morgan("dev") as any);

//@ts-ignore
app.use(helmet());
app.use("/api", limiter);
app.use("/api/v1/auth", authLimiter);
app.use(hpp() as any);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = getConfigValue("FRONTEND_URL", "http://localhost:3000")
        .split(",")
        .map(url => url.trim());

      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Origin",
      "Accept",
    ],
  }),
);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Backend of opsNinja. ",
    version: "1.0.0",
    timestamp: new Date(),
    environment: getConfigValue("NODE_ENV", "development"),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    FRONTEND_URL: getConfigValue("FRONTEND_URL", "http://localhost:3000"),
  });
});
app.get("/health", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy!",
    timestamp: new Date(),
    environment: getConfigValue("NODE_ENV", "development"),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    FRONTEND_URL: getConfigValue("FRONTEND_URL", "http://localhost:3000"),
  });
});
declare global {
  namespace Express {}
}

app.get("/api/v1/auth/jira", AtlassianOAuthInitiator);
app.get("/api/v1/auth/jira/callback", AtlassianOAuthHandler);
app.get("/api/v1/auth/cognito", cognitoOAuthInitiator);
app.get("/api/v1/auth/cognito/callback", cognitoOAuthHandler);
app.post("/api/v1/auth/setup-cookie", (req: Request, res: Response) => {
  // This endpoint acknowledges the cookie setup from the auth-success page
  // The cookie is already set by cognitoOAuthHandler, this just confirms it
  res.status(200).json({
    success: true,
    message: "Cookie setup acknowledged",
  });
});
app.get("/api/v1/auth/logout", logoutHandler);

app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/integrations", integrationRouter);
app.use("/api/v1/projects/:projectId/chats", chatRouter);
app.use("/api/v1/projects/:projectId/chats/:chatId/messages", messageRouter);
app.use("/api/v1/projects/:projectId/meetings", meetingRouter);
app.use("/api/v1/projects/:projectId/meetings/:meetingId/actions", actionRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});
seedDB()
  .then(() => {
    const port = getConfigValue("PORT", "8000");

    console.log("DB Ready");
    app.listen(port, () => {
      console.log(`server start at port : ${port}`);
    });
  })
  .catch(() => {
    console.log("ERROR connecting to db....");
  });

export { app as default };
