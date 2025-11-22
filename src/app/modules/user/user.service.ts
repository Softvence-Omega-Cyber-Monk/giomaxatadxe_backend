import { cleanRegex } from "zod/v4/core/util.cjs";
import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";
import bcrypt from "bcrypt";
import { Patient_Model } from "../patient/patient.model";
import mongoose from "mongoose";
import { SoloNurse_Model } from "../soloNurse/soloNurse.model";
import { Clinic_Model } from "../clinic/clinic.model";

export const createPatient = async (payload: TUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if email already exists
    const existingEmail = await User_Model.findOne(
      { email: payload.email },
      null,
      { session }
    );

    if (existingEmail) {
      throw new Error("The provided email is already registered.");
    }

    // Extract
    const { fullName, email, password, comfirmPassword, ...patientPayload } =
      payload;

    // 2. Check password === confirm password
    if (password !== comfirmPassword) {
      throw new Error("Password and confirm password do not match.");
    }

    // 3. Hash Password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUND);
    if (isNaN(saltRounds)) {
      throw new Error(
        "Invalid bcrypt salt round value in environment variable."
      );
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Prepare user data
    const newUserData = {
      fullName,
      email,
      password: hashedPassword,
      comfirmPassword: hashedPassword,
      role: "patient",
    };

    // 5. Create User with session
    const newUser = await User_Model.create([newUserData], { session });
    const createdUser = newUser[0];
    console.log("new user", createdUser);

    // 6. Create Patient using new userId
    const newPatient = await Patient_Model.create(
      [{ ...patientPayload, userId: createdUser._id }],
      { session }
    );

    // 7. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return newPatient[0];
  } catch (error) {
    // ❌ If anything fails → rollback all operations
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const createSoloNurse = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password, comfirmPassword, ...nursePayload } =
      payload;

    // Check email
    const existingEmail = await User_Model.findOne({ email }, null, {
      session,
    });
    if (existingEmail) {
      throw new Error("Email already exists.");
    }

    // Validate passwords
    if (password !== comfirmPassword) {
      throw new Error("Password and confirm password do not match.");
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUND);
    const hashedPass = await bcrypt.hash(password, saltRounds);

    const newUser = await User_Model.create(
      [
        {
          fullName,
          email,
          password: hashedPass,
          comfirmPassword: hashedPass,
          role: "solo_nurse",
        },
      ],
      { session }
    );

    const createdNurse = await SoloNurse_Model.create(
      [{ ...nursePayload, userId: newUser[0]._id }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return createdNurse[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const createClinic = async (payload: any) => {
  // console.log('from service',payload);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password, comfirmPassword, ...clinicpayload } =
      payload;

    // Check email
    const existingEmail = await User_Model.findOne({ email }, null, {
      session,
    });
    if (existingEmail) {
      throw new Error("Email already exists.");
    }

    // Validate passwords
    if (password !== comfirmPassword) {
      throw new Error("Password and confirm password do not match.");
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUND);
    const hashedPass = await bcrypt.hash(password, saltRounds);

    const newUser = await User_Model.create(
      [
        {
          fullName,
          email,
          password: hashedPass,
          comfirmPassword: hashedPass,
          role: "clinic",
        },
      ],
      { session }
    );

    const createClinic = await Clinic_Model.create(
      [{ ...clinicpayload, userId: newUser[0]._id }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();


    return createClinic[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



export const UserService = {
  createPatient,
  createSoloNurse,
  createClinic
};
