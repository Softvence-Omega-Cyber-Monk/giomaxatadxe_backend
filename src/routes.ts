import { Router } from 'express';
import { user_routes } from './app/modules/user/user.route';
import authRoute from './app/modules/auth/auth.route';
import { patientRoutes } from './app/modules/patient/patient.route';

const appRouter = Router();

const moduleRoutes = [
    { path: '/auth', route: authRoute },
    { path: "/user", route: user_routes },
    { path: "/patient", route: patientRoutes }


];

moduleRoutes.forEach(route => appRouter.use(route.path, route.route));
export default appRouter;