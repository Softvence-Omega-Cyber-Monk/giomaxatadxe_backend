import { Clinic_Model } from "../clinic/clinic.model";
import { Doctor_Model } from "../doctor/doctor.model";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { Patient_Model } from "../patient/patient.model";
import { Payment_Model } from "../payment/payment.model";
import { SoloNurse_Model } from "../soloNurse/soloNurse.model";
import { soloNurseAppoinment_Model } from "../soloNurseAppoinment/soloNurseAppoinment.model";
import { User_Model } from "../user/user.schema";

const getDashboardOverview = async () => {
  const [
    totalPatients,
    totalDoctors,
    totalClinics,
    totalSoloNurse,
    doctorAppointments,
    soloNurseAppointments,
    paidPayments,
  ] = await Promise.all([
    Patient_Model.countDocuments(),
    Doctor_Model.countDocuments(),
    Clinic_Model.countDocuments(),
    SoloNurse_Model.countDocuments(),
    doctorAppointment_Model.countDocuments(),
    soloNurseAppoinment_Model.countDocuments(),
    Payment_Model.find({
      status: "PAID",
    }),
  ]);

  let totalEarnings = 0;
  let adminEarnings = 0;

  for (const payment of paidPayments) {
    console.log("payment ", payment);
    const amount = payment.amount || 0;
    totalEarnings += amount;

    // ✅ Admin commission logic
    if (payment.appointmentType === "CLINIC") {
      adminEarnings += amount * 0.12; // 12%
    }

    if (payment.appointmentType === "SOLO_NURSE") {
      adminEarnings += amount * 0.09; // 9%
    }
  }
  const totalAppointments = doctorAppointments + soloNurseAppointments;

  return {
    totalPatients,
    totalDoctors,
    totalClinics,
    totalSoloNurse,
    totalAppointments,
    totalEarnings,
    adminEarnings,
  };
};

const udpateAdmin = async (
  adminId: string,
  payload: any,
  profileImageUrl: string
) => {
  console.log(adminId, payload, profileImageUrl);
  const admin = await User_Model.findOneAndUpdate(
    { _id: adminId },
    {
      $set: {
        fullName: payload?.fullName,
        profileImage: profileImageUrl,
      },
    }
  );

  return admin;
};

export const DashboardService = {
  getDashboardOverview,
  udpateAdmin,
};
