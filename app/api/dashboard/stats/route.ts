import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Farmer from '@/lib/models/Farmer';
import Scheme from '@/lib/models/Scheme';
import Application from '@/lib/models/Application';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const [
      totalFarmers,
      totalSchemes,
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications
    ] = await Promise.all([
      Farmer.countDocuments(),
      Scheme.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
      Application.countDocuments({ status: { $in: ['submitted', 'under-review'] } })
    ]);
    
    return NextResponse.json({
      stats: {
        totalFarmers,
        totalSchemes,
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}