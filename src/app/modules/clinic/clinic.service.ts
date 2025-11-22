import { Clinic_Model } from "./clinic.model";
import { TClinic } from "./clinic.interface";



const getAllClinics = async () => {
  const result = await Clinic_Model.find();
  return result;
};

const getClinicById = async (id: string) => {
  const result = await Clinic_Model.findById(id);
  return result;
};

const updateClinic = async (id: string, payload: Partial<TClinic>) => {
  const result = await Clinic_Model.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteClinic = async (id: string) => {
  const result = await Clinic_Model.findByIdAndDelete(id);
  return result;
};

export const ClinicService = {
  
  getAllClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
};
