import { soloNurseAppoinment_Model } from "./soloNurseAppoinment.model";

export const soloNurseAppointmentService = {
  createAppointment: async (data: any) => {
    const { soloNurseId, prefarenceDate, prefarenceTime } = data;

    // Normalize date (only YYYY-MM-DD)
    const formattedDate = new Date(prefarenceDate).toISOString().split("T")[0];

    // Check if same date + same time already exists
    const booked = await soloNurseAppoinment_Model.findOne({
      soloNurseId,
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
    const appointment = await soloNurseAppoinment_Model.create({
      ...data,
      prefarenceDate: new Date(prefarenceDate),
    });

    return appointment;
  },
  Reschedule: async (payload: any) => {
    const { appointmentId, soloNurseId, prefarenceDate, prefarenceTime } =
      payload;
    console.log("resedule data ", payload);

    // Normalize new date
    const formattedDate = new Date(prefarenceDate).toISOString().split("T")[0];

    // Check if another appointment has same date + time
    const booked = await soloNurseAppoinment_Model.findOne({
      soloNurseId,
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
    const updatedAppointment =
      await soloNurseAppoinment_Model.findByIdAndUpdate(
        appointmentId,
        {
          prefarenceDate: new Date(prefarenceDate),
          prefarenceTime,
        },
        { new: true }
      );

    return updatedAppointment;
  },

  getAllAppointments: async () => {
    return await soloNurseAppoinment_Model
      .find()
      .populate("patientId", "_id userId ")
      .populate({
        path: "soloNurseId",
        select: "_id userId",
        populate: {
          path: "userId",
          select: "_id fullName profileImage role",
        },
      });
  },

  getAppointmentById: async (id: string) => {
    return await soloNurseAppoinment_Model
      .findById(id)
      .populate("patientId", "_id userId ")
      .populate({
        path: "soloNurseId",
        select: "_id userId",
        populate: {
          path: "userId",
          select: "_id fullName profileImage role",
        },
      });
  },

  updateAppointment: async (id: string, data: any) => {
    return await soloNurseAppoinment_Model.findByIdAndUpdate(
      id,
      {
        status: data.status,
      },
      {
        new: true,
      }
    );
  },
  getSelectedDateAndTime: async (id: string) => {
    const singleDoctorAppointments = await soloNurseAppoinment_Model.find({
      soloNurseId: id,
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
  getSinglePaintentAppointmentForNurse: async (patientId: string) => {
    return await soloNurseAppoinment_Model
      .find({ patientId: patientId })
      .populate({
        path: "patientId",
        select: "_id",
      })
      .populate({
        path: "soloNurseId",
        select: "_id userId ",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role profileImage ", // fields you want
        },
      });
  },
  getSingleNurseAppointment: async (soloNurseId: string) => {
    return await soloNurseAppoinment_Model
      .find({ soloNurseId: soloNurseId })
      .populate({
        path: "patientId",
        select: "_id userId",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role ", // fields you want
        },
      })
      .populate({
        path: "soloNurseId",
        select: "_id userId",
      });
  },
};
