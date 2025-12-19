import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

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

    // Users can only view their own profile unless they're admin
    if (id !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění zobrazit tento profil', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            organizedEvents: true,
            reservations: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('Uživatel nebyl nalezen', 404);
    }

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

    // Users can only update their own profile unless they're admin
    if (id !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění upravit tento profil', 403);
    }

    const updateData: any = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true
      }
    });

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

    if (!firstName || !lastName || !email) {
      throw new AppError('Všechna pole jsou povinná', 400);
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!currentUser) {
      throw new AppError('Uživatel nebyl nalezen', 404);
    }

    // Check if email is already taken by another user
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (existingUser) {
        throw new AppError('Email je již používán', 400);
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName,
        lastName,
        email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Return user with name field for frontend
    res.json({
      message: 'Profil byl úspěšně aktualizován',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
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

    if (!currentPassword || !newPassword) {
      throw new AppError('Musíte zadat současné i nové heslo', 400);
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      throw new AppError('Uživatel nenalezen', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError('Současné heslo není správné', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
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

    // Check if trying to deactivate an admin
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'Uživatel nenalezen' });
      return;
    }

    if (user.role === 'ADMIN') {
      res.status(403).json({ message: 'Nelze měnit stav administrátora' });
      return;
    }

    // Toggle isActive status
    // Ensure we have a proper boolean value (handle NULL cases)
    const currentStatus = user.isActive === true;
    const newStatus = !currentStatus;
    
    console.log('Current isActive status:', user.isActive, 'normalized:', currentStatus);
    console.log('New isActive status will be:', newStatus);
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: newStatus },
      select: { id: true, isActive: true }
    });
    
    console.log('Updated user isActive in DB:', updatedUser.isActive);

    res.json({ 
      message: newStatus ? 'Uživatel byl úspěšně aktivován' : 'Uživatel byl úspěšně deaktivován',
      isActive: newStatus
    });
  } catch (error) {
    next(error);
  }
};
