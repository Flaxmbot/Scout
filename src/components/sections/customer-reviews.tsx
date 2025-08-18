"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const CustomerReviews = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "New York, NY",
      rating: 5,
      text: "The quality of these products is outstanding! Fast shipping and excellent customer service. I'll definitely be ordering again.",
      avatar: "/api/placeholder/40/40",
      initials: "SJ",
      product: "Premium Polo Shirt",
      verified: true
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "San Francisco, CA",
      rating: 5,
      text: "Love the modern designs and comfortable fit. TrendifyMart has become my go-to for professional attire.",
      avatar: "/api/placeholder/40/40",
      initials: "MC",
      product: "Smart Tech Collection",
      verified: true
    },
    {
      id: 3,
      name: "Emily Davis",
      location: "Austin, TX",
      rating: 4,
      text: "Great selection of products and competitive prices. The website is easy to navigate and checkout was smooth.",
      avatar: "/api/placeholder/40/40",
      initials: "ED",
      product: "Summer Collection",
      verified: false
    },
    {
      id: 4,
      name: "David Wilson",
      location: "Seattle, WA",
      rating: 5,
      text: "Exceptional quality and attention to detail. The customer support team was incredibly helpful with my order.",
      avatar: "/api/placeholder/40/40",
      initials: "DW",
      product: "Premium Essentials",
      verified: true
    },
    {
      id: 5,
      name: "Lisa Thompson",
      location: "Miami, FL",
      rating: 5,
      text: "I'm impressed by the sustainable practices and eco-friendly packaging. Quality products with a conscience!",
      avatar: "/api/placeholder/40/40",
      initials: "LT",
      product: "Eco-Friendly Line",
      verified: true
    },
    {
      id: 6,
      name: "Robert Martinez",
      location: "Chicago, IL",
      rating: 4,
      text: "Fast delivery and products exactly as described. The sizing guide was very helpful for getting the perfect fit.",
      avatar: "/api/placeholder/40/40",
      initials: "RM",
      product: "Business Casual",
      verified: true
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust TrendifyMart for quality,
            style, and exceptional service.
          </p>
          <div className="flex items-center justify-center mt-8 space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">4.8</div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(5)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">10K+</div>
              <div className="text-sm text-gray-500 mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">50K+</div>
              <div className="text-sm text-gray-500 mt-1">Orders Delivered</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {review.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        {review.name}
                        {review.verified && (
                          <Badge 
                            variant="secondary" 
                            className="ml-2 text-xs bg-green-100 text-green-800"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{review.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{review.text}"
                </p>

                {/* Product */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Purchased: <span className="font-medium text-gray-700">{review.product}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join Our Happy Customers
            </h3>
            <p className="text-gray-600 mb-6">
              Experience the quality and service that makes our customers rave about us.
              Your satisfaction is our guarantee.
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;