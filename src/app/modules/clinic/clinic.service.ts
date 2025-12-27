import { Clinic_Model } from "./clinic.model";
import { TClinic } from "./clinic.interface";
import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";
import { Doctor_Model } from "../doctor/doctor.model";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { Patient_Model } from "../patient/patient.model";
import app from "../../../app";
import { Wallet_Model } from "../wallet/wallet.model";
import { WithdrawRequest_Model } from "../withdrowRequest/withdrowRequest.model";

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
const getClinicAppointments = async (clinicId: string, status?: string) => {
  let filter: any = { clinicId };

  // Normal status filtering (exclude upcoming)
  if (status && status !== "upcoming") {
    filter.status = status;
  }

  // Fetch from DB
  let appointments = await doctorAppointment_Model
    .find(filter)
    .populate({
      path: "patientId",
      select: "_id userId",
      populate: {
        path: "userId",
        model: "user",
        select: "fullName role",
      },
    })
    .populate({
      path: "doctorId",
      select: "_id userId",
      populate: {
        path: "userId",
        model: "user",
        select: "fullName",
      },
    });

  // ✅ UPCOMING LOGIC (DATE + TIME)
  if (status === "upcoming") {
    const now = new Date();

    appointments = appointments.filter((item: any) => {
      const date = item.prefarenceDate; // Date object
      const time = item.prefarenceTime; // "10:30 AM"

      const appointmentDateTime = new Date(
        `${date.toISOString().split("T")[0]} ${time}`
      );

      return appointmentDateTime > now;
    });

    // ✅ Sort nearest first
    appointments.sort((a: any, b: any) => {
      const ad = new Date(
        `${a.prefarenceDate.toISOString().split("T")[0]} ${a.prefarenceTime}`
      );
      const bd = new Date(
        `${b.prefarenceDate.toISOString().split("T")[0]} ${b.prefarenceTime}`
      );

      // 🔥 DESC order (latest first)
      return bd.getTime() - ad.getTime();
    });
  }

  return appointments;
};

const getClinicDoctors = async (clinicId: string, appointmentType?: any) => {
  console.log("clinti id 0", clinicId);
  if (appointmentType) {
    const result = await Doctor_Model.find({
      clinicId,
      appointmentType: appointmentType,
    })
      .populate("userId")
      .populate("clinicId");
    return result;
  } else {
    const result = await Doctor_Model.find({ clinicId })
      .populate("userId")
      .populate("clinicId");
    return result;
  }
};

const getClinicPatients = async (clinicId: string) => {
  const appointmentRecords = await doctorAppointment_Model
    .find({
      clinicId,
      status: "confirmed",
    })
    .populate({
      path: "patientId",
      select: "_id userId age bloodGroup gender",
      populate: {
        path: "userId",
        model: "user", // ensure correct model name
        select: "fullName role email profileImage ", // fields you want
      },
    })
    .populate({
      path: "doctorId",
      select: "_id userId ",
    });

  return appointmentRecords;
};

const updateClinicBasic = async (
  userId: string,
  payload: any,
  profileImageUrl: string
) => {
  const {
    fullName,
    email,
    phoneNumber,
    servicesOffered,
    clinicDescription,
    address,
  } = payload;

  const servicesOfferedData = servicesOffered
    ?.split(",")
    .map((service: string) => service.trim());

  console.log("user id form service ", userId);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updateData: any = { fullName };

    if (profileImageUrl) {
      updateData.profileImage = profileImageUrl;
    }

    // step-1: Update user model
    const updatedUser = await User_Model.findByIdAndUpdate(userId, updateData, {
      new: true,
      session,
    });

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
        address,
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
const getAppoinmentTimeBasedOnDateForClinic = async (
  date: Date,
  id: string
) => {
  // console.log("date and id ", date, id);

  const appointments = await doctorAppointment_Model
    .find({
      clinicId: id,
      prefarenceDate: new Date(date),
    })
    .populate({
      path: "patientId",
      select: "_id userId gender age bloodGroup",
      populate: {
        path: "userId",
        model: "user", // ensure correct model name
        select: "fullName  role", // fields you want
      },
    })
    .populate({
      path: "doctorId",
      select: "_id userId  specialization",
      populate: {
        path: "userId",
        model: "user", // ensure correct model name
        select: "fullName role", // fields you want
      },
    })
    .sort({ createdAt: -1 });

  return appointments;
};

const getClinicPaymentData = async (clinicUserId: string) => {
  const clinicMoney = await Wallet_Model.findOne({
    ownerId: clinicUserId,
    ownerType: "CLINIC",
  });
  const clinicPendingMoney = clinicMoney?.pendingBalance || 0;

  const clinicWithdrawRequests = await WithdrawRequest_Model.find({
    ownerId: clinicUserId,
    ownerType: "CLINIC",
    status: "PAID",
  });

  const clinicTotalWithdrew = clinicWithdrawRequests.reduce(
    (total, request) => {
      return total + request.amount;
    },
    0
  );

  return {
    clinicPendingMoney,
    clinicTotalWithdrew,
    totalTransactions: clinicWithdrawRequests.length,
  };
};
const getClinicDashboardOverview = async (clinicId: string) => {
  const clinicPatient = getClinicPatients(clinicId);
  const clinicPatientsLength = (await clinicPatient).length;

  const clinicAppointments = getClinicAppointments(clinicId);
  const clinicAppointmentsLength = (await clinicAppointments).length;

  const clinicDoctors = getClinicDoctors(clinicId);
  const clinicDoctorsLength = (await clinicDoctors).length;

  const clinicRating = await Clinic_Model.findOne({
    _id: clinicId,
  }).select("avarageRating");

  return {
    clinicPatientsLength,
    clinicAppointmentsLength,
    clinicDoctorsLength,
    clinicRating,
  };
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
  getAppoinmentTimeBasedOnDateForClinic,
  getClinicPaymentData,
  getClinicDashboardOverview,
};
