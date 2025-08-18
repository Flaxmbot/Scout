"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Grid3x3, List, ShoppingCart, Eye, Heart, Star, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Mock product data - in real app, this would come from your database
const mockProducts = [
  {
    id: 1,
    name: "Premium Polo Shirt",
    category: "polo-shirts",
    price: 79.99,
    originalPrice: 99.99,
    image: "/api/placeholder/300/400",
    rating: 4.8,
    reviews: 124,
    colors: ["black", "white", "navy"],
    sizes: ["S", "M", "L", "XL"],
    brand: "TrendifyMart",
    isNew: false,
    onSale: true,
  },
  {
    id: 2,
    name: "Classic Cotton T-Shirt",
    category: "t-shirts",
    price: 29.99,
    originalPrice: null,
    image: "/api/placeholder/300/400",
    rating: 4.6,
    reviews: 89,
    colors: ["white", "black", "gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    brand: "ComfortWear",
    isNew: true,
    onSale: false,
  },
  {
    id: 3,
    name: "Vintage Denim Jacket",
    category: "jackets",
    price: 149.99,
    originalPrice: 179.99,
    image: "/api/placeholder/300/400",
    rating: 4.9,
    reviews: 67,
    colors: ["blue", "black"],
    sizes: ["S", "M", "L"],
    brand: "VintageStyle",
    isNew: false,
    onSale: true,
  },
  {
    id: 4,
    name: "Performance Athletic Shirt",
    category: "t-shirts",
    price: 49.99,
    originalPrice: null,
    image: "/api/placeholder/300/400",
    rating: 4.7,
    reviews: 156,
    colors: ["black", "navy", "red"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    brand: "SportMax",
    isNew: true,
    onSale: false,
  },
  {
    id: 5,
    name: "Elegant Polo Collection",
    category: "polo-shirts",
    price: 89.99,
    originalPrice: 119.99,
    image: "/api/placeholder/300/400",
    rating: 4.5,
    reviews: 92,
    colors: ["navy", "white", "burgundy"],
    sizes: ["S", "M", "L", "XL"],
    brand: "Elegant",
    isNew: false,
    onSale: true,
  },
  {
    id: 6,
    name: "Casual Hoodie",
    category: "hoodies",
    price: 69.99,
    originalPrice: null,
    image: "/api/placeholder/300/400",
    rating: 4.4,
    reviews: 78,
    colors: ["gray", "black", "navy"],
    sizes: ["S", "M", "L", "XL"],
    brand: "CasualWear",
    isNew: true,
    onSale: false,
  },
];

const categories = [
  { id: "all", name: "All Products", count: 6 },
  { id: "polo-shirts", name: "Polo Shirts", count: 2 },
  { id: "t-shirts", name: "T-Shirts", count: 2 },
  { id: "jackets", name: "Jackets", count: 1 },
  { id: "hoodies", name: "Hoodies", count: 1 },
];

const sortOptions = [
  { value: "popularity", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const brands = ["TrendifyMart", "ComfortWear", "VintageStyle", "SportMax", "Elegant", "CasualWear"];
const colors = ["black", "white", "navy", "gray", "blue", "red", "burgundy"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showOnSale, setShowOnSale] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const productsPerPage = 6;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors.some(color => selectedColors.includes(color))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes.some(size => selectedSizes.includes(size))
      );
    }

    // Price filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // On sale filter
    if (showOnSale) {
      filtered = filtered.filter(product => product.onSale);
    }

    // New filter
    if (showNew) {
      filtered = filtered.filter(product => product.isNew);
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy, selectedBrands, selectedColors, selectedSizes, priceRange, showOnSale, showNew]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 200]);
    setShowOnSale(false);
    setShowNew(false);
  };

  const ProductCard = ({ product }: { product: typeof mockProducts[0] }) => (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.onSale && (
          <Badge className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600">
            SALE
          </Badge>
        )}
        {product.isNew && (
          <Badge className="absolute top-2 right-2 bg-warm-orange hover:bg-warm-orange/90">
            NEW
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-gray-600">Brand: {product.brand}</p>
                  <div className="space-y-2">
                    <Label>Colors</Label>
                    <div className="flex gap-2">
                      {product.colors.map(color => (
                        <div
                          key={color}
                          className={`w-6 h-6 rounded-full border-2 border-gray-300 ${
                            color === "white" ? "bg-white" : 
                            color === "black" ? "bg-black" :
                            color === "navy" ? "bg-blue-900" :
                            color === "gray" ? "bg-gray-500" :
                            color === "blue" ? "bg-blue-500" :
                            color === "red" ? "bg-red-500" :
                            color === "burgundy" ? "bg-red-800" : "bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sizes</Label>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map(size => (
                        <Badge key={size} variant="outline">{size}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-warm-orange hover:bg-warm-orange/90">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="icon" variant="secondary" className="rounded-full">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" className="rounded-full bg-warm-orange hover:bg-warm-orange/90">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-warm-orange transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
      </CardContent>
    </Card>
  );

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="font-medium">Price Range</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={200}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <Label className="font-medium">Brands</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand]);
                  } else {
                    setSelectedBrands(selectedBrands.filter(b => b !== brand));
                  }
                }}
              />
              <Label htmlFor={brand} className="text-sm">{brand}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <Label className="font-medium">Colors</Label>
        <div className="grid grid-cols-4 gap-2">
          {colors.map(color => (
            <div
              key={color}
              className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                selectedColors.includes(color) ? "border-warm-orange scale-110" : "border-gray-300"
              } ${
                color === "white" ? "bg-white" : 
                color === "black" ? "bg-black" :
                color === "navy" ? "bg-blue-900" :
                color === "gray" ? "bg-gray-500" :
                color === "blue" ? "bg-blue-500" :
                color === "red" ? "bg-red-500" :
                color === "burgundy" ? "bg-red-800" : "bg-gray-400"
              }`}
              onClick={() => {
                if (selectedColors.includes(color)) {
                  setSelectedColors(selectedColors.filter(c => c !== color));
                } else {
                  setSelectedColors([...selectedColors, color]);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <Label className="font-medium">Sizes</Label>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map(size => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              className={selectedSizes.includes(size) ? "bg-warm-orange hover:bg-warm-orange/90" : ""}
              onClick={() => {
                if (selectedSizes.includes(size)) {
                  setSelectedSizes(selectedSizes.filter(s => s !== size));
                } else {
                  setSelectedSizes([...selectedSizes, size]);
                }
              }}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Special Filters */}
      <div className="space-y-3">
        <Label className="font-medium">Special</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={showOnSale}
              onCheckedChange={(checked) => setShowOnSale(checked === true)}
            />
            <Label htmlFor="on-sale" className="text-sm">On Sale</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new-arrivals"
              checked={showNew}
              onCheckedChange={(checked) => setShowNew(checked === true)}
            />
            <Label htmlFor="new-arrivals" className="text-sm">New Arrivals</Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 font-heading">SHOP ALL PRODUCTS</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our complete collection of premium clothing and accessories. 
              Find your perfect style from our carefully curated selection.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full ${
                  selectedCategory === category.id 
                    ? "bg-warm-orange hover:bg-warm-orange/90" 
                    : "hover:bg-warm-orange hover:text-white"
                }`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <Card className="p-6 sticky top-4">
              <FilterSidebar />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                {/* Mobile Filter Button */}
                <Dialog open={showFilters} onOpenChange={setShowFilters}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filters</DialogTitle>
                    </DialogHeader>
                    <FilterSidebar />
                  </DialogContent>
                </Dialog>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className={viewMode === "grid" ? "bg-warm-orange hover:bg-warm-orange/90" : ""}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className={viewMode === "list" ? "bg-warm-orange hover:bg-warm-orange/90" : ""}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
              </p>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full h-64" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={currentPage === i + 1 ? "bg-warm-orange hover:bg-warm-orange/90" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}