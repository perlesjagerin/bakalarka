import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/error.middleware';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  password?: string;
}

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
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

    return users;
  }

  /**
   * Get user by ID with authorization check
   */
  async getUserById(userId: string, requestUserId: string, requestUserRole: string) {
    // Users can only view their own profile unless they're admin
    if (userId !== requestUserId && requestUserRole !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění zobrazit tento profil', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    return user;
  }

  /**
   * Update user (admin or self)
   */
  async updateUser(
    userId: string,
    requestUserId: string,
    requestUserRole: string,
    data: UpdateUserData
  ) {
    // Users can only update their own profile unless they're admin
    if (userId !== requestUserId && requestUserRole !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění upravit tento profil', 403);
    }

    const updateData: any = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
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

    return user;
  }

  /**
   * Update profile (self only)
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    const { firstName, lastName, email } = data;

    if (!firstName || !lastName || !email) {
      throw new AppError('Všechna pole jsou povinná', 400);
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
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
      where: { id: userId },
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
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, data: UpdatePasswordData) {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw new AppError('Musíte zadat současné i nové heslo', 400);
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
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
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  /**
   * Toggle user active status (admin only)
   */
  async toggleUserStatus(userId: string) {
    // Check if trying to deactivate an admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Uživatel nenalezen', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Nelze měnit stav administrátora', 403);
    }

    // Toggle isActive status
    const currentStatus = user.isActive === true;
    const newStatus = !currentStatus;
    
    console.log('Current isActive status:', user.isActive, 'normalized:', currentStatus);
    console.log('New isActive status will be:', newStatus);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: newStatus },
      select: { id: true, isActive: true }
    });
    
    console.log('Updated user isActive in DB:', updatedUser.isActive);

    return {
      message: newStatus ? 'Uživatel byl úspěšně aktivován' : 'Uživatel byl úspěšně deaktivován',
      isActive: newStatus
    };
  }
}

export const userService = new UserService();
