import mongoose from "mongoose";
import { TDoctor } from "./doctor.interface";
import { Doctor_Model } from "./doctor.model";
import { User_Model } from "../user/user.schema";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { doctorAppointmentService } from "../doctorAppointment/doctorAppointment.service";

export const DoctorService = {
  updateDoctor: async (doctorId: string, payload: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        fullName,
        email,
        workingHour,
        professionalInformation,
        phoneNumber,
        ...rest
      } = payload;
      // console.log('payload ,', payload);

      // 1. Find doctor
      const doctor = await Doctor_Model.findById(doctorId, null, { session });
      if (!doctor) throw new Error("Doctor not found");

      // 2. Update user info if needed
      if (fullName || email) {
        const userUpdate: any = {};
        if (fullName) userUpdate.fullName = fullName;
        if (email) {
          // Check email uniqueness
          const existingEmail = await User_Model.findOne(
            { email, _id: { $ne: doctor.userId } },
            null,
            { session }
          );
          if (existingEmail) throw new Error("Email already exists");
          userUpdate.email = email;
        }
        await User_Model.findByIdAndUpdate(doctor.userId, userUpdate, {
          session,
        });
      }

      // 3. Update doctor info
      const doctorUpdate: any = { ...rest };
      if (workingHour) doctorUpdate.workingHour = workingHour;
      if (professionalInformation)
        doctorUpdate.professionalInformation = professionalInformation;
      if (phoneNumber) doctorUpdate.phoneNumber = phoneNumber;

      const updatedDoctor = await Doctor_Model.findByIdAndUpdate(
        doctorId,
        doctorUpdate,
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();

      return updatedDoctor;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
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

  deleteDoctor: async (
    doctorId: string,
    clinicId: string,
    doctorUserId: string
  ) => {
    const res = await User_Model.findOneAndDelete({ _id: doctorUserId });
    await Doctor_Model.findOneAndDelete({ _id: doctorId, clinicId });
  },
  getDoctorDashboardOverview: async (doctorId: string) => {
    const patients = await DoctorService.getSingleDoctorPatientList(doctorId);
    const totalPatients = patients?.length || 0;

    const appointments =
      await doctorAppointmentService.getSingleDoctorAppointment(doctorId);
    const totalAppointments = appointments?.length || 0;

    const totalPendingAppointments = appointments.filter(
      (item: any) => item.status === "pending"
    ).length;

    const totalCompletedAppointments = appointments.filter(
      (item: any) => item.status === "completed"
    ).length;

    return {
      totalPatients,
      totalAppointments,
      totalPendingAppointments,
      totalCompletedAppointments,
    };
  },
  addReviews: async (userId: string, payload: any) => {
    const doctor: any = await Doctor_Model.findOne({ userId });
    if (!doctor) {
      throw new Error("Doctor not found for this user");
    }

    doctor.reviews.push(payload);
    const totalRatings = doctor.reviews.reduce(
      (sum: any, review: { rating: any }) => sum + (review.rating || 0),
      0
    );
    doctor.avarageRating = totalRatings / doctor.reviews.length;

    await doctor.save();
    return doctor;
  },
};
