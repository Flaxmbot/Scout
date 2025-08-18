import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const WaveDivider = () => (
  <div className="bg-white">
    <svg
      width="100%"
      height="96"
      viewBox="0 0 1920 96"
      fill="#000000"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 96V0C192.187 0 326.666 48 576 48C825.334 48 889.319 0 1152 0C1414.68 0 1600.33 48 1920 48V96H0Z" />
    </svg>
  </div>
);

const products = [
  {
    id: 1,
    name: "Executive Pocket Polo",
    price: "Rs. 799.00",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/8_1-20.jpg?",
    hoverImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/8_6-21.jpg?",
    alt: "Executive Pocket Polo in white",
    href: "/products/executive-pocket-polo-white",
  },
  {
    id: 2,
    name: "Executive Pocket Polo",
    price: "Rs. 799.00",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/3_1-22.jpg?",
    hoverImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/3_8-23.jpg?",
    alt: "Executive Pocket Polo in blue",
    href: "/products/executive-pocket-polo-blue",
  },
  {
    id: 3,
    name: "Executive Pocket Polo",
    price: "Rs. 799.00",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0498copy-24.jpg?",
    hoverImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0499copy-25.jpg?",
    alt: "Executive Pocket Polo in black",
    href: "/products/executive-pocket-polo-black",
  },
];

const SmartTechPolos = () => {
  return (
    <div className="bg-white text-black">
      <WaveDivider />
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl font-bold italic text-center mb-12 uppercase text-black">
            SMART TECH POLOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((product) => (
              <div key={product.id} className="text-center group">
                <Link href={product.href} className="block group">
                  <div className="relative border border-[#E5E5E5] rounded-2xl overflow-hidden aspect-[0.75] mb-4">
                    <Image
                      src={product.image}
                      alt={product.alt}
                      width={533}
                      height={711}
                      className="w-full h-full object-cover transition-opacity duration-300 ease-in-out group-hover:opacity-0"
                    />
                    <Image
                      src={product.hoverImage}
                      alt={product.alt}
                      fill
                      className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
                    />
                  </div>
                  <h3 className="text-base font-medium text-black">
                    {product.name}
                  </h3>
                  <p className="text-base font-medium text-black mt-1 mb-4">
                    {product.price}
                  </p>
                </Link>
                <Button asChild variant="outline" className="border-black text-black hover:bg-black hover:text-white rounded-full px-8 py-2 transition-all duration-300 hover:scale-105">
                  <Link href={product.href}>
                    Choose options
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SmartTechPolos;