"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold font-heading hover:text-[#ff6b35] transition-colors">
            TrendifyMart
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="hover:text-[#ff6b35] transition-colors font-medium">
              Home
            </Link>
            <Link href="/collections" className="hover:text-[#ff6b35] transition-colors font-medium">
              Collections
            </Link>
            <Link href="/products" className="hover:text-[#ff6b35] transition-colors font-medium">
              Products
            </Link>
            <Link href="/about" className="hover:text-[#ff6b35] transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#ff6b35] transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <Button variant="ghost" size="icon" className="hover:bg-gray-800 hover:text-[#ff6b35] transition-colors">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-800 hover:text-[#ff6b35] transition-colors">
              <Heart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-[#ff6b35] hover:bg-[#ff6b35]/90 border-0 p-0 flex items-center justify-center">
                0
              </Badge>
            </Button>
            {/* Cart */}
            <Button asChild variant="ghost" size="icon" className="relative hover:bg-gray-800 hover:text-[#ff6b35] transition-colors">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-[#ff6b35] hover:bg-[#ff6b35]/90 border-0 p-0 flex items-center justify-center">
                  {totalItems}
                </Badge>
              </Link>
            </Button>

            {/* User Account */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-800 hover:text-[#ff6b35] transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block">{user.name}</span>
                </Button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-900 border-b">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                    
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Button asChild variant="ghost" className="hover:bg-gray-800 hover:text-[#ff6b35] transition-colors">
                  <Link href="/login">
                    Login
                  </Link>
                </Button>
                <Button asChild className="bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white transition-colors">
                  <Link href="/signup">
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800 bg-black/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/collections" 
                className="px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </Link>
              <Link 
                href="/products" 
                className="px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/about" 
                className="px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {user ? (
                <div className="border-t border-gray-800 pt-2 mt-2">
                  <div className="px-4 py-3 text-sm text-gray-300 font-medium">
                    Welcome, {user.name}
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-800 pt-2 mt-2 space-y-2">
                  <Link
                    href="/login"
                    className="block px-4 py-3 hover:bg-gray-800 hover:text-[#ff6b35] rounded-lg transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-3 bg-[#ff6b35] hover:bg-[#ff6b35]/90 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Dropdown Overlay */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}