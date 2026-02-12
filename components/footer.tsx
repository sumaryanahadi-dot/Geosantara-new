import Link from "next/link";
import Image from "next/image";

const Footer = () => {
    return (
        <footer className="bg-[#133740]">
            <div className="max-w-screen-xl mx-auto px-4 w-full py-10 md:py-16">
                <div className="grid md:grid-cols-3 gap-7">
                    <div>
                        <Link href="/" className="mb-5 blok">
                            <Image src="/logo.png" width={472} height={351} alt="logo"/>
                        </Link>
                    </div>
                    <div>
                        <div className="flex gap-20">
                            <div className="flex-1 md:flex-none">
                                <h4 className="mb-8 text-xl font-semibold text-[#E0B554]">Links</h4>
                                <ul className="list-item space-y-5 text-gray-400">
                                    <li>
                                        <Link href="/">Home</Link>
                                    </li>
                                    <li>
                                        <Link href="/">About Us</Link>
                                    </li>
                                    <li>
                                        <Link href="/">Rooms</Link>
                                    </li>
                                    <li>
                                        <Link href="/">Contact Us</Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex-1 md:flex-none">
                                <h4 className="mb-8 text-xl font-semibold text-[#E0B554]">Ikuti Kami</h4>
                                <ul className="list-item space-y-5 text-gray-400">
                                    <li>
                                        <Link href="#">Legal</Link>
                                    </li>
                                    <li>
                                        <Link href="#">Term & Condition</Link>
                                    </li>
                                    <li>
                                        <Link href="#">Payment</Link>
                                    </li>
                                    <li>
                                        <Link href="#">Privacy Policy</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-8 text-xl font-semibold text-[#E0B554]">Newseletter</h4>
                        <p className="text-gray-400">
                            Jelajahi Dunia Temukan Diri
                        </p>
                        
                    </div>
                </div>
            </div>
            <div className="max-w-screen-xl mx-auto px-4 border-t border-gray-500 py-8 text-center text-base text-gray-500">
                &copy; Copyright-2025 | coder Media | All Right Reserved
            </div>
        </footer>
    );

};

export default Footer;