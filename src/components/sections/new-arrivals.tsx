import Image from 'next/image';
import Link from 'next/link';

type Product = {
  name: string;
  image1: string;
  image2: string;
  price: string;
  oldPrice: string | null;
  isSale: boolean;
  href: string;
};

const productsData: Product[] = [
  {
    name: 'White - Tipping Polo',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/9_1_9c506c3c-578f-44ce-bd09-c42f6524bacc-12.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/9_7_0539efce-2e9c-4e84-a394-ef04bb015711-13.jpg?',
    price: 'Rs. 799.00',
    oldPrice: null,
    isSale: false,
    href: '/products/white-tipping-polo',
  },
  {
    name: 'Umber - Tipping Polo',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/Screenshot_21-7-2025_114057-14.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/Screenshot_21-7-2025_114042_0973eeaa-1dd7-4ee2-90df-e41494a8b67e-15.jpg?',
    price: 'Rs. 799.00',
    oldPrice: 'Rs. 1,399.00',
    isSale: true,
    href: '/products/umber-tipping-polo',
  },
  {
    name: 'Black - Tipping Polo',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0479-16.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0480-17.jpg?',
    price: 'Rs. 799.00',
    oldPrice: 'Rs. 1,499.00',
    isSale: true,
    href: '/products/black-tipping-polo',
  },
  {
    name: 'Olive Green - Tipping Polo',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0471copy-18.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_0473copy-19.jpg?',
    price: 'Rs. 799.00',
    oldPrice: null,
    isSale: false,
    href: '/products/olive-green-tipping-polo',
  },
];

const NewArrivals = () => {
    return (
        <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-heading italic font-bold text-3xl text-center uppercase mb-12 tracking-wider">
                    New Arrivals
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {productsData.map((product) => (
                        <div key={product.name} className="flex flex-col items-center">
                            <div className="relative w-full aspect-[286/381] group overflow-hidden border border-gray-200 rounded-xl">
                                {product.isSale && (
                                    <div className="absolute top-4 left-4 z-10 bg-[#4285f4] text-white text-[10px] font-bold px-3 py-1.5 rounded">
                                        Sale
                                    </div>
                                )}
                                <Link href={product.href} className="block w-full h-full">
                                    <Image
                                        src={product.image1}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover object-center transition-opacity duration-300 ease-in-out group-hover:opacity-0"
                                    />
                                    <Image
                                        src={product.image2}
                                        alt={`${product.name} hover view`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover object-center opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                            <div className="mt-4 text-center">
                                <h3 className="text-base text-black font-medium">
                                    <Link href={product.href}>{product.name}</Link>
                                </h3>
                                <div className="mt-1 flex justify-center items-baseline gap-2">
                                    {product.oldPrice && (
                                        <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                                    )}
                                    <span className="text-base font-normal text-black">{product.price}</span>
                                </div>
                                <Link
                                    href={product.href}
                                    className="mt-4 inline-block border border-black text-black text-sm font-medium rounded-full px-6 py-3 hover:bg-black hover:text-white transition-colors duration-300"
                                >
                                    Choose options
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;