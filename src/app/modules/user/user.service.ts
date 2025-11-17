import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";
import bcrypt from "bcrypt";

const createUser = async (payload: TUser) => {
  // Check if email already exists
  const existingEmailUser = await User_Model.findOne({ email: payload.email });
  if (existingEmailUser) {
    throw new Error("A user with this email address already exists.");
  }

  // Check if verified National ID already exists
  const existingNationalId = await User_Model.findOne({
    NationalIdNumber: payload.NationalIdNumber,
  });
  if (payload.NationalIdNumber && existingNationalId) {
    throw new Error(
      "The provided National ID number is already registered and verified."
    );
  }

  // 3. Check if password matches confirm password
  if (payload.password !== payload.comfirmPassword) {
    throw new Error("Password and confirm password do not match.");
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUND);

  if (isNaN(saltRounds)) {
    throw new Error("Invalid bcrypt salt round value in environment variable.");
  }

  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  // Replace original password with hashed one
  payload.password = hashedPassword;

  // Create new user
  const newUser = await User_Model.create(payload);
  return newUser;
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  // Create a copy without email
  const { email, password, comfirmPassword, ...updateData } = payload;

  return User_Model.findByIdAndUpdate(id, updateData, { new: true });
};

const getAllUsers = async () => {
  return User_Model.find();
};

const getUserById = async (id: string) => {
  return User_Model.findById(id);
};

const deleteUser = async (id: string) => {
  return User_Model.findByIdAndDelete(id);
};

export const UserService = {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
};
