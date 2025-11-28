import { doctorAppointment_Model } from "./doctorAppointment.model";

export const doctorAppointmentService = {
  // Create Appointment
  createAppointment: async (payload: any) => {
    const appointment = await doctorAppointment_Model.create(payload);
    return appointment;
  },

  // Get all appointments
  getAllAppointments: async () => {
    const appointments = await doctorAppointment_Model
      .find()
      .populate("patientId")
      .populate("doctorId");
    return appointments;
  },

  // Get single appointment
  getAppointmentById: async (id: string) => {
    return await doctorAppointment_Model
      .findById(id)
      .populate("patientId")
      .populate("doctorId");
  },

  // Update status (approve/reject)
  updateStatus: async (id: string, status: string) => {
    return await doctorAppointment_Model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  },

  // Delete
  deleteAppointment: async (id: string) => {
    return await doctorAppointment_Model.findByIdAndDelete(id);
  },
};
