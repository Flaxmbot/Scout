"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Grid, List, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  inStock: boolean;
  slug: string;
  isOnSale?: boolean;
}

function CollectionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock categories data
        const mockCategories: Category[] = [
          {
            id: "1",
            name: "Polos",
            description: "Discover our premium collection of Polos, perfect for a smart casual look. Made from breathable fabrics for ultimate comfort.",
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/9_1_9c506c3c-578f-44ce-bd09-c42f6524bacc-12.jpg",
            productCount: 8,
            slug: "polos"
          },
          {
            id: "2",
            name: "T-Shirts",
            description: "Explore our diverse range of T-shirts, from classic crew necks to trendy graphic tees. Find your everyday comfort and style.",
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0452copy-26.jpg",
            productCount: 6,
            slug: "t-shirts"
          },
          {
            id: "3",
            name: "Smart Tech Polos",
            description: "Experience innovation with our Smart Tech Polos. Featuring moisture-wicking, anti-bacterial, and wrinkle-resistant properties for peak performance.",
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/8_1-20.jpg",
            productCount: 4,
            slug: "smart-tech-polos"
          }
        ];

        // Mock products data
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Olive Green Tipping Polo",
            price: 599,
            originalPrice: 799,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/9_1_9c506c3c-578f-44ce-bd09-c42f6524bacc-12.jpg",
            category: "Polos",
            categoryId: "1",
            inStock: true,
            slug: "olive-green-tipping-polo",
            isOnSale: true
          },
          {
            id: "2",
            name: "Executive Pocket Polo",
            price: 799,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/8_1-20.jpg",
            category: "Smart Tech Polos",
            categoryId: "3",
            inStock: true,
            slug: "executive-pocket-polo"
          },
          {
            id: "3",
            name: "Black Round Neck T-shirt",
            price: 599,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0452copy-26.jpg",
            category: "T-Shirts",
            categoryId: "2",
            inStock: true,
            slug: "black-round-neck-t-shirt"
          },
          {
            id: "4",
            name: "White Round Neck T-shirt",
            price: 599,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0461copy-27.jpg",
            category: "T-Shirts",
            categoryId: "2",
            inStock: true,
            slug: "white-round-neck-t-shirt"
          },
          {
            id: "5",
            name: "Maroon Round Neck T-shirt",
            price: 599,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0440copy2_c27fed6d-588d-44bd-bf79-88882c502aab-28.jpg",
            category: "T-Shirts",
            categoryId: "2",
            inStock: true,
            slug: "maroon-round-neck-t-shirt"
          },
          {
            id: "6",
            name: "Navy Premium Polo",
            price: 749,
            originalPrice: 899,
            image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/8_6-21.jpg",
            category: "Polos",
            categoryId: "1",
            inStock: true,
            slug: "navy-premium-polo",
            isOnSale: true
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCategories(mockCategories);
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filters
    if (priceFilters.length > 0) {
      filtered = filtered.filter(product => {
        return priceFilters.some(filter => {
          switch (filter) {
            case "under-500":
              return product.price < 500;
            case "500-1000":
              return product.price >= 500 && product.price <= 1000;
            case "1000-2000":
              return product.price >= 1000 && product.price <= 2000;
            case "over-2000":
              return product.price > 2000;
            default:
              return true;
          }
        });
      });
    }

    // Availability filter
    if (availabilityFilter.length > 0) {
      filtered = filtered.filter(product => {
        if (availabilityFilter.includes("in-stock")) return product.inStock;
        if (availabilityFilter.includes("out-of-stock")) return !product.inStock;
        return true;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return parseInt(b.id) - parseInt(a.id);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, selectedCategory, searchQuery, sortBy, priceFilters, availabilityFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedCategoryData = categories.find(cat => cat.slug === selectedCategory);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.replace(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceFilters([]);
    setAvailabilityFilter([]);
    setSortBy("name");
    setSelectedCategory("all");
    router.replace('/collections');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-8">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Collections</span>
          {selectedCategoryData && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{selectedCategoryData.name}</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 italic">
            {selectedCategoryData ? selectedCategoryData.name : "All Collections"}
          </h1>
          {selectedCategoryData && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {selectedCategoryData.description}
            </p>
          )}
        </div>

        {/* Category Cards */}
        {selectedCategory === "all" && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Card 
                  key={category.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      <Badge variant="secondary">{category.productCount} items</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <Button variant="outline" className="w-full border-gray-300 hover:bg-[#ff6b35] hover:text-white hover:border-[#ff6b35] transition-all duration-300 hover:scale-105">
                      View Collection <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[120px]">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <div className="font-semibold mb-2">Price Range</div>
                    {["under-500", "500-1000", "1000-2000", "over-2000"].map((filter) => (
                      <DropdownMenuCheckboxItem
                        key={filter}
                        checked={priceFilters.includes(filter)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPriceFilters([...priceFilters, filter]);
                          } else {
                            setPriceFilters(priceFilters.filter(f => f !== filter));
                          }
                        }}
                      >
                        {filter === "under-500" && "Under ₹500"}
                        {filter === "500-1000" && "₹500 - ₹1000"}
                        {filter === "1000-2000" && "₹1000 - ₹2000"}
                        {filter === "over-2000" && "Over ₹2000"}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <div className="font-semibold mb-2 mt-4">Availability</div>
                    {["in-stock", "out-of-stock"].map((filter) => (
                      <DropdownMenuCheckboxItem
                        key={filter}
                        checked={availabilityFilter.includes(filter)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAvailabilityFilter([...availabilityFilter, filter]);
                          } else {
                            setAvailabilityFilter(availabilityFilter.filter(f => f !== filter));
                          }
                        }}
                      >
                        {filter === "in-stock" ? "In Stock" : "Out of Stock"}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-4 items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(priceFilters.length > 0 || availabilityFilter.length > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {priceFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="cursor-pointer" onClick={() => setPriceFilters(priceFilters.filter(f => f !== filter))}>
                  {filter.replace("-", " - ₹")} ×
                </Badge>
              ))}
              {availabilityFilter.map((filter) => (
                <Badge key={filter} variant="secondary" className="cursor-pointer" onClick={() => setAvailabilityFilter(availabilityFilter.filter(f => f !== filter))}>
                  {filter === "in-stock" ? "In Stock" : "Out of Stock"} ×
                </Badge>
              ))}
              {searchQuery && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleSearch("")}>
                  Search: "{searchQuery}" ×
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {selectedCategoryData && ` in ${selectedCategoryData.name}`}
          </p>
          {selectedCategory !== "all" && (
            <Button variant="outline" onClick={() => setSelectedCategory("all")}>
              View All Categories
            </Button>
          )}
        </div>

        {/* Products Grid/List */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <Search className="h-16 w-16 mx-auto text-gray-300" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? `No results for "${searchQuery}"` : "No products match your current filters"}
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 mb-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {paginatedProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isOnSale && (
                      <Badge className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-600">
                        Sale
                      </Badge>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className={viewMode === "list" ? "flex justify-between items-center" : ""}>
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <h3 className="font-medium text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-gray-900">₹{product.price.toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <div className={viewMode === "list" ? "ml-4" : "mt-4"}>
                        <Link href={`/products/${product.slug}`}>
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 hover:bg-[#ff6b35] hover:text-white hover:border-[#ff6b35] transition-all duration-300 hover:scale-105"
                            disabled={!product.inStock}
                          >
                            {product.inStock ? "Choose options" : "Out of Stock"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
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
          </>
        )}
      </div>
    </div>
  );
}

function CollectionsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden border rounded-lg">
                <div className="h-64 w-full bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 w-3/4 mb-2 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CollectionsPageSkeleton />}>
      <CollectionsPageContent />
    </Suspense>
  );
}