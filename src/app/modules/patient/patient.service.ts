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
    addressId: string,
    payload: any
  ) => {
    try {
      // If addressId is provided → update existing address

      if (addressId) {
        console.log("address id ", addressId);
        console.log("payload ", payload);
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

  addMedicalHistoryService: async (
    userId: string,
    medicalConditions?: any[],
    medicalMedications?: any[],
    allergies?: any[]
  ) => {
    const pushFields: any = {};

    if (medicalConditions && medicalConditions.length > 0) {
      pushFields["medicalHistory.conditions"] = { $each: medicalConditions };
    }

    if (medicalMedications && medicalMedications.length > 0) {
      pushFields["medicalHistory.Medications"] = { $each: medicalMedications };
    }

    if (allergies && allergies.length > 0) {
      pushFields["medicalHistory.Allergies"] = { $each: allergies };
    }

    // If nothing to add
    if (Object.keys(pushFields).length === 0) {
      throw new Error("No valid items provided to add");
    }

    const updatedPatient = await Patient_Model.findOneAndUpdate(
      { userId },
      { $push: pushFields },
      { new: true, upsert: true }
    );

    return updatedPatient;
  },
  updateMedicalHistoryService: async (
    userId: string,
    medicalConditions?: any,
    medicalMedications?: any,
    allergies?: any
  ) => {
    const updateFields: any = {};
    const arrayFilters: any[] = [];

    if (medicalConditions && medicalConditions._id) {
      updateFields["medicalHistory.conditions.$[cond]"] = medicalConditions;
      arrayFilters.push({ "cond._id": medicalConditions._id });
    }

    if (medicalMedications && medicalMedications._id) {
      updateFields["medicalHistory.Medications.$[med]"] = medicalMedications;
      arrayFilters.push({ "med._id": medicalMedications._id });
    }

    if (allergies && allergies._id) {
      updateFields["medicalHistory.Allergies.$[alg]"] = allergies;
      arrayFilters.push({ "alg._id": allergies._id });
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error("No valid fields provided for updating");
    }

    const updatedPatient = await Patient_Model.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      {
        new: true,
        arrayFilters,
      }
    );

    return updatedPatient;
  },
  deleteMedicalHistoryService: async (
    userId: string,
    medicalConditions?: any,
    medicalMedications?: any,
    allergies?: any
  ) => {
    const pullFields: any = {};

    if (medicalConditions && medicalConditions._id) {
      pullFields["medicalHistory.conditions"] = { _id: medicalConditions._id };
    }

    if (medicalMedications && medicalMedications._id) {
      pullFields["medicalHistory.Medications"] = {
        _id: medicalMedications._id,
      };
    }

    if (allergies && allergies._id) {
      pullFields["medicalHistory.Allergies"] = { _id: allergies._id };
    }

    if (Object.keys(pullFields).length === 0) {
      throw new Error("No valid item provided for deletion");
    }

    const updatedPatient = await Patient_Model.findOneAndUpdate(
      { userId },
      { $pull: pullFields },
      { new: true }
    );

    return updatedPatient;
  },

  addNewPaymentMethod: async (userId: string, payload: any) => {
    console.log("payload from service ", payload);

    const clinic = await Patient_Model.findOne({ userId });

    if (!clinic) {
      throw new Error("patient not found for this user");
    }

    const newMethod = {
      cardHolderName: payload.cardHolderName,
      cardNumber: payload.cardNumber,
      cvv: payload.cvv,
      expiryDate: payload.expiryDate,
    };

    // push into nested array
    const updatedClinic = await Patient_Model.findOneAndUpdate(
      { userId },
      {
        $push: { paymentMethods: newMethod },
      },
      { new: true }
    );

    return updatedClinic;
  },


  deletePatient: async (id: string) => {
    return await Patient_Model.findByIdAndDelete(id);
  },
};




