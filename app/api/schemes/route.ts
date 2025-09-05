import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scheme from '@/lib/models/Scheme';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const issuer = searchParams.get('issuer');
    const cropType = searchParams.get('cropType');
    
    let filter: any = { isActive: true };
    if (issuer) filter.issuer = issuer;
    if (cropType) filter.cropTypes = { $in: [cropType] };
    
    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ schemes });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const schemeData = await request.json();
    const scheme = await Scheme.create(schemeData);
    
    return NextResponse.json({ scheme });
  } catch (error) {
    console.error('Error creating scheme:', error);
    return NextResponse.json({ error: 'Failed to create scheme' }, { status: 500 });
  }
}