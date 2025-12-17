import mongoose from "mongoose";
import { TDoctor } from "./doctor.interface";
import { Doctor_Model } from "./doctor.model";
import { User_Model } from "../user/user.schema";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { Patient_Model } from "../patient/patient.model";

export const DoctorService = {
  getDoctors: async () => {
    return Doctor_Model.find().populate("userId").populate("clinicId");
  },

  getDoctorById: async (userId: string) => {
    return Doctor_Model.findOne({ userId }).populate("userId").populate({
      path: "clinicId",
      select: "_id ", // only fetch _id and name
    });
  },

  getSingleDoctorPatientList: async (doctorId: string) => {
    const appointments = await doctorAppointment_Model
      .find({
        doctorId,
        status: "confirmed",
      })
      .populate({
        path: "patientId",
        select: "_id userId gender age bloodGroup",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role", // fields you want
        },
      })
      .populate({
        path: "doctorId",
        select: "_id userId",
      })
      .sort({ createdAt: -1 });

    return appointments;
  },

  updateDoctorBasic: async (
    userId: string,
    payload: any,
    profileImageUrl: string
  ) => {
    const { fullName, phoneNumber, dateOfBirth, gender } = payload;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updateData: any = { fullName };

      if (profileImageUrl) {
        updateData.profileImage = profileImageUrl;
      }

      // step-1: Update user model
      const updatedUser = await User_Model.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, session }
      );

      if (!updatedUser) {
        throw new Error("User not found!");
      }

      // step-2: Update clinic model
      const updatedClinic = await Doctor_Model.findOneAndUpdate(
        { userId },
        {
          phoneNumber,
          dateOfBirth,
          gender,
        },
        { new: true, session }
      ).populate("userId");

      if (!updatedClinic) {
        throw new Error("doctor profile not found!");
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
  },

  professionalUpdate: async (userId: string, payload: any) => {
    const {
      speciality,
      experienceYears,
      medicalLicenseNumber,
      qualifications,
      about,
    } = payload;

    const professionalInformation = {
      speciality,
      experienceYears,
      medicalLicenseNumber,
      qualifications,
      about,
    };

    try {
      const updatedProfessional = await Doctor_Model.findOneAndUpdate(
        { userId }, // correct filter
        { professionalInformation },
        { new: true }
      );

      if (!updatedProfessional) {
        throw new Error("Solo nurse profile not found");
      }

      return updatedProfessional;
    } catch (error) {
      console.error("Error updating professional info:", error);
      throw error;
    }
  },

  uploadCertificate: async (userId: string, payload: any) => {
    // console.log("payload from service ", payload);

    const clinic = await Doctor_Model.findOne({ userId });

    if (!clinic) {
      throw new Error("Clinic not found for this user");
    }

    const newCertificate = {
      uploadCertificates: payload.certificateUrl, // correct field name
      certificateType: payload.data?.certificateType,
      certificateName: payload.data?.certificateName,
    };

    // console.log("service ", newCertificate);

    const updatedCertificates = await Doctor_Model.findOneAndUpdate(
      { userId },
      {
        $push: { certificates: newCertificate },
      },
      { new: true }
    );

    return updatedCertificates;
  },
  deleteCertificate: async (userId: string, certificateId: string) => {
    // Find the user first
    const nurse = await Doctor_Model.findOne({ userId });

    if (!nurse) {
      throw new Error("Solo nurse not found for this user");
    }

    console.log(userId, certificateId);
    // Perform delete using $pull
    const updated = await Doctor_Model.findOneAndUpdate(
      { userId },
      {
        $pull: {
          certificates: { _id: certificateId },
        },
      },
      { new: true }
    );

    return updated;
  },

  deleteDoctor: async (id: string) => {
    return Doctor_Model.findByIdAndDelete(id);
  },
};
