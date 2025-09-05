import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scheme from '@/lib/models/Scheme';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const scheme = await Scheme.findById(params.id);
    if (!scheme) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    
    return NextResponse.json({ scheme });
  } catch (error) {
    console.error('Error fetching scheme:', error);
    return NextResponse.json({ error: 'Failed to fetch scheme' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const updateData = await request.json();
    const scheme = await Scheme.findByIdAndUpdate(params.id, updateData, { new: true });
    
    if (!scheme) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    
    return NextResponse.json({ scheme });
  } catch (error) {
    console.error('Error updating scheme:', error);
    return NextResponse.json({ error: 'Failed to update scheme' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const scheme = await Scheme.findByIdAndDelete(params.id);
    if (!scheme) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheme:', error);
    return NextResponse.json({ error: 'Failed to delete scheme' }, { status: 500 });
  }
}