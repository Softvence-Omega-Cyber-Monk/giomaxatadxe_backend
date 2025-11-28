import { Clinic_Model } from "./clinic.model";
import { TClinic } from "./clinic.interface";
import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";
import { Doctor_Model } from "../doctor/doctor.model";

const getAllClinics = async () => {
  const result = await Clinic_Model.find().populate("userId");
  return result;
};

const getClinicById = async (userId: string) => {
  const result = await Clinic_Model.findOne({ userId }).populate("userId");
  return result;
};
const getClinicDoctors = async (clinicId: string) => {
  // console.log("clinti id 0", clinicId);
  const result = await Doctor_Model.find({ clinicId }).populate("userId");
  return result;
};

const updateClinicBasic = async (
  userId: string,
  payload: any,
  profileImageUrl : string
) => {
  const { fullName, email, phoneNumber, servicesOffered, clinicDescription } =
    payload;

  const servicesOfferedData = servicesOffered
    ?.split(",")
    .map((service: string) => service.trim());

  console.log("user id form service ", userId);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // step-1: Update user model
    const updatedUser = await User_Model.findByIdAndUpdate(
      userId,
      { fullName, profileImage: profileImageUrl },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new Error("User not found!");
    }

    // step-2: Update clinic model
    const updatedClinic = await Clinic_Model.findOneAndUpdate(
      { userId },
      {
        phoneNumber,
        servicesOffered: servicesOfferedData,
        clinicDescription,
      },
      { new: true, session }
    ).populate("userId");

    if (!updatedClinic) {
      throw new Error("Clinic profile not found!");
    }

    // commit both updates
    await session.commitTransaction();
    session.endSession();

    return updatedClinic;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log(error);
  }
};
const uploadCertificate = async (userId: string, payload: any) => {
  // console.log("payload from service ", payload);

  const clinic = await Clinic_Model.findOne({ userId });

  if (!clinic) {
    throw new Error("Clinic not found for this user");
  }

  const newCertificate = {
    uploadCertificates: payload.certificateUrl, // correct field name
    certificateType: payload.data?.certificateType,
    certificateName: payload.data?.certificateName,
  };

  // console.log("service ", newCertificate);

  const updatedCertificates = await Clinic_Model.findOneAndUpdate(
    { userId },
    {
      $push: { clinicCertificates: newCertificate },
      medicalLicenseNumber: payload.data?.medicalLicenseNumber, // optional
    },
    { new: true }
  );
  return updatedCertificates;
};
const deleteCertificate = async (userId: string, certificateId: string) => {
  // Find the user first
  const nurse = await Clinic_Model.findOne({ userId });

  if (!nurse) {
    throw new Error("Solo nurse not found for this user");
  }

  console.log("service form clinic", userId, certificateId);
  // Perform delete using $pull
  const updated = await Clinic_Model.findOneAndUpdate(
    { userId },
    {
      $pull: {
        clinicCertificates: { _id: certificateId },
      },
    },
    { new: true }
  );

  return updated;
};

const availabilitySettings = async (userId: string, payload: any) => {
  console.log("payload from service ", payload);

  const availability = {
    startTime: payload?.startTime,
    endTime: payload?.endTime,
    workingDays: payload?.workingDays,
    appointmentType: payload?.appointmentType,
  };

  const clinic = await Clinic_Model.findOne({ userId });

  if (!clinic) {
    throw new Error("Clinic not found for this user");
  }

  const updatedCertificates = await Clinic_Model.findOneAndUpdate(
    { userId },
    {
      $set: { availability },
    },
    { new: true }
  );
  return updatedCertificates;
};
const addNewPaymentMethod = async (userId: string, payload: any) => {
  console.log("payload from service ", payload);

  const clinic = await Clinic_Model.findOne({ userId });

  if (!clinic) {
    throw new Error("Clinic not found for this user");
  }

  const newMethod = {
    cardHolderName: payload.cardHolderName,
    cardNumber: payload.cardNumber,
    cvv: payload.cvv,
    expiryDate: payload.expiryDate,
  };

  // push into nested array
  const updatedClinic = await Clinic_Model.findOneAndUpdate(
    { userId },
    {
      $push: { "paymentAndEarnings.withdrawalMethods": newMethod },
    },
    { new: true }
  );

  return updatedClinic;
};

const deleteClinic = async (id: string) => {
  const result = await Clinic_Model.findByIdAndDelete(id);
  return result;
};

export const ClinicService = {
  getAllClinics,
  getClinicById,
  getClinicDoctors,
  updateClinicBasic,
  uploadCertificate,
  deleteCertificate,
  availabilitySettings,
  addNewPaymentMethod,
  deleteClinic,
};
