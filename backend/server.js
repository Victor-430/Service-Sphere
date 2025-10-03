import express, { json, urlencoded } from "express";
import ConnectDB from "./config/db.js";
import cors from "cors";
import routeNotFound from "./middleware/routeError.js";
import authRoute from "./routes/auth.js";
import applicationRouter from "./routes/applications.js";
import userRoute from "./routes/users.js";

// mongoose connection
ConnectDB();

const app = express();

const PORT = process.env.PORT || 3000;

const LOCAL_ENV_URL = process.env.LOCAL_URL;

const PROD_ENV_URL = process.env.PRODUCTION_URL;

const allowedOrigins =
  process.env.NODE_ENV === "production" ? PROD_ENV_URL : LOCAL_ENV_URL;

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  }),
);

// Body parser
app.use(json());
app.use(urlencoded({ extended: false }));

// routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute.authRouter);
app.use("/api/services", applicationRouter);

// middleware
app.use(routeNotFound);

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
