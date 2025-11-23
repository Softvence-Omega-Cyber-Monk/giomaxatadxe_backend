import { Patient_Model } from "./patient.model";
import { TPatient } from "./patient.interface";
import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";

export const patientService = {
  getAllPatients: async () => {
    return await Patient_Model.find();
  },

  getPatientById: async (userId: string) => {
    return await Patient_Model.findOne({ userId }).populate("userId");
  },

  updatePatientBasic: async (userId: string, payload: any) => {
    const { fullName, phoneNumber, dateOfBirth, gender, bloodGroup } = payload;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // step-1: Update user model
      const updatedUser = await User_Model.findByIdAndUpdate(
        userId,
        { fullName },
        { new: true, session }
      );

      if (!updatedUser) {
        throw new Error("User not found!");
      }

      // step-2: Update clinic model
      const updatedPatient = await Patient_Model.findOneAndUpdate(
        { userId },
        {
          phoneNumber,
          dateOfBirth,
          gender,
          bloodGroup,
        },
        { new: true, session }
      ).populate("userId");

      if (!updatedPatient) {
        throw new Error("Patient profile not found!");
      }

      // commit both updates
      await session.commitTransaction();
      session.endSession();

      return updatedPatient;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.log(error);
    }
  },
  createOrUpdateAddress: async (
    userId: string,
    addressId: string ,
    payload: any
  ) => {
    try {
      // If addressId is provided → update existing address
      if (addressId) {
        const updatedPatient = await Patient_Model.findOneAndUpdate(
          {
            userId,
            "address._id": addressId,
          },
          {
            $set: {
              "address.$.addressLabel": payload.addressLabel,
              "address.$.streetNumber": payload.streetNumber,
              "address.$.apartmentNumber": payload.apartmentNumber,
              "address.$.city": payload.city,
              "address.$.state": payload.state,
              "address.$.zipCode": payload.zipCode,
            },
          },
          { new: true }
        ).populate("userId");

        if (!updatedPatient) {
          throw new Error("Address not found!");
        }

        return updatedPatient;
      }

      // If addressId is NOT provided → add (push) new address
      const updatedPatient = await Patient_Model.findOneAndUpdate(
        { userId },
        {
          $push: {
            address: payload,
          },
        },
        { new: true }
      ).populate("userId");

      if (!updatedPatient) {
        throw new Error("Patient not found!");
      }

      return updatedPatient;
    } catch (error) {
      console.log(error);
    }
  },

  deletePatient: async (id: string) => {
    return await Patient_Model.findByIdAndDelete(id);
  },
};
