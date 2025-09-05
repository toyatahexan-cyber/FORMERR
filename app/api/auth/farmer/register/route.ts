import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Farmer from '@/lib/models/Farmer';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { name, phone, password, village, district, state, crops, bankAccount, ifscCode } = await request.json();
    
    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ phone });
    if (existingFarmer) {
      return NextResponse.json({ error: 'Farmer already registered with this phone number' }, { status: 400 });
    }
    
    // Hash password and create farmer
    const hashedPassword = await hashPassword(password);
    const farmer = await Farmer.create({
      name,
      phone,
      password: hashedPassword,
      village,
      district,
      state,
      crops,
      bankAccount,
      ifscCode,
    });
    
    // Generate token
    const token = generateToken({ id: farmer._id, role: 'farmer' });
    
    const response = NextResponse.json({ 
      message: 'Registration successful',
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        role: farmer.role
      }
    });
    
    response.cookies.set('token', token, { 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}