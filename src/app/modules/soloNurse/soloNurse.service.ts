import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";
import { SoloNurse_Model } from "./soloNurse.model";

export const SoloNurseService = {
  getAllSoloNurses: async (serviceName?: string) => {
    const query: any = {};

    if (serviceName) {
      query["professionalInformation.services.serviceName"] = serviceName;
    }

    return SoloNurse_Model.find(query)
      .populate("userId")
      .sort({ createdAt: -1 }); // optional: latest first
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
    const updateData: any = {};

    // 🔹 Get existing nurse
    const soloNurse = await SoloNurse_Model.findOne({ userId });

    if (!soloNurse) {
      throw new Error("Solo nurse profile not found");
    }

    //   SERVICES (MERGE, NOT REPLACE)

    if (payload.services && Array.isArray(payload.services)) {
      const existingServices =
        soloNurse.professionalInformation?.services || [];

      // Merge services (avoid duplicates by serviceName OR serviceId)
      const mergedServices = [...existingServices];

      payload.services.forEach((newService: any) => {
        const exists = existingServices.some(
          (service: any) =>
            service.serviceName === newService.serviceName ||
            service.serviceId === newService.serviceId
        );
        if (!exists) {
          mergedServices.push(newService);
        }
      });

      updateData["professionalInformation.services"] = mergedServices;
    }

    // OTHER FIELDS (PATCH STYLE)
    if (payload.speciality) {
      updateData["professionalInformation.speciality"] = payload.speciality;
    }

    if (payload.experience) {
      updateData["professionalInformation.experience"] = payload.experience;
    }

    if (payload.MedicalLicense) {
      updateData["professionalInformation.MedicalLicense"] =
        payload.MedicalLicense;
    }

    if (payload.qualifications) {
      updateData["professionalInformation.qualifications"] =
        payload.qualifications;
    }

    if (payload.about) {
      updateData["professionalInformation.about"] = payload.about;
    }

    if (payload.consultationFee) {
      updateData["professionalInformation.consultationFee"] =
        payload.consultationFee;
    }

    const updatedProfessional = await SoloNurse_Model.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    return updatedProfessional;
  },

  addSingleSubService: async (
    userId: string,
    serviceId: string,
    payload: any
  ) => {
    const { name, price } = payload;

    if (!name || price === undefined) {
      throw new Error("Sub service name and price are required");
    }

    // 🔹 Find nurse + service
    const soloNurse = await SoloNurse_Model.findOne({
      userId,
      "professionalInformation.services.serviceId": serviceId,
    });

    if (!soloNurse) {
      throw new Error("Service not found for this nurse");
    }

    // 🔹 Check duplicate sub-service name
    const service = soloNurse.professionalInformation?.services.find(
      (s: any) => s._id.toString() === serviceId
    );

    const alreadyExists = service?.subServices.some(
      (sub: any) => sub.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      throw new Error("Sub service already exists for this service");
    }

    // console.log('paylodd', payload , serviceId);
    // 🔹 Push sub-service
    const updatedSoloNurse = await SoloNurse_Model.findOneAndUpdate(
      {
        userId,
        "professionalInformation.services.serviceId": serviceId,
      },
      {
        $push: {
          "professionalInformation.services.$.subServices": {
            name,
            price,
          },
        },
      },
      { new: true }
    );

    // console.log('add sub service ', updatedSoloNurse);
    return updatedSoloNurse;
  },

  deleteSingleSubService: async (
    userId: string,
    serviceId: string,
    subServiceId: string
  ) => {
    const soloNurse = await SoloNurse_Model.findOne({ userId });

    if (!soloNurse) {
      throw new Error("Solo nurse not found for this user");
    }

    // console.log('payload', userId, serviceId, sub);
    const updatedSoloNurse = await SoloNurse_Model.findOneAndUpdate(
      {
        userId,
        "professionalInformation.services.serviceId": serviceId,
      },
      {
        $pull: {
          "professionalInformation.services.$.subServices": {
            _id: subServiceId,
          },
        },
      },
      { new: true }
    );

    // console.log('deleted ', updatedSoloNurse);

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
  addReviews: async (userId: string, payload: any) => {
    const soloNurse: any = await SoloNurse_Model.findOne({ userId });
    if (!soloNurse) {
      throw new Error("Solo nurse not found for this user");
    }

    soloNurse.reviews.push(payload);
    const totalRatings = soloNurse.reviews.reduce(
      (sum: any, review: { rating: any }) => sum + (review.rating || 0),
      0
    );
    soloNurse.avarageRating = totalRatings / soloNurse.reviews.length;

    await soloNurse.save();
    return soloNurse;
  },

  deleteSoloNurse: async (soloNurseId: string, soloNurseUserId: string) => {
    const res = await User_Model.findOneAndDelete({ _id: soloNurseUserId });
    await SoloNurse_Model.findOneAndDelete({
      _id: soloNurseId,
    });
  },
};
