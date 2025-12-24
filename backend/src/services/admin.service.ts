import prisma from '../config/database';

class AdminService {
  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats() {
    // Users stats
    const totalUsers = await prisma.user.count();
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    // Events stats
    const totalEvents = await prisma.event.count();
    const eventsByStatus = await prisma.event.groupBy({
      by: ['status'],
      _count: true
    });

    // Reservations stats
    const totalReservations = await prisma.reservation.count();
    const reservationsByStatus = await prisma.reservation.groupBy({
      by: ['status'],
      _count: true
    });

    // Total revenue (only from COMPLETED payments)
    const revenueData = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    // Pending complaints
    const pendingComplaints = await prisma.complaint.count({
      where: {
        status: {
          in: ['SUBMITTED', 'IN_REVIEW']
        }
      }
    });

    return {
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>)
      },
      events: {
        total: totalEvents,
        byStatus: eventsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>)
      },
      reservations: {
        total: totalReservations,
        byStatus: reservationsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>)
      },
      revenue: {
        total: Number(revenueData._sum.amount || 0)
      },
      complaints: {
        pending: pendingComplaints
      }
    };
  }
}

export const adminService = new AdminService();
