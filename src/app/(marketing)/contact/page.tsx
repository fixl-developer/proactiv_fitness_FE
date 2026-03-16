'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsLoading(true);

        try {
            // TODO: Integrate with backend API
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.success('Message sent successfully! We will get back to you soon.');
            reset();
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Contact Us</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and
                        we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Phone */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                                <p className="text-gray-600 mb-2">Give us a call</p>
                                <a
                                    href="tel:+1234567890"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    +1 (234) 567-890
                                </a>
                            </div>

                            {/* Email */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                                <p className="text-gray-600 mb-2">Send us an email</p>
                                <a
                                    href="mailto:info@proactivfitness.com"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    info@proactivfitness.com
                                </a>
                            </div>

                            {/* Address */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Address
                                </h3>
                                <p className="text-gray-600 mb-2">Visit our main office</p>
                                <p className="text-gray-700">
                                    123 Fitness Street
                                    <br />
                                    New York, NY 10001
                                </p>
                            </div>

                            {/* Hours */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Hours</h3>
                                <p className="text-gray-600 mb-2">We're open</p>
                                <div className="text-gray-700 space-y-1">
                                    <p>Mon-Fri: 9:00 AM - 8:00 PM</p>
                                    <p>Sat-Sun: 9:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    Send Us a Message
                                </h2>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('name')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email & Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                {...register('email')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                {...register('phone')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="+1234567890"
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            {...register('subject')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="How can we help you?"
                                        />
                                        {errors.subject && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.subject.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            {...register('message')}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                        {errors.message && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.message.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
