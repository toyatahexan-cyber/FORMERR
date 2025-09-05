import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { username, password } = await request.json();
    
    // Create default admin if doesn't exist
    let admin = await Admin.findOne({ username });
    if (!admin && username === 'admin') {
      const hashedPassword = await hashPassword('admin123');
      admin = await Admin.create({
        username: 'admin',
        password: hashedPassword,
      });
    }
    
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check password
    const isValidPassword = await comparePassword(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Generate token
    const token = generateToken({ id: admin._id, role: 'admin' });
    
    const response = NextResponse.json({ 
      message: 'Login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
    
    response.cookies.set('token', token, { 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}