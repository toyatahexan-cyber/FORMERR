import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Farmer from '@/lib/models/Farmer';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { phone, password } = await request.json();
    
    // Find farmer
    const farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check password
    const isValidPassword = await comparePassword(password, farmer.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Generate token
    const token = generateToken({ id: farmer._id, role: 'farmer' });
    
    const response = NextResponse.json({ 
      message: 'Login successful',
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        role: farmer.role
      }
    });
    
    response.cookies.set('token', token, { 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}