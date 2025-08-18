"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Star, ChevronRight, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  colors: string[];
  sizes: string[];
  stock: number;
  rating: number;
  reviewCount: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock product data - replace with actual API call
        const mockProduct: Product = {
          id: "1",
          name: "Olive Green Tipping Polo",
          slug: params.slug as string,
          description: "Experience ultimate comfort and style with our Premium Executive Polo Shirt. Crafted from high-quality cotton blend fabric with moisture-wicking technology, this polo offers exceptional durability and all-day comfort. Features a classic collar design, three-button placket, and subtle branding for a sophisticated look.",
          price: 799,
          salePrice: 599,
          images: [
            "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/9_1_9c506c3c-578f-44ce-bd09-c42f6524bacc-12.jpg",
            "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/9_7_0539efce-2e9c-4e84-a394-ef04bb015711-13.jpg",
            "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/8_1-20.jpg"
          ],
          category: "Polo Shirts",
          colors: ["Navy", "White", "Black", "Maroon"],
          sizes: ["S", "M", "L", "XL", "XXL"],
          stock: 25,
          rating: 4.8,
          reviewCount: 127
        };

        const mockRelatedProducts: RelatedProduct[] = [
          {
            id: "2",
            name: "Classic Cotton Polo",
            slug: "classic-cotton-polo",
            price: 699,
            salePrice: 549,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/8_6-21.jpg"
          },
          {
            id: "3",
            name: "Premium Round Neck Tee",
            slug: "premium-round-neck-tee",
            price: 599,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0452copy-26.jpg"
          },
          {
            id: "4",
            name: "Executive Pocket Polo",
            slug: "executive-pocket-polo",
            price: 799,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/3_1-22.jpg"
          },
          {
            id: "5",
            name: "Smart Tech Polo",
            slug: "smart-tech-polo",
            price: 899,
            salePrice: 699,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0498copy-24.jpg"
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProduct(mockProduct);
        setRelatedProducts(mockRelatedProducts);
        if (mockProduct.colors.length > 0) setSelectedColor(mockProduct.colors[0]);
        if (mockProduct.sizes.length > 0) setSelectedSize(mockProduct.sizes[0]);
      } catch (err) {
        setError("Failed to load product details");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!product || !selectedSize || !selectedColor) {
      toast.error("Please select size and color before adding to cart");
      return;
    }

    setAddingToCart(true);
    
    try {
      // Mock API call - replace with actual cart API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${product.name} has been added to your cart`);
    } catch (error) {
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && quantity < (product?.stock || 0)) {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Skeleton */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Product Detail Skeleton */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/collections" className="hover:text-gray-900 transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-all duration-300"
                priority
              />
              {product.salePrice && (
                <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600">
                  Sale
                </Badge>
              )}
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-50 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-black" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-3">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    Rs. {product.salePrice.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-md border-2 transition-colors ${
                      selectedColor === color
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Size</h3>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('increase')}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0 || !selectedSize || !selectedColor}
              className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white py-3 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg disabled:hover:scale-100"
              size="lg"
            >
              {addingToCart ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-12 uppercase tracking-wide italic">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/products/${relatedProduct.slug}`}>
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-gray-50">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedProduct.salePrice && (
                        <Badge className="absolute top-3 left-3 bg-blue-500">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-2 group-hover:text-[#ff6b35] transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {relatedProduct.salePrice ? (
                          <>
                            <span className="font-semibold text-gray-900">
                              Rs. {relatedProduct.salePrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              Rs. {relatedProduct.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            Rs. {relatedProduct.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}