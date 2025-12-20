import { Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { userService } from '../services/user.service';

export const getAllUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users, count: users.length });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;
    const user = await userService.getUserById(id, req.user.userId, req.user.role);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;
    const { firstName, lastName, password } = req.body;

    const user = await userService.updateUser(
      id,
      req.user.userId,
      req.user.role,
      { firstName, lastName, password }
    );

    res.json({
      message: 'Profil byl úspěšně aktualizován',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { firstName, lastName, email } = req.body;

    const user = await userService.updateProfile(req.user.userId, {
      firstName,
      lastName,
      email
    });

    res.json({
      message: 'Profil byl úspěšně aktualizován',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { currentPassword, newPassword } = req.body;

    await userService.updatePassword(req.user.userId, {
      currentPassword,
      newPassword
    });

    res.json({ message: 'Heslo bylo úspěšně změněno' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await userService.toggleUserStatus(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
