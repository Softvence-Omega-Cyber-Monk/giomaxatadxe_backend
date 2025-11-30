import { Clinic_Model } from "./clinic.model";
import { TClinic } from "./clinic.interface";
import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";
import { Doctor_Model } from "../doctor/doctor.model";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { Patient_Model } from "../patient/patient.model";

const getAllClinics = async () => {
  const result = await Clinic_Model.find()
    .populate("userId") // clinic owner
    .populate({
      path: "reviews.patientId",
      select: "userId", // select patient.userId
      populate: {
        path: "userId",
        model: "user", // ensure correct model name
        select: "fullName profileImage", // fields you want
      },
    });

  return result;
};

const getClinicById = async (userId: string) => {
  const result = await Clinic_Model.findOne({ userId })
    .populate("userId")
    .populate({
      path: "reviews.patientId",
      select: "userId", // select patient.userId
      populate: {
        path: "userId",
        model: "user", // ensure correct model name
        select: "fullName profileImage", // fields you want
      },
    });
  return result;
};
const getClinicAppointments = async (clinicId: string) => {
  
  const result = await doctorAppointment_Model
    .find({ clinicId })
    .populate({
      path: "patientId",
      select: "_id userId", 
      populate: {
        path: "userId",
        model: "user", // ensure correct model name
        select: "fullName role", // fields you want
      },
    })
    .populate({
      path: "doctorId",
      select: "_id userId",
      populate: {
        path: "userId",
        model: "user", // ensure correct model name
        select: "fullName  role", // fields you want
      },
    });

  return result;
};

const getClinicDoctors = async (clinicId: string) => {
  // console.log("clinti id 0", clinicId);
  const result = await Doctor_Model.find({ clinicId }).populate("userId");
  return result;
};

const getClinicPatients = async (clinicId: string) => {
  const result = await doctorAppointment_Model.aggregate([
    {
      $match: { clinicId: new mongoose.Types.ObjectId(clinicId) },
    },

    // Group by patientId (latest appointment)
    {
      $group: {
        _id: "$patientId",
        visitingType: { $last: "$visitingType" },
        createdAt: { $last: "$createdAt" },
        prefarenceDate: { $last: "$prefarenceDate" },
        prefarenceTime: { $last: "$prefarenceTime" },
        serviceType: { $last: "$serviceType" },
        reasonForVisit: { $last: "$reasonForVisit" }, // ✅ FIXED
      },
    },

    // Populate patient details
    {
      $lookup: {
        from: "patients",
        localField: "_id",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: "$patient" },

    {
      $project: {
        _id: 0,
        visitingType: 1,
        createdAt: 1,
        prefarenceDate: 1,
        prefarenceTime: 1,
        serviceType: 1,
        reasonForVisit: 1,

        patient: {
          _id: "$patient._id",
          userId: "$patient.userId",
          gender: "$patient.gender",
          phoneNumber: "$patient.phoneNumber",
        },
      },
    },
  ]);

  return { patients: result };
};

const updateClinicBasic = async (
  userId: string,
  payload: any,
  profileImageUrl: string
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
const addReviews = async (userId: string, payload: any) => {
  const clinic: any = await Clinic_Model.findOne({ userId });
  if (!clinic) {
    throw new Error("Clinic not found for this user");
  }

  clinic.reviews.push(payload);
  const totalRatings = clinic.reviews.reduce(
    (sum: any, review: { rating: any }) => sum + (review.rating || 0),
    0
  );
  clinic.avarageRating = totalRatings / clinic.reviews.length;

  await clinic.save();
  return clinic;
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
  getClinicAppointments,
  getClinicDoctors,
  getClinicPatients,
  updateClinicBasic,
  uploadCertificate,
  deleteCertificate,
  availabilitySettings,
  addReviews,
  addNewPaymentMethod,
  deleteClinic,
};
