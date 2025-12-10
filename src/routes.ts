import { Router } from "express";
import { user_routes } from "./app/modules/user/user.route";
import authRoute from "./app/modules/auth/auth.route";
import { patientRoutes } from "./app/modules/patient/patient.route";
import { ClinicRoutes } from "./app/modules/clinic/clinic.route";
import { SoloNurseRoutes } from "./app/modules/soloNurse/soloNurse.route";
import { DoctorRoutes } from "./app/modules/doctor/doctor.route";
import { DoctorAppointmentRoutes } from "./app/modules/doctorAppointment/doctorAppointment.route";
import { soloNurseAppoinmentRoutes } from "./app/modules/soloNurseAppoinment/soloNurseAppoinment.route";

const appRouter = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoute },
  { path: "/user", route: user_routes },
  { path: "/patient", route: patientRoutes },
  { path: "/clinic", route: ClinicRoutes },
  { path: "/solo-nurse", route: SoloNurseRoutes },
  { path: "/doctor", route: DoctorRoutes },
  { path: "/doctor-appointment", route: DoctorAppointmentRoutes },
  { path: "/solo-nurse-appointment", route: soloNurseAppoinmentRoutes },
];

moduleRoutes.forEach((route) => appRouter.use(route.path, route.route));
export default appRouter;
