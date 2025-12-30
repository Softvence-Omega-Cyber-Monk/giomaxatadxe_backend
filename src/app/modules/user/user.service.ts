import { cleanRegex } from "zod/v4/core/util.cjs";
import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";
import bcrypt from "bcrypt";
import { Patient_Model } from "../patient/patient.model";
import mongoose from "mongoose";
import { SoloNurse_Model } from "../soloNurse/soloNurse.model";
import { Clinic_Model } from "../clinic/clinic.model";
import crypto from "crypto";
import { Doctor_Model } from "../doctor/doctor.model";
import { sendEmail } from "../../utils/sendEmail";

const generateRandomCodeForPatient = () => {
  return crypto.randomBytes(3).toString("hex"); // 6 chars
};
const generateRandomCodeForSoloNurse = () => {
  return crypto.randomBytes(3).toString("hex"); // 6 chars
};
const generateRandomCodeForClinic = () => {
  return crypto.randomBytes(3).toString("hex"); // 6 chars
};
const generateRandomPassword = () => {
  return crypto.randomBytes(6).toString("base64"); // ~8–10 chars
};

export const createPatient = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const verificationCode = generateRandomCodeForPatient();
  // console.log("from service", payload);
  if (payload.dateOfBirth) {
    const dob = new Date(payload.dateOfBirth);
    const today = new Date();

    if (isNaN(dob.getTime())) {
      throw new Error("Invalid date of birth");
    }

    if (dob > today) {
      throw new Error("Date of birth cannot be in the future.");
    }

    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    // If birthday has not occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    // Optional: validate minimum age
    if (age < 0) {
      throw new Error("Invalid age calculated");
    }

    payload.age = age; // store or use age
  }

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
      verificationCode,
    };

    // 5. Create User with session
    const newUser = await User_Model.create([newUserData], { session });
    const createdUser = newUser[0];
    console.log("new user", createdUser);

    // 6. Create Patient using new userId
    const newPatient = await Patient_Model.create(
      [{ ...patientPayload, age: payload.age, userId: createdUser._id }],
      { session }
    );

    // 7. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    await sendEmail({
      to: email,
      subject: "Your Patient Account Verification Code",
      html: `
        <h2>Welcome, ${fullName}</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Verification Code:</strong> ${verificationCode}</p>
        <p>Please use this code to verify your account.</p>
      `,
    });

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

  const verificationCode = generateRandomCodeForSoloNurse();
  console.log('nurse code ', verificationCode);
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
          verificationCode,
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

    await sendEmail({
      to: email,
      subject: "Your Solo Nurse Account Verification Code",
      html: `
        <h2>Welcome, ${fullName}</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Verification Code:</strong> ${verificationCode}</p>
        <p>Please use this code to verify your account.</p>
      `,
    });

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

  const verificationCode = generateRandomCodeForClinic();

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
          verificationCode,
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

    await sendEmail({
      to: email,
      subject: "Your Clinic Account Verification Code",
      html: `
        <h2>Welcome, ${fullName}</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Verification Code:</strong> ${verificationCode}</p>
        <p>Please use this code to verify your account.</p>
      `,
    });

    return createClinic[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const createDoctor = async (payload: any) => {
  console.log("from service", payload);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      clinicId,
      doctorName,
      email,
      startTime,
      endTime,
      ...doctorPayload
    } = payload;

    const workingHour = {
      startTime,
      endTime,
    };
    const password = generateRandomPassword();
    console.log("password genarete successfull", password);

    // Check email
    const existingEmail = await User_Model.findOne({ email }, null, {
      session,
    });
    if (existingEmail) {
      throw new Error("Email already exists.");
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUND);
    const hashedPass = await bcrypt.hash(password, saltRounds);

    const newUser = await User_Model.create(
      [
        {
          fullName: doctorName,
          email,
          password: hashedPass,
          comfirmPassword: hashedPass,
          role: "doctor",
        },
      ],
      { session }
    );

    const createClinic = await Doctor_Model.create(
      [{ ...doctorPayload, workingHour, userId: newUser[0]._id, clinicId }],
      { session }
    );

    // -------- 5. Send Email With Credentials --------
    await sendEmail({
      to: email,
      subject: "Your Doctor Account Login Credentials",
      html: `
        <h2>Welcome, Dr. ${doctorName}</h2>
        <p>Your account has been Registered successfully.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please login and update your password.</p>
      `,
    });

    await session.commitTransaction();
    session.endSession();

    return createClinic[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAdmin = async () => {
  const admin = await User_Model.findOne({ role: "admin" });
  return admin;
};

const verifyUser = async (userId: string, code: string) => {
  const user = await User_Model.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.verificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  user.isVerified = true;
  user.verificationCode = undefined; // Clear the code after verification
  await user.save();

  return user;
};

export const UserService = {
  createPatient,
  createSoloNurse,
  createClinic,
  createDoctor,
  getAdmin,
  verifyUser,
};
