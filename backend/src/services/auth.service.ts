import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt';
import { AppError } from '../middleware/error.middleware';
import { emailService } from '../utils/emailService';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'USER' | 'ORGANIZER';
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError('Uživatel s tímto emailem již existuje', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'USER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user.email, user.firstName).catch(err => 
      console.error('Failed to send welcome email:', err)
    );

    return {
      user: {
        ...user,
        name: `${user.firstName} ${user.lastName}`
      },
      token
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user || !user.isActive) {
      throw new AppError('Neplatné přihlašovací údaje', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new AppError('Neplatné přihlašovací údaje', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      },
      token
    };
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('Uživatel nenalezen', 404);
    }

    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`
    };
  }
}

export const authService = new AuthService();
