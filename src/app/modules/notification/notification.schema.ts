import { Schema, model } from "mongoose";
import { T_Notification } from "./notification.interface";

const notification_schema = new Schema<T_Notification>({});

export const notification_model = model("notification", notification_schema);
  