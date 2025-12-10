import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";
import { SoloNurse_Model } from "./soloNurse.model";

export const SoloNurseService = {
  getAllSoloNurses: async () => {
    return SoloNurse_Model.find().populate("userId");
  },

  getSoloNurseById: async (userId: string) => {
    return SoloNurse_Model.findOne({ userId }).populate("userId");
  },

  updateSoloNurseBasic: async (
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
      const updatedClinic = await SoloNurse_Model.findOneAndUpdate(
        { userId },
        {
          phoneNumber,
          dateOfBirth,
          gender,
        },
        { new: true, session }
      ).populate("userId");

      if (!updatedClinic) {
        throw new Error("nurse profile not found!");
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
      serviceName,
      subServices,
      speciality,
      experience,
      MedicalLicense,
      qualifications,
      about,
      consultationFee,
    } = payload;

    // console.log('payload ', payload);

    // Build the updated professional information object
    const professionalInformation = {
      service: {
        serviceName,
        subServices, // [{ name, price }]
      },
      speciality,
      experience,
      MedicalLicense,
      qualifications,
      about,
      consultationFee,
    };

    try {
      const updatedProfessional = await SoloNurse_Model.findOneAndUpdate(
        { userId },
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
  addSingleSubService: async (
    userId: string,

    payload: any
  ) => {
    // Find the solo nurse by userId
    const soloNurse = await SoloNurse_Model.findOne({ userId });

    if (!soloNurse) {
      throw new Error("Solo nurse not found for this user");
    }

    // Create the new sub-service object
    const newSubService = {
      name: payload.name,
      price: payload.price,
    };

    // Push the new sub-service into the subServices array
    const updatedSoloNurse = await SoloNurse_Model.findOneAndUpdate(
      { userId },
      {
        $push: { "professionalInformation.service.subServices": newSubService },
      },
      { new: true }
    );

    return updatedSoloNurse;
  },
  deleteSingleSubService: async (
    userId: string,
    subServiceId: string,
    
  ) => {
    // Find the solo nurse by userId
    const soloNurse = await SoloNurse_Model.findOne({ userId });

    if (!soloNurse) {
      throw new Error("Solo nurse not found for this user");
    }

    // Perform delete using $pull
    const updatedSoloNurse = await SoloNurse_Model.findOneAndUpdate(
      { userId },
      {
        $pull: {
          "professionalInformation.service.subServices": { _id: subServiceId },
        },
      },
      { new: true }
    );

    return updatedSoloNurse;
  },
  uploadCertificate: async (userId: string, payload: any) => {
    // console.log("payload from service ", payload);

    const clinic = await SoloNurse_Model.findOne({ userId });

    if (!clinic) {
      throw new Error("Clinic not found for this user");
    }

    const newCertificate = {
      uploadCertificates: payload.certificateUrl, // correct field name
      certificateType: payload.data?.certificateType,
      certificateName: payload.data?.certificateName,
    };

    // console.log("service ", newCertificate);

    const updatedCertificates = await SoloNurse_Model.findOneAndUpdate(
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
    const nurse = await SoloNurse_Model.findOne({ userId });

    if (!nurse) {
      throw new Error("Solo nurse not found for this user");
    }

    console.log(userId, certificateId);
    // Perform delete using $pull
    const updated = await SoloNurse_Model.findOneAndUpdate(
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

  availabilitySettings: async (userId: string, payload: any) => {
    console.log("payload from service ", payload);

    const availability = {
      startTime: payload?.startTime,
      endTime: payload?.endTime,
      workingDays: payload?.workingDays,
    };

    const clinic = await SoloNurse_Model.findOne({ userId });

    if (!clinic) {
      throw new Error("Clinic not found for this user");
    }

    const updatedCertificates = await SoloNurse_Model.findOneAndUpdate(
      { userId },
      {
        $set: { availability },
      },
      { new: true }
    );
    return updatedCertificates;
  },

  addNewPaymentMethod: async (userId: string, payload: any) => {
    console.log("payload from service ", payload);

    const clinic = await SoloNurse_Model.findOne({ userId });

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
    const updatedClinic = await SoloNurse_Model.findOneAndUpdate(
      { userId },
      {
        $push: { "paymentAndEarnings.withdrawalMethods": newMethod },
      },
      { new: true }
    );

    return updatedClinic;
  },

  deleteSoloNurse: async (id: string) => {
    return SoloNurse_Model.findByIdAndDelete(id);
  },
};
