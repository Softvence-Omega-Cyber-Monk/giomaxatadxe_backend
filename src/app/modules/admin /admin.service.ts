import { Clinic_Model } from "../clinic/clinic.model";
import { Doctor_Model } from "../doctor/doctor.model";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { Patient_Model } from "../patient/patient.model";
import { Payment_Model } from "../payment/payment.model";

const getDashboardOverview = async () => {
  const [
    totalPatients,
    totalDoctors,
    totalClinics,
    totalAppointments,
    paidPayments,
  ] = await Promise.all([
    Patient_Model.countDocuments(),
    Doctor_Model.countDocuments(),
    Clinic_Model.countDocuments(),
    doctorAppointment_Model.countDocuments(),
    Payment_Model.find({
      status: "PAID",
    }),
  ]);

  let totalEarnings = 0;
  let adminEarnings = 0;

  for (const payment of paidPayments) {
    console.log('payment ', payment);
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

  return {
    totalPatients,
    totalDoctors,
    totalClinics,
    totalAppointments,
    totalEarnings,
    adminEarnings,
  };
};

export const DashboardService = {
  getDashboardOverview,
};
