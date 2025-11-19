import { Request, Response } from "express";
import { UserService } from "./user.service";

 const createUser = async (req: Request, res: Response) => {
  try {

    const certificateUrl = req.file ? (req.file as any).path : null;
    console.log("certificateUrl", certificateUrl);

    const result = await UserService.createUser({
      ...req.body,
      ...(certificateUrl && { certificate: certificateUrl }),
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 const updateUser = async (req: Request, res: Response) => {
  try {
    const certificateUrl = req.file ? (req.file as any).path : null;

    const result = await UserService.updateUser(req.params.id, {
      ...req.body,
      ...(certificateUrl && { certificate: certificateUrl }),
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 const deleteUser = async (req: Request, res: Response) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const user_controllers = {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
};
