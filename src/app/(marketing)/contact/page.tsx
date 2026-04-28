'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { filterNameInput, FORMAT_HINTS, PATTERNS } from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { findByDialCode, validatePhoneForCountry } from '@/utils/countryCodes';
import { useCMSData } from '@/hooks/useCMSData';
import { CMSService, ContactInfoData } from '@/services/cmsService';

const contactSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(60, 'Name must be at most 60 characters')
        .regex(PATTERNS.nameOnly, 'Only letters, spaces, hyphens and apostrophes allowed'),
    email: z
        .string()
        .min(1, 'Email is required')
        .regex(PATTERNS.emailFormat, 'Please enter a valid email (e.g. user@example.com)'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .superRefine((val, ctx) => {
            const country = findByDialCode(val);
            if (!country) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select a valid country code',
                });
                return;
            }
            const national = val.slice(country.dialCode.length).replace(/\D/g, '');
            const err = validatePhoneForCountry(national, country);
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
        }),
    subject: z
        .string()
        .min(5, 'Subject must be at least 5 characters')
        .max(120, 'Subject must be at most 120 characters')
        .regex(PATTERNS.alphanumeric, 'Only letters, numbers and spaces allowed'),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(2000, 'Message must be 2000 characters or fewer'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const staticContactInfo: ContactInfoData = {
    phone: '+1 (234) 567-890',
    email: 'info@proactivfitness.com',
    address: '123 Fitness Street\nNew York, NY 10001',
    hours: 'Mon-Fri: 9:00 AM - 8:00 PM\nSat-Sun: 9:00 AM - 6:00 PM',
    whatsapp: '',
    socialLinks: [],
    mapUrl: '',
};

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);

    const { data: dynamicContactInfo } = useCMSData<ContactInfoData | null>(
        () => CMSService.getContactInfo(),
        null,
        []
    );

    const contactInfo = dynamicContactInfo || staticContactInfo;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        },
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsLoading(true);

        try {
            // TODO: Integrate with backend API
            console.log('Form data:', data);
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
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl"
                        />
                        <motion.div
                            animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                        />
                    </div>

                    <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-base md:text-lg leading-relaxed"
                        >
                            Have questions? We'd love to hear from you. Send us a message and
                            we'll respond as soon as possible.
                        </motion.p>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Contact Info */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Phone */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: 'spring' }}
                                        viewport={{ once: true }}
                                        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                                    >
                                        <Phone className="w-7 h-7 text-white" />
                                    </motion.div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Phone</h3>
                                    <p className="text-gray-600 text-sm mb-2">Give us a call</p>
                                    <a id="marketing-contact-link-tel1234567890"
                                        href={`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`}
                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                    >
                                        {contactInfo.phone}
                                    </a>
                                </motion.div>

                                {/* Email */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                        viewport={{ once: true }}
                                        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                                    >
                                        <Mail className="w-7 h-7 text-white" />
                                    </motion.div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
                                    <p className="text-gray-600 text-sm mb-2">Send us an email</p>
                                    <a id="marketing-contact-link-mailtoinfoproactivfitnesscom"
                                        href={`mailto:${contactInfo.email}`}
                                        className="text-purple-600 font-semibold hover:text-purple-700 transition-colors break-all"
                                    >
                                        {contactInfo.email}
                                    </a>
                                </motion.div>

                                {/* Address */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: 'spring' }}
                                        viewport={{ once: true }}
                                        className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                                    >
                                        <MapPin className="w-7 h-7 text-white" />
                                    </motion.div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        Address
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">Visit our main office</p>
                                    <p className="text-gray-700 text-sm">
                                        {contactInfo.address.split('\n').map((line, i, arr) => (
                                            <span key={i}>
                                                {line}
                                                {i < arr.length - 1 && <br />}
                                            </span>
                                        ))}
                                    </p>
                                </motion.div>

                                {/* Hours */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                        viewport={{ once: true }}
                                        className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                                    >
                                        <Clock className="w-7 h-7 text-white" />
                                    </motion.div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Hours</h3>
                                    <p className="text-gray-600 text-sm mb-2">We're open</p>
                                    <div className="text-gray-700 text-sm space-y-1">
                                        {contactInfo.hours.split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-8 shadow-lg border border-blue-100"
                                >
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                        Send Us a Message
                                    </h2>

                                    <form id="form-(marketing)-contact" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        {/* Name */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                {...register('name')}
                                                onKeyDown={filterNameInput}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="John Doe"
                                            />
                                            <FormFieldHint hint={FORMAT_HINTS.name} error={errors.name?.message} />
                                        </motion.div>

                                        {/* Email & Phone */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                viewport={{ once: true }}
                                            >
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register('email')}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="john@example.com"
                                                />
                                                <FormFieldHint hint={FORMAT_HINTS.email} error={errors.email?.message} />
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                viewport={{ once: true }}
                                            >
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number
                                                </label>
                                                <Controller
                                                    control={control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <PhoneInput
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            defaultCountry="HK"
                                                            error={errors.phone?.message}
                                                            placeholder="Enter phone number"
                                                        />
                                                    )}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Subject */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            viewport={{ once: true }}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                {...register('subject')}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="How can we help you?"
                                            />
                                            <FormFieldHint hint={FORMAT_HINTS.subject} error={errors.subject?.message} />
                                        </motion.div>

                                        {/* Message */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            viewport={{ once: true }}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                {...register('message')}
                                                rows={5}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Tell us more about your inquiry..."
                                            />
                                            <FormFieldHint hint={FORMAT_HINTS.message} error={errors.message?.message} />
                                        </motion.div>

                                        {/* Submit Button */}
                                        <motion.button
                                            id="contact-submit-btn"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            viewport={{ once: true }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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
                                        </motion.button>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
        </main>
    );
}
