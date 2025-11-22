import { Patient_Model } from "./patient.model";
import { TPatient } from "./patient.interface";

export const patientService = {


  getAllPatients: async () => {
    return await Patient_Model.find();
  },

  getPatientById: async (id: string) => {
    return await Patient_Model.findById(id);
  },

  updatePatient: async (id: string, payload: Partial<TPatient>) => {
    return await Patient_Model.findByIdAndUpdate(id, payload, { new: true });
  },

  deletePatient: async (id: string) => {
    return await Patient_Model.findByIdAndDelete(id);
  },
};
