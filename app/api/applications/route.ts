import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Farmer from '@/lib/models/Farmer';
import Scheme from '@/lib/models/Scheme';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    let applications;
    if (decoded.role === 'admin') {
      applications = await Application.find({}).sort({ createdAt: -1 });
      
      // Populate farmer and scheme data
      const populatedApps = await Promise.all(
        applications.map(async (app) => {
          const farmer = await Farmer.findById(app.farmerId);
          const scheme = await Scheme.findById(app.schemeId);
          return {
            ...app.toObject(),
            farmerName: farmer?.name || 'Unknown',
            schemeTitle: scheme?.title || 'Unknown'
          };
        })
      );
      
      applications = populatedApps;
    } else {
      applications = await Application.find({ farmerId: decoded.id }).sort({ createdAt: -1 });
      
      // Populate scheme data
      const populatedApps = await Promise.all(
        applications.map(async (app) => {
          const scheme = await Scheme.findById(app.schemeId);
          return {
            ...app.toObject(),
            schemeTitle: scheme?.title || 'Unknown'
          };
        })
      );
      
      applications = populatedApps;
    }
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { schemeId, formData, documents } = await request.json();
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      farmerId: decoded.id,
      schemeId: schemeId
    });
    
    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this scheme' }, { status: 400 });
    }
    
    const application = await Application.create({
      farmerId: decoded.id,
      schemeId,
      formData,
      documents,
      status: 'submitted',
      submittedAt: new Date()
    });
    
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}