import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";
import { SoloNurse_Model } from "./soloNurse.model";
import { Wallet_Model } from "../wallet/wallet.model";
import { WithdrawRequest_Model } from "../withdrowRequest/withdrowRequest.model";
import { soloNurseAppoinment_Model } from "../soloNurseAppoinment/soloNurseAppoinment.model";

export const SoloNurseService = {
  getAllSoloNurses: async (serviceName?: string, sub_serviceName?: string) => {
    const query: any = {};

    if (serviceName) {
      query["professionalInformation.services.serviceName"] = serviceName;
    }

    if (serviceName && sub_serviceName) {
      query["professionalInformation.services.subServices.name"] = {
        $regex: sub_serviceName.trim(),
        $options: "i",
      };
    }

    return SoloNurse_Model.find(query)
      .populate("userId")
      .sort({ createdAt: -1 });
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

    // if (payload.services && Array.isArray(payload.services)) {
    //   const existingServices =
    //     soloNurse.professionalInformation?.services || [];

    //   // Merge services (avoid duplicates by serviceName OR serviceId)
    //   const mergedServices = [...existingServices];

    //   payload.services.forEach((newService: any) => {
    //     const exists = existingServices.some(
    //       (service: any) =>
    //         service.serviceName === newService.serviceName ||
    //         service.serviceId === newService.serviceId
    //     );
    //     if (!exists) {
    //       mergedServices.push(newService);
    //     }
    //   });

    //   updateData["professionalInformation.services"] = mergedServices;
    // }

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
  addSubServiceWithAutoMainService: async (
    userId: string,
    serviceId: string,
    serviceName:
      | "Blood test & Sample collection"
      | "Nurse care and infusion therapy"
      | "Nurse Care & Elderly Support"
      | "Medical massage & Physio therapy",
    payload: { name: string; price: number }
  ) => {
    const { name, price } = payload;

    console.log("data", userId, serviceId, serviceName);

    console.log("payload ", payload);

    if (!name || price === undefined) {
      throw new Error("Sub-service name and price are required");
    }

    // 1️⃣ Find nurse
    const soloNurse = await SoloNurse_Model.findOne({ userId });

    if (!soloNurse) {
      throw new Error("Nurse not found");
    }

    // 2️⃣ Check if main service exists
    let service = soloNurse.professionalInformation?.services.find(
      (s: any) => s.serviceId === serviceId
    );

    // 3️⃣ If main service does NOT exist → create it
    if (!service) {
      soloNurse.professionalInformation?.services.push({
        serviceId,
        serviceName,
        subServices: [],
      });

      await soloNurse.save();

      // re-fetch the service
      service = soloNurse.professionalInformation?.services.find(
        (s: any) => s.serviceId === serviceId
      );
    }

    // 4️⃣ Check duplicate sub-service
    const alreadyExists = service?.subServices.some(
      (sub: any) => sub.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      throw new Error("Sub-service already exists");
    }

    // 5️⃣ Add sub-service
    service?.subServices.push({
      name,
      price,
    });

    await soloNurse.save();

    return soloNurse;
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

  getSoloNursePaymentData: async (soloNurseUserId: string) => {
    const soloNurseMoney = await Wallet_Model.findOne({
      ownerId: soloNurseUserId,
      ownerType: "SOLO_NURSE",
    });
    const soloNursePendingMoney = soloNurseMoney?.pendingBalance || 0;

    const soloNurseWithdrawRequests = await WithdrawRequest_Model.find({
      ownerId: soloNurseUserId,
      ownerType: "SOLO_NURSE",
      status: "PAID",
    });

    const soloNurseTotalWithdrew = soloNurseWithdrawRequests.reduce(
      (total, request) => {
        return total + request.amount;
      },
      0
    );

    return {
      soloNursePendingMoney,
      soloNurseTotalWithdrew,
      totalTransactions: soloNurseWithdrawRequests.length,
    };
  },
  getSubServicesByMainService: async (serviceName: string) => {
    // 🔹 Find nurses having this service
    const nurses = await SoloNurse_Model.find(
      {
        "professionalInformation.services.serviceName": serviceName,
      },
      {
        "professionalInformation.services": 1,
        userId: 1,
      }
    );

    // 🔹 Extract only sub-services of that main service
    const subServices = nurses.flatMap((nurse) =>
      nurse?.professionalInformation?.services
        .filter((service: any) => service.serviceName === serviceName)
        .flatMap((service: any) => service.subServices)
    );

    return subServices;
  },

  getSoloNurseDashboardOverview: async (soloNurseId: string) => {
    console.log("soloNurseId", soloNurseId);
    const allAppoinment = await soloNurseAppoinment_Model.find({});
    const pendingAppointments = await soloNurseAppoinment_Model.find({
      _id: soloNurseId,
      status: { $in: ["pending", "confirmed"] },
    });
    const completedAppointments = await soloNurseAppoinment_Model.find({
      _id: soloNurseId,
      status: "completed",
    });

    const totalEarnings = await Wallet_Model.findOne({
      ownerId: soloNurseId,
      ownerType: "SOLO_NURSE",
    });
    // console.log("total earning", totalEarnings);

    return {
      allAppoinment: allAppoinment.length,
      pendingAppointments: pendingAppointments.length,
      completedAppointments: completedAppointments.length,
      totalEarnings: totalEarnings?.pendingBalance || 0,
    };
  },
};
