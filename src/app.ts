import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/global_error_handler";
import notFound from "./app/middlewares/not_found_api";
import appRouter from "./routes";
import { User_Model } from "./app/modules/user/user.schema";
import bcrypt from "bcrypt";
import { configs } from "./app/configs";

const app = express();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", appRouter);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is running successfully!",
  });
});

// Create Default Admin
export const createDefaultSuperAdmin = async () => {
  try {
    const existingAdmin = await User_Model.findOne({
      email: "admin@gmail.com",
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(
        "admin@123",
        Number(configs.bcrypt_salt_rounds)
      );

      await User_Model.create({
        fullName: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        comfirmPassword: hashedPassword,
        role: "admin",
      });
      console.log("✅ Default Admin created.");
    } else {
      console.log("ℹ️ Admin already exists.");
    }
  } catch (error) {
    console.log("❌ Failed to create default admin:", error);
  }
};

createDefaultSuperAdmin();

// global error handler
app.use(globalErrorHandler);
app.use(notFound);

export default app;
