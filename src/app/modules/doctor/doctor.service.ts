import { TDoctor } from "./doctor.interface";
import { Doctor_Model } from "./doctor.model";


export const DoctorService = {
  createDoctor: async (payload: TDoctor) => {
    const result = await Doctor_Model.create(payload);
    return result;
  },

  getDoctors: async () => {
    return Doctor_Model.find().populate("userId").populate("clinicId");
  },

  getDoctorById: async (id: string) => {
    return Doctor_Model.findById(id)
      .populate("userId")
      .populate("clinicId");
  },

  updateDoctor: async (id: string, payload: Partial<TDoctor>) => {
    return Doctor_Model.findByIdAndUpdate(id, payload, { new: true });
  },

  deleteDoctor: async (id: string) => {
    return Doctor_Model.findByIdAndDelete(id);
  },
};
