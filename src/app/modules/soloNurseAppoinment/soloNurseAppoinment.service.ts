import { populate } from "dotenv";
import { sendNotification } from "../../utils/notificationHelper";
import { Patient_Model } from "../patient/patient.model";
import { SoloNurse_Model } from "../soloNurse/soloNurse.model";
import { soloNurseAppoinment_Model } from "./soloNurseAppoinment.model";
import mongoose from "mongoose";
import { ChatModel } from "../chat/chat.model";
import { getAppointmentDateTime } from "../../utils/getAppoinmentTimeAndDate";

export const soloNurseAppointmentService = {
  createAppointment: async (data: any) => {
    const { soloNurseId, prefarenceDate, prefarenceTime } = data;

    const patient = await Patient_Model.findOne({ _id: data.patientId });
    if (!patient) {
      throw new Error("Patient not found");
    }
    if (
      !patient?.nidBackImageUrl ||
      !patient?.nidFrontImageUrl ||
      !patient?.nationalIdNumber ||
      patient?.address?.length === 0
    ) {
      throw new Error(
        "Please complete your NID verification to book an appointment.",
      );
    }

    // Check if patient exists
    const soloNurse: any = await SoloNurse_Model.findById(soloNurseId);
    if (!soloNurse) {
      throw new Error("solo nurse  not found");
    }

    // Normalize date (only YYYY-MM-DD)
    const formattedDate = new Date(prefarenceDate).toISOString().split("T")[0];

    const isBlocked = soloNurse.blockedDates.some(
      (d: any) =>
        new Date(d.date).toISOString().split("T")[0] === formattedDate,
    );
    if (isBlocked) {
      throw new Error(
        `The nurse has not been available on ${formattedDate}. Please choose another date.`,
      );
    }

    // 2️⃣ Check if the nurse has disabled availability on this day
    const dayOfWeek = new Date(prefarenceDate)
      .toLocaleDateString("en-US", { weekday: "long" })
      .trim();
    const availabilityForDay = soloNurse.availability.find(
      (a: any) => a.day?.trim().toLowerCase() === dayOfWeek.toLowerCase(),
    );

    if (!availabilityForDay || !availabilityForDay.isEnabled) {
      throw new Error(
        `The nurse is not available on ${dayOfWeek}. Please choose another date.`,
      );
    }

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
          "This date and time are already booked. Please choose another slot.",
        );
      }
    }
    // Create new appointment
    const appointment = await soloNurseAppoinment_Model.create({
      ...data,
      prefarenceDate: new Date(prefarenceDate),
    });

    const solo_nurse: any = await SoloNurse_Model.findById(
      appointment.soloNurseId,
    );
    // console.log("clinic", clinic);
    if (!solo_nurse) {
      throw new Error("solo nurse  not found");
    }

    await sendNotification(
      solo_nurse.userId.toString(),
      "New Appointment Added ",
      ` You have a new appointment on ${formattedDate} at ${prefarenceTime}. Please check your calendar for more details.`,
      "notification",
    );

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
          "This date and time are already booked. Please choose another slot.",
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
        { new: true },
      );

    return updatedAppointment;
  },
  getAllAppointments: async (status?: string, nurseId?: string) => {
    let filter: any = {};

    // Filter by Solo Nurse
    if (nurseId) {
      filter.soloNurseId = nurseId;
    }

    // Normal status filtering
    if (status && status !== "upcoming") {
      filter.status = status;
    }

    // Fetch from DB
    let appointments = await soloNurseAppoinment_Model
      .find(filter)
      .populate({
        path: "patientId",
        select: "_id userId gender age bloodGroup",
        populate: { path: "userId", select: "_id fullName profileImage role" },
      })
      .populate({
        path: "soloNurseId",
        select: "_id userId",
        populate: { path: "userId", select: "_id fullName profileImage role" },
      });

    // UPCOMING FILTER - DATE + TIME CHECK
    if (status === "upcoming") {
      const now = new Date();

      appointments = appointments.filter((item: any) => {
        const date = item.prefarenceDate; // Example: "2025-01-12"
        const time = item.prefarenceTime; // Example: "10:30 AM"

        // Build full datetime
        const apptDateTime = new Date(
          `${date.toISOString().split("T")[0]} ${time}`,
        );

        return apptDateTime > now;
      });

      // Sort upcoming: nearest first
      appointments.sort((a: any, b: any) => {
        const ad = new Date(
          `${a.prefarenceDate.toISOString().split("T")[0]} ${a.prefarenceTime}`,
        );
        const bd = new Date(
          `${b.prefarenceDate.toISOString().split("T")[0]} ${b.prefarenceTime}`,
        );
        return ad.getTime() - bd.getTime();
      });
    }

    return appointments;
  },

  getAppointmentById: async (id: string) => {
    return await soloNurseAppoinment_Model
      .findById(id)
      .populate({
        path: "patientId",
        select: "_id userId gender age bloodGroup",
        populate: {
          path: "userId",
          select: "_id fullName profileImage ",
        },
      })
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
    const appointment = await soloNurseAppoinment_Model.findById(id);

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Only apply rule when cancelling
    if (data.status === "cancelled") {
      const appointmentDateTime = getAppointmentDateTime(
        appointment.prefarenceDate,
        appointment.prefarenceTime,
      );

      const oneHourBefore = new Date(
        appointmentDateTime.getTime() - 60 * 60 * 1000,
      );
      const now = new Date();

      if (now >= oneHourBefore) {
        throw new Error(
          "You cannot cancel the appointment within 1 hour of the scheduled time",
        );
      }
    }

    return await soloNurseAppoinment_Model.findByIdAndUpdate(
      id,
      { status: data.status },
      { new: true },
    );
  },
  getSelectedDateAndTime: async (id: string, date?: string) => {
    const soloNurse = await SoloNurse_Model.findById(id);
    if (!soloNurse) throw new Error("Solo nurse not found");

    // Get all appointments for this nurse
    const allAppointments = await soloNurseAppoinment_Model.find({
      soloNurseId: id,
    });

    // 1️⃣ If a specific date is provided
    if (date) {
      const selectedDateStr = new Date(date).toISOString().split("T")[0];

      const day = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      const availabilityForDay = soloNurse.availability?.find(
        (availability) => availability.day === day,
      );
      const startTimeSlot = availabilityForDay?.startTime;
      const endTimeSlot = availabilityForDay?.endTime;

      const appointmentsForDate = allAppointments
        .filter(
          (appointment) =>
            new Date(appointment.prefarenceDate).toISOString().split("T")[0] ===
            selectedDateStr,
        )
        .map((appointment) => ({
          date: selectedDateStr,
          time: appointment.prefarenceTime,
        }));

      return {
        appointmentsForDate,
        nurseAppoinmentTimeSlot: { startTimeSlot, endTimeSlot },
        blockedDates: soloNurse.blockedDates?.map(
          (d: any) => new Date(d.date).toISOString().split("T")[0],
        ),
        availability: soloNurse?.availability,
        availableDateRange: soloNurse?.availableDateRange,
        slotTimeDuration: soloNurse?.slotTimeDuration,
      }; // only appointments for that date
    }

    // 2️⃣ If no date is provided, return all appointments grouped
    const grouped: any = {};

    allAppointments.forEach((appointment) => {
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

    return {
      grouped,
      blockedDates: soloNurse.blockedDates?.map(
        (d: any) => new Date(d.date).toISOString().split("T")[0],
      ),
      availability: soloNurse?.availability,
      availableDateRange: soloNurse?.availableDateRange,
      slotTimeDuration: soloNurse?.slotTimeDuration,
    };
  },

  getAppoinmentTimeBasedOnDate: async (date: Date, id: string) => {
    console.log("date and id ", date, id);
    const appointments = await soloNurseAppoinment_Model
      .find({
        soloNurseId: id,
        prefarenceDate: new Date(date),
      })
      .populate({
        path: "patientId",
        select: "_id userId",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role profileImage ", // fields you want
        },
      })
      .populate({
        path: "soloNurseId",
        select: "_id userId",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role profileImage ", // fields you want
        },
      });

    return appointments;
  },
  getSinglePaintentAppointmentForNurse: async (patientId: string) => {
    console.log("pait4ent id ", patientId);
    return await soloNurseAppoinment_Model
      .find({ patientId: patientId })
      .populate({
        path: "patientId",
        // select: "_id",
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
        select: "_id userId gender age",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role profileImage  ", // fields you want
        },
      })
      .populate({
        path: "soloNurseId",
        select: "_id userId",
        populate: {
          path: "userId",
          model: "user", // ensure correct model name
          select: "fullName role  profileImage ", // fields you want
        },
      });
  },

  getSinlgePatientChatsForNurse: async (soloNurseUserId: string) => {
    const nurseObjectId = new mongoose.Types.ObjectId(soloNurseUserId);

    const patients = await ChatModel.aggregate([
      // 1️⃣ Only patient → nurse chats
      {
        $match: {
          chatType: "nurse_patient",
          receiverId: nurseObjectId,
        },
      },

      // 2️⃣ Unique patients
      {
        $group: {
          _id: "$senderId", // patient userId
        },
      },

      // 3️⃣ Join users
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 4️⃣ Ensure only patients
      {
        $match: {
          "user.role": "patient",
        },
      },

      // 5️⃣ Final output
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          fullName: "$user.fullName",
          profileImage: "$user.profileImage",
          role: "$user.role",
          email: "$user.email",
        },
      },
    ]);

    return patients;
  },

  getSinlgePatientChatsWithNurse: async (patientUserId: string) => {
    const patientObjectId = new mongoose.Types.ObjectId(patientUserId);

    const nurses = await ChatModel.aggregate([
      // 1️⃣ Match BOTH directions
      {
        $match: {
          chatType: "nurse_patient",
          $or: [{ senderId: patientObjectId }, { receiverId: patientObjectId }],
        },
      },

      // 2️⃣ Figure out who the nurse is
      {
        $project: {
          nurseUserId: {
            $cond: [
              { $eq: ["$senderId", patientObjectId] },
              "$receiverId", // patient sent → nurse received
              "$senderId", // nurse sent → patient received
            ],
          },
        },
      },

      // 3️⃣ Unique nurses
      {
        $group: {
          _id: "$nurseUserId",
        },
      },

      // 4️⃣ Join users
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 5️⃣ Ensure role is solo nurse
      {
        $match: {
          "user.role": "solo_nurse",
        },
      },

      // 6️⃣ Final output
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          fullName: "$user.fullName",
          profileImage: "$user.profileImage",
          role: "$user.role",
          email: "$user.email",
        },
      },
    ]);

    return nurses;
  },

  deleteAppointment: async (id: string) => {
    return await soloNurseAppoinment_Model.findByIdAndDelete(id);
  },
};
