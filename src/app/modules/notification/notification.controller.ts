import catchAsync from "../../utils/catch_async";
import manageResponse from "../../utils/manage_response";
import httpStatus from "http-status";
import { notification_service } from "./notification.service";

const create_new_notification = catchAsync(async (req, res) => {
  const result = await notification_service.create_new_notification_into_db();
  manageResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New notification created successfully!",
    data: result,
  });
});

export const notification_controller = {
  create_new_notification,
};
  