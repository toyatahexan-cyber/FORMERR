'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/ui/navbar';
import { UserPlus, Phone, MapPin, CreditCard } from 'lucide-react';

const cropOptions = [
  'Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Bajra', 'Jowar', 
  'Groundnut', 'Soybean', 'Pulses', 'Vegetables', 'Fruits'
];

export default function FarmerRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    village: '',
    district: '',
    state: '',
    crops: [] as string[],
    bankAccount: '',
    ifscCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCropChange = (crop: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      crops: checked 
        ? [...prev.crops, crop]
        : prev.crops.filter(c => c !== crop)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.crops.length === 0) {
      setError('Please select at least one crop');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/farmer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          village: formData.village,
          district: formData.district,
          state: formData.state,
          crops: formData.crops,
          bankAccount: formData.bankAccount,
          ifscCode: formData.ifscCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/farmer/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center bg-green-600 text-white rounded-t-lg">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Farmer Registration</CardTitle>
              <p className="text-green-100">Join our platform to access government schemes</p>
            </CardHeader>
            
            <CardContent className="p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700 border-b pb-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Personal Information</span>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Create password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700 border-b pb-2">
                    <MapPin className="h-5 w-5" />
                    <span>Location Information</span>
                  </div>
                  
                  <div>
                    <Label htmlFor="village">Village *</Label>
                    <Input
                      id="village"
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your village name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Enter your district"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Enter your state"
                      />
                    </div>
                  </div>
                </div>

                {/* Crop Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700 border-b pb-2">
                    <span>🌾</span>
                    <span>Crop Information</span>
                  </div>
                  
                  <div>
                    <Label>Select Crops You Grow *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {cropOptions.map((crop) => (
                        <div key={crop} className="flex items-center space-x-2">
                          <Checkbox
                            id={crop}
                            checked={formData.crops.includes(crop)}
                            onCheckedChange={(checked) => 
                              handleCropChange(crop, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={crop} 
                            className="text-sm cursor-pointer"
                          >
                            {crop}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700 border-b pb-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Bank Information</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankAccount">Bank Account Number *</Label>
                      <Input
                        id="bankAccount"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ifscCode">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/farmer/login" className="text-green-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}