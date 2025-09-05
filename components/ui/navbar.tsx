'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { Menu, X, LogOut, User } from 'lucide-react';

interface NavbarProps {
  user?: {
    name?: string;
    username?: string;
    role: 'farmer' | 'admin';
  };
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">🌾 FarmerSchemes</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {user.role === 'admin' ? user.username : user.name}
                  </span>
                </div>
                {user.role === 'farmer' ? (
                  <>
                    <Link href="/farmer/dashboard" className="hover:bg-green-700 px-3 py-2 rounded-md">
                      Dashboard
                    </Link>
                    <Link href="/farmer/applications" className="hover:bg-green-700 px-3 py-2 rounded-md">
                      My Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/admin/dashboard" className="hover:bg-green-700 px-3 py-2 rounded-md">
                      Dashboard
                    </Link>
                    <Link href="/admin/schemes" className="hover:bg-green-700 px-3 py-2 rounded-md">
                      Schemes
                    </Link>
                    <Link href="/admin/applications" className="hover:bg-green-700 px-3 py-2 rounded-md">
                      Applications
                    </Link>
                  </>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-green-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-x-2">
                <Link href="/farmer/login">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    Farmer Login
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    Admin Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="sm"
              className="text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-green-700">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm border-b border-green-600 mb-2">
                  {user.role === 'admin' ? user.username : user.name}
                </div>
                {user.role === 'farmer' ? (
                  <>
                    <Link
                      href="/farmer/dashboard"
                      className="block px-3 py-2 rounded-md hover:bg-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/farmer/applications"
                      className="block px-3 py-2 rounded-md hover:bg-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="block px-3 py-2 rounded-md hover:bg-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/schemes"
                      className="block px-3 py-2 rounded-md hover:bg-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Schemes
                    </Link>
                    <Link
                      href="/admin/applications"
                      className="block px-3 py-2 rounded-md hover:bg-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Applications
                    </Link>
                  </>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="ml-3 mt-2 border-white text-white hover:bg-white hover:text-green-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2 px-3">
                <Link href="/farmer/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-white text-green-600 hover:bg-gray-100">
                    Farmer Login
                  </Button>
                </Link>
                <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-white text-green-600 hover:bg-gray-100">
                    Admin Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}