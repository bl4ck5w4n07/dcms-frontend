'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { HomeBookingForm } from './HomeBookingForm';

import { 
  Calendar, 
  Clock, 
  Shield, 
  Star, 
  Phone, 
  MapPin, 
  Mail,
  Award,
  Users,
  Heart,
  CheckCircle
} from 'lucide-react';

interface HomepageProps {
  onLoginClick: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onLoginClick }) => {
  // Function to scroll to booking form
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-form');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const services = [
    {
      name: 'Regular Cleaning',
      description: 'Comprehensive dental cleaning and examination',
      price: '$150',
      duration: '60 min'
    },
    {
      name: 'Dental Filling',
      description: 'High-quality composite or amalgam fillings',
      price: '$300',
      duration: '90 min'
    },
    {
      name: 'Root Canal',
      description: 'Advanced root canal therapy with modern techniques',
      price: '$1,200',
      duration: '120 min'
    },
    {
      name: 'Teeth Whitening',
      description: 'Professional whitening for a brighter smile',
      price: '$400',
      duration: '90 min'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'Excellent service! The staff is professional and the facility is modern and clean.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      text: 'Dr. Johnson made my root canal completely painless. Highly recommend!',
      rating: 5
    },
    {
      name: 'Emma Davis',
      text: 'Best dental experience I\'ve ever had. The online booking system is so convenient.',
      rating: 5
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Easy Online Booking',
      description: 'Book appointments 24/7 with our simple online system'
    },
    {
      icon: Shield,
      title: 'Safe & Sterile',
      description: 'State-of-the-art sterilization and safety protocols'
    },
    {
      icon: Award,
      title: 'Expert Dentists',
      description: 'Board-certified professionals with years of experience'
    },
    {
      icon: Heart,
      title: 'Gentle Care',
      description: 'Pain-free treatments with a focus on patient comfort'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Go-Goyagoy Dental</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900">Services</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onLoginClick}>
                  Sign In
                </Button>
                <Button onClick={onLoginClick}>
                  Sign Up
                </Button>
              </div>
            </nav>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onLoginClick}>
                Sign In
              </Button>
              <Button size="sm" onClick={onLoginClick}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800">Modern Dental Care</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Your Perfect Smile Starts Here
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience world-class dental care with our team of expert dentists. 
                From routine cleanings to advanced procedures, we're here for all your dental needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-3"
                  onClick={scrollToBooking}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
                
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  <Phone className="mr-2 h-5 w-5" />
                  (555) 123-DENTAL
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Happy Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4.9</div>
                  <div className="text-sm text-gray-600">Star Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1644072267093-cbbfdb74303c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkZW50YWwlMjBvZmZpY2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTUwNzc5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Modern dental office"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              
              {/* Floating Cards */}
              <Card className="absolute -bottom-4 -left-4 bg-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">99% Success Rate</div>
                      <div className="text-sm text-gray-600">Patient Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="absolute -top-4 -right-4 bg-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Same Day</div>
                      <div className="text-sm text-gray-600">Emergency Care</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Fixed Booking Form Section */}
      <section id="booking-form" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Book Your Appointment</h2>
            <p className="text-xl text-gray-600">Quick and easy scheduling - we'll contact you within 24 hours</p>
          </div>
          
          <div className="flex justify-center">
            <HomeBookingForm
              isOpen={true}
              onClose={() => {}}
              onSuccess={() => {}}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Go-Goyagoy?</h2>
            <p className="text-xl text-gray-600">We're committed to providing exceptional dental care</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive dental care for the whole family</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-blue-600">{service.price}</div>
                    <Badge variant="outline">{service.duration}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
            <p className="text-xl text-gray-600">Don't just take our word for it</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section id="contact" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-gray-600">(555) 123-DENTAL</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-600">info@gogoyagoy.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-gray-600">123 Dental Plaza<br />Your City, State 12345</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Hours</div>
                    <div className="text-gray-600">
                      Mon-Fri: 8:00 AM - 6:00 PM<br />
                      Sat: 9:00 AM - 4:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Ready to Schedule?</h3>
              <p className="mb-6">
                Book your appointment today and take the first step towards a healthier, brighter smile.
              </p>
              
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full mb-4"
                onClick={scrollToBooking}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Appointment
              </Button>
              
              <div className="text-center">
                <p className="text-blue-100">Or call us directly</p>
                <p className="text-2xl font-bold">(555) 123-DENTAL</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold">Go-Goyagoy Dental</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner in dental health, providing quality care with a gentle touch.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="#" onClick={onLoginClick} className="hover:text-white cursor-pointer">Sign In</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Emergency Care</h4>
              <p className="text-gray-400 mb-2">24/7 Emergency Hotline:</p>
              <p className="text-xl font-semibold text-blue-400">(555) 911-TOOTH</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Go-Goyagoy Dental. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};