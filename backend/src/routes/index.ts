import { Router } from "express";
import { userRoutes } from "./userRoutes";
import { authRoutes } from "./authRoutes";

const router = Router();

router.use("/auth", authRoutes);

// Registra as rotas de usuários sob o prefixo /users
router.use('/users', userRoutes);

export { router as appRoutes };