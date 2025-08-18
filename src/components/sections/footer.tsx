import Image from 'next/image';
import Link from 'next/link';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Catalog', href: '/collections/all' },
  { name: 'Contact', href: '/pages/contact' },
  { name: 'Privacypolicy', href: '/policies/privacy-policy' },
  { name: 'RefundPolicy', href: '/policies/refund-policy' },
  { name: 'Contact', href: '/policies/contact-information' },
];

const policyLinks = [
  { name: 'Privacy policy', href: '/policies/privacy-policy' },
  { name: 'Refund policy', href: '/policies/refund-policy' },
  { name: 'Terms of service', href: '/policies/terms-of-service' },
  { name: 'Contact information', href: '/policies/contact-information' },
];

const Footer = () => {
  return (
    <>
      <footer className="bg-dark-gray text-white font-primary">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {/* Left Section: Logo & Navigation */}
            <div className="md:col-span-2">
              <div className="mb-8">
                <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/IMG_2338-1.png?"
                    alt="TrendifyMart Logo"
                    width={140}
                    height={58}
                    className="h-auto"
                  />
                </Link>
              </div>
              <nav aria-label="Footer navigation">
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {navLinks.map((link, index) => (
                    <li key={`${link.name}-${index}`}>
                      <Link href={link.href} className="hover:text-[#ff6b35] transition-colors duration-300 text-sm font-medium">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            
            {/* Right Section: Contact Info */}
            <div className="md:col-span-1">
              <h3 className="font-heading font-bold text-base mb-4 uppercase">Reach us at</h3>
              <address className="text-sm space-y-2 text-gray-300 not-italic">
                <p><strong>Address:</strong> PLOT NO 69/70 JAI BHAWANI COLONY, KHATIPURA JAIPUR, 302012</p>
                <p><strong>Contact:</strong> +91 9079830255</p>
                <p><strong>Country Of Origin:</strong> India</p>
                <p><strong>GSTIN:</strong> 08AAXFT8362K1Z4</p>
              </address>
            </div>
          </div>

          {/* Bottom section: Copyright & Policies */}
          <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 space-y-4 md:space-y-0">
            <p className="text-center md:text-left">© 2025, TRENDIFY MART Powered by Firebase</p>
            <nav aria-label="Footer policies">
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {policyLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-[#ff6b35] transition-colors duration-300 font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </footer>
      
      {/* Payment Icons Section */}
      <div className="bg-light-gray py-6">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex justify-center items-center flex-wrap gap-3" role="list" aria-label="Accepted payment methods">
            <li className="h-10 w-16 bg-[#5a31f4] rounded-md shadow-sm" aria-label="Shop Pay"></li>
            <li className="h-10 w-16 bg-white rounded-md shadow-sm" aria-label="Google Pay"></li>
            <li className="h-10 w-16 bg-black rounded-md shadow-sm" aria-label="Apple Pay"></li>
            <li className="h-10 w-16 bg-white rounded-md shadow-sm" aria-label="Mastercard"></li>
            <li className="h-10 w-16 bg-white rounded-md shadow-sm" aria-label="Visa"></li>
            <li className="h-10 w-16 bg-white rounded-md shadow-sm" aria-label="PayPal"></li>
            <li className="h-10 w-16 bg-[#ffb3c7] rounded-md shadow-sm" aria-label="Klarna"></li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Footer;