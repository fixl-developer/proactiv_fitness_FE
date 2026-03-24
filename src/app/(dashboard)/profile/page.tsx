'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Lock,
    Save,
    Camera,
} from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    profileUpdateSchema,
    changePasswordSchema,
    type ProfileUpdateData,
    type ChangePasswordData,
} from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

function ProfilePageContent() {
    const { user, setUser } = useAuthStore();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors },
    } = useForm<ProfileUpdateData>({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth || '',
            gender: user?.gender || undefined,
            address: user?.address || undefined,
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
        reset: resetPassword,
    } = useForm<ChangePasswordData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmitProfile = async (data: ProfileUpdateData) => {
        setIsLoadingProfile(true);

        try {
            const updatedUser = await authApi.updateProfile(data);
            setUser(updatedUser);
            setIsEditingProfile(false);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const onSubmitPassword = async (data: ChangePasswordData) => {
        setIsLoadingPassword(true);

        try {
            await authApi.changePassword(data.currentPassword, data.newPassword);
            resetPassword();
            setIsEditingPassword(false);
            toast.success('Password changed successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setIsLoadingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

            {/* Profile Picture */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                            {user.firstName[0]}
                            {user.lastName[0]}
                        </div>
                        <button id="dashboard-profile-change-photo-btn" className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-gray-600">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                            {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Personal Information
                    </h3>
                    <button id="dashboard-profile-edit-toggle-btn"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-primary hover:underline"
                    >
                        {isEditingProfile ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                <form id="dashboard-profile-info-form" onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                {...registerProfile('firstName')}
                                disabled={!isEditingProfile}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                            />
                            {profileErrors.firstName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {profileErrors.firstName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                {...registerProfile('lastName')}
                                disabled={!isEditingProfile}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                            />
                            {profileErrors.lastName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {profileErrors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                {...registerProfile('phone')}
                                disabled={!isEditingProfile}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                {...registerProfile('dateOfBirth')}
                                disabled={!isEditingProfile}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                            />
                        </div>
                    </div>

                    {isEditingProfile && (
                        <button id="dashboard-profile-save-btn"
                            type="submit"
                            disabled={isLoadingProfile}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoadingProfile ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    )}
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Change Password
                    </h3>
                    <button id="dashboard-profile-password-toggle-btn"
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                        className="text-primary hover:underline"
                    >
                        {isEditingPassword ? 'Cancel' : 'Change'}
                    </button>
                </div>

                {isEditingPassword && (
                    <form id="dashboard-profile-password-form"
                        onSubmit={handleSubmitPassword(onSubmitPassword)}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                {...registerPassword('currentPassword')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="••••••••"
                            />
                            {passwordErrors.currentPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {passwordErrors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                {...registerPassword('newPassword')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="••••••••"
                            />
                            {passwordErrors.newPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {passwordErrors.newPassword.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                {...registerPassword('confirmPassword')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="••••••••"
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {passwordErrors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button id="dashboard-profile-change-password-btn"
                            type="submit"
                            disabled={isLoadingPassword}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoadingPassword ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Changing...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Change Password
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfilePageContent />
        </ProtectedRoute>
    );
}
