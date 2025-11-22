
import { SoloNurse_Model } from "./soloNurse.model";


export const SoloNurseService = {


  getAllSoloNurses: async () => {
    return SoloNurse_Model.find().populate("userId");
  },

  getSoloNurseById: async (id: string) => {
    return SoloNurse_Model.findById(id).populate("userId");
  },

  deleteSoloNurse: async (id: string) => {
    return SoloNurse_Model.findByIdAndDelete(id);
  },
};
