import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-gray-50">
            <div className="container px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-blue-600">Proactiv Fitness</h3>
                        <p className="text-sm text-gray-600">
                            Leading sports and gymnastics programs for kids aged 3-14 years.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-gray-600 hover:text-blue-600">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-600 hover:text-blue-600">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-600 hover:text-blue-600">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-600 hover:text-blue-600">
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Programs */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Programs</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/programs/gymnastics" className="text-gray-600 hover:text-blue-600">
                                    Gymnastics Programs
                                </Link>
                            </li>
                            <li>
                                <Link href="/programs/camps" className="text-gray-600 hover:text-blue-600">
                                    Holiday Camps
                                </Link>
                            </li>
                            <li>
                                <Link href="/programs/multi-activity" className="text-gray-600 hover:text-blue-600">
                                    Multi-Activity
                                </Link>
                            </li>
                            <li>
                                <Link href="/programs/parties" className="text-gray-600 hover:text-blue-600">
                                    Birthday Parties
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-gray-600 hover:text-blue-600">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/locations" className="text-gray-600 hover:text-blue-600">
                                    Locations
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-gray-600 hover:text-blue-600">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 hover:text-blue-600">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="text-gray-600 hover:text-blue-600">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-600 hover:text-blue-600">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund" className="text-gray-600 hover:text-blue-600">
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/safety" className="text-gray-600 hover:text-blue-600">
                                    Safety Guidelines
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
                    <p>&copy; {new Date().getFullYear()} Proactiv Fitness. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
