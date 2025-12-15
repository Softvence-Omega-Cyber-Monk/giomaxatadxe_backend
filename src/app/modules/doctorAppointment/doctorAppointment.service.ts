import { Doctor_Model } from "../doctor/doctor.model";
import { Patient_Model } from "../patient/patient.model";
import { doctorAppointment_Model } from "./doctorAppointment.model";

export const doctorAppointmentService = {
  // Create Appointment
  createAppointment: async (payload: any) => {
    const { doctorId, prefarenceDate, prefarenceTime } = payload;

    // Normalize date (only YYYY-MM-DD)
    const formattedDate = new Date(prefarenceDate).toISOString().split("T")[0];

    // Check if same date + same time already exists
    const booked = await doctorAppointment_Model.findOne({
      doctorId,
      prefarenceTime,
      prefarenceDate,
    });

    if (booked) {
      const bookedDate = booked.prefarenceDate.toISOString().split("T")[0];

      if (bookedDate === formattedDate) {
        throw new Error(
          "This date and time are already booked. Please choose another slot."
        );
      }
    }

    // Create new appointment
    const appointment = await doctorAppointment_Model.create({
      ...payload,
      prefarenceDate: new Date(prefarenceDate),
    });

    return appointment;
  },
  Reschedule: async (payload: any) => {
    const { appointmentId, doctorId, prefarenceDate, prefarenceTime } = payload;
    console.log(payload);

    // Normalize new date
    const formattedDate = new Date(prefarenceDate).toISOString().split("T")[0];

    // Check if another appointment has same date + time
    const booked = await doctorAppointment_Model.findOne({
      doctorId,
      prefarenceTime,
    });

    if (booked) {
      const bookedDate = booked.prefarenceDate.toISOString().split("T")[0];

      // If it's not the SAME appointment, then it's a conflict
      if (
        bookedDate === formattedDate &&
        booked._id.toString() === appointmentId
      ) {
        throw new Error(
          "This date and time are already booked. Please choose another slot."
        );
      }
    }

    // Update the appointment (RESCHEDULE)
    const updatedAppointment = await doctorAppointment_Model.findByIdAndUpdate(
      appointmentId,
      {
        prefarenceDate: new Date(prefarenceDate),
        prefarenceTime,
      },
      { new: true }
    );

    return updatedAppointment;
  },

  // Get all appointments
  getAllAppointments: async (status?: string, doctorId?: string) => {
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status; // status: "pending", "approved", "completed", etc.
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    const appointments = await doctorAppointment_Model
      .find(filter)
      .populate({
        path: "patientId",
        select: "_id userId gender age",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName profileImage role", // fields you want
        },
      })
      .populate({
        path: "doctorId",
        select: "_id userId name image specialization",
      })
      .sort({ createdAt: -1 });

    return appointments;
  },
  // Get single appointment
  getAppointmentById: async (id: string) => {
    return await doctorAppointment_Model
      .findById(id)
      .populate({
        path: "patientId",
        select: "_id",
      })
      .populate({
        path: "doctorId",
        select: "_id",
      });
  },
  getSinglePaintentAppointment: async (patientId: string) => {
    return await doctorAppointment_Model
      .find({ patientId: patientId })
      .populate({
        path: "patientId",
        select: "_id",
      })
      .populate({
        path: "doctorId",
        select: "_id userId professionalInformation.speciality",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role profileImage ", // fields you want
        },
      });
  },

  getSingleDoctorAppointment: async (doctorId: string) => {
    return await doctorAppointment_Model
      .find({ doctorId: doctorId })
      .populate({
        path: "patientId",
        select: "_id userId age gender bloodGroup",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role ", // fields you want
        },
      })
      .populate({
        path: "doctorId",
        select: "_id userId",
      });
  },

  getSinglePaitentChats: async (patientId: string) => {
    // Step 1: Get unique doctor IDs for this patient
    const doctorIds = await doctorAppointment_Model.distinct("doctorId", {
      patientId: patientId,
      status: "approved",
    });

    // Step 2: Fetch doctor details using the IDs
    return await Doctor_Model.find({ _id: { $in: doctorIds } })
      .select(" userId professionalInformation.speciality")
      .populate({
        path: "userId",
        model: "user",
        select: "fullName role profileImage",
      });
  },
  getSingleDoctorChats: async (doctorId: string) => {
    // Step 1: Get unique patient IDs for this doctor
    const patientIds = await doctorAppointment_Model.distinct("patientId", {
      doctorId: doctorId,
      status: "approved",
    });

    // Step 2: Fetch patient details using the IDs
    return await Patient_Model.find({ _id: { $in: patientIds } })
      .select("userId")
      .populate({
        path: "userId",
        model: "user",
        select: "fullName role profileImage",
      });
  },

  // Update status (approve/reject)
  updateStatus: async (id: string, status: string) => {
    return await doctorAppointment_Model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  },
  getSelectedDateAndTime: async (id: string) => {
    const singleDoctorAppointments = await doctorAppointment_Model.find({
      doctorId: id,
    });

    const grouped: any = {};

    singleDoctorAppointments.forEach((appointment) => {
      const dateObj = appointment.prefarenceDate;
      const formattedDate = dateObj.toISOString().split("T")[0];

      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];

      grouped[year][month].push({
        date: formattedDate,
        time: appointment.prefarenceTime,
      });
    });

    return grouped;
  },

  getAppoinmentTimeBasedOnDate: async (date: Date, id: string) => {
    // console.log("date and id ", date, id);


    const appointments = await doctorAppointment_Model
      .find({
        doctorId: id,
        prefarenceDate: new Date(date),
      })
      .populate({
        path: "patientId",
        select: "_id userId gender age",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName profileImage role", // fields you want
        },
      })
      .populate({
        path: "doctorId",
        select: "_id userId name image specialization",
      })
      .sort({ createdAt: -1 });

    return appointments;
  },

  // Delete
  deleteAppointment: async (id: string) => {
    return await doctorAppointment_Model.findByIdAndDelete(id);
  },
};
