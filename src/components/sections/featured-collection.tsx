import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  href: string;
  imageSrc: string;
  price: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Black Round Neck T-shirt",
    href: "/products/black-round-neck-t-shirt",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0452copy-26.jpg?",
    price: "Rs. 599.00",
  },
  {
    id: 2,
    name: "White Round Neck T-shirts",
    href: "/products/white-round-neck-t-shirts",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0461copy-27.jpg?",
    price: "Rs. 599.00",
  },
  {
    id: 3,
    name: "Maroon Round Neck T-shirt",
    href: "/products/maroon-round-neck-t-shirt",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0440copy2_c27fed6d-588d-44bd-bf79-88882c502aab-28.jpg?",
    price: "Rs. 599.00",
  },
];

const FeaturedCollection = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-4xl font-heading font-bold text-center text-slate-800">
          Featured collection
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={product.href} className="group block">
              <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="relative aspect-[3/4] bg-[#F4F1ED]">
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-base font-medium text-gray-800">{product.name}</h3>
                <p className="mt-1 text-base font-medium text-gray-900">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild className="bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
            <Link href="/collections">
              View All Collections
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;