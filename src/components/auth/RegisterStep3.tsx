'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Building2, Map, Hash, Globe } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Country, State, City } from 'country-state-city';

import {
    registerStep3Schema,
    type RegisterStep3Data,
} from '@/lib/validations/auth';
import {
    validateAddress,
    validateZipCode,
    filterZipCodeInput,
    filterStreetInput,
    FORMAT_HINTS,
} from '@/utils/validation';
import { SOVEREIGN_COUNTRY_ISOS } from '@/utils/sovereignCountries';
import { FormFieldHint } from '@/components/ui/FormFieldHint';

interface RegisterStep3Props {
    onComplete: (data: RegisterStep3Data) => void;
    onBack: () => void;
    initialData?: Partial<RegisterStep3Data>;
}

export function RegisterStep3({
    onComplete,
    onBack,
    initialData,
}: RegisterStep3Props) {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep3Data>({
        resolver: zodResolver(registerStep3Schema),
        defaultValues: initialData,
    });

    const selectedCountry = watch('address.country') || '';
    const selectedState = watch('address.state') || '';

    // Country list — 195 sovereign countries (193 UN members + 2 observers)
    const countries = useMemo(
        () => Country.getAllCountries().filter((c) => SOVEREIGN_COUNTRY_ISOS.has(c.isoCode)),
        []
    );

    // Find ISO codes for the selected country/state names so we can look up states/cities
    const countryIso = useMemo(
        () => countries.find((c) => c.name === selectedCountry)?.isoCode,
        [countries, selectedCountry]
    );
    const states = useMemo(
        () => (countryIso ? State.getStatesOfCountry(countryIso) : []),
        [countryIso]
    );
    const stateIso = useMemo(
        () => states.find((s) => s.name === selectedState)?.isoCode,
        [states, selectedState]
    );
    const cities = useMemo(
        () => (countryIso && stateIso ? City.getCitiesOfState(countryIso, stateIso) : []),
        [countryIso, stateIso]
    );

    // When country changes and the previously-selected state isn't valid for the new
    // country, clear state + city. Same for state → city.
    useEffect(() => {
        if (selectedState && !states.some((s) => s.name === selectedState)) {
            setValue('address.state', '');
            setValue('address.city', '');
        }
    }, [countryIso]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const currentCity = watch('address.city');
        if (currentCity && cities.length > 0 && !cities.some((c) => c.name === currentCity)) {
            setValue('address.city', '');
        }
    }, [stateIso]); // eslint-disable-line react-hooks/exhaustive-deps

    const validateField = (field: string, value: string) => {
        let error: string | null = null;
        switch (field) {
            case 'street':
                error = validateAddress(value, 'Street address');
                break;
            case 'country':
                if (!value) error = 'Please select a country';
                else if (!countries.some((c) => c.name === value)) error = 'Please pick a country from the list';
                break;
            case 'state':
                if (!selectedCountry) error = 'Please select a country first';
                else if (states.length > 0 && !value) error = 'Please select a state';
                else if (states.length > 0 && !states.some((s) => s.name === value)) error = 'Please pick a state from the list';
                break;
            case 'city':
                if (!selectedState && cities.length === 0) error = 'Please select a state first';
                else if (cities.length > 0 && !value) error = 'Please select a city';
                else if (cities.length > 0 && !cities.some((c) => c.name === value)) error = 'Please pick a city from the list';
                else if (cities.length === 0 && !value) error = 'City is required';
                break;
            case 'zipCode':
                error = validateZipCode(value);
                break;
        }
        setFieldErrors((prev) => {
            const next = { ...prev };
            if (error) {
                next[field] = error;
            } else {
                delete next[field];
            }
            return next;
        });
    };

    const handleFormSubmit = (data: RegisterStep3Data) => {
        const errs: Record<string, string> = {};
        const streetErr = validateAddress(data.address.street, 'Street address');
        if (streetErr) errs.street = streetErr;

        if (!data.address.country) errs.country = 'Please select a country';
        else if (!countries.some((c) => c.name === data.address.country)) errs.country = 'Please pick a country from the list';

        if (states.length > 0) {
            if (!data.address.state) errs.state = 'Please select a state';
            else if (!states.some((s) => s.name === data.address.state)) errs.state = 'Please pick a state from the list';
        } else if (!data.address.state) {
            // No states for this country — accept whatever they typed (or leave blank)
        }

        if (cities.length > 0) {
            if (!data.address.city) errs.city = 'Please select a city';
            else if (!cities.some((c) => c.name === data.address.city)) errs.city = 'Please pick a city from the list';
        } else if (!data.address.city) {
            errs.city = 'City is required';
        }

        const zipErr = validateZipCode(data.address.zipCode);
        if (zipErr) errs.zipCode = zipErr;

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }
        onComplete(data);
    };

    return (
        <form id="form-components-auth-RegisterStep3" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
            <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-gray-900">Address Details</h2>
                <p className="text-gray-600 mt-2">Where are you located?</p>
            </div>

            {/* Street Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        {...register('address.street', {
                            onChange: (e) => validateField('street', e.target.value),
                        })}
                        onKeyDown={filterStreetInput}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.address?.street || fieldErrors.street ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123 Main Street"
                    />
                </div>
                {errors.address?.street && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.address.street.message}
                    </p>
                )}
                <FormFieldHint hint={FORMAT_HINTS.address} error={fieldErrors.street} />
            </div>

            {/* Country (full row) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                </label>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Controller
                        control={control}
                        name="address.country"
                        render={({ field }) => (
                            <>
                                <input
                                    type="text"
                                    list="register-country-list"
                                    value={field.value || ''}
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                        validateField('country', e.target.value);
                                    }}
                                    autoComplete="off"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        errors.address?.country || fieldErrors.country ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Start typing — e.g. India"
                                />
                                <datalist id="register-country-list">
                                    {countries.map((c) => (
                                        <option key={c.isoCode} value={c.name} />
                                    ))}
                                </datalist>
                            </>
                        )}
                    />
                </div>
                {errors.address?.country && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.address.country.message}
                    </p>
                )}
                <FormFieldHint hint={`Select from the list of ${countries.length} countries`} error={fieldErrors.country} />
            </div>

            {/* State & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                    </label>
                    <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <Controller
                            control={control}
                            name="address.state"
                            render={({ field }) => (
                                <>
                                    <input
                                        type="text"
                                        list="register-state-list"
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            validateField('state', e.target.value);
                                        }}
                                        autoComplete="off"
                                        disabled={!countryIso}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
                                            errors.address?.state || fieldErrors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder={countryIso ? (states.length ? 'Start typing your state' : 'No states — type your state') : 'Pick a country first'}
                                    />
                                    <datalist id="register-state-list">
                                        {states.map((s) => (
                                            <option key={s.isoCode} value={s.name} />
                                        ))}
                                    </datalist>
                                </>
                            )}
                        />
                    </div>
                    {errors.address?.state && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.state.message}
                        </p>
                    )}
                    <FormFieldHint hint={countryIso && states.length > 0 ? `Select from ${states.length} states` : 'Select a country first'} error={fieldErrors.state} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <Controller
                            control={control}
                            name="address.city"
                            render={({ field }) => (
                                <>
                                    <input
                                        type="text"
                                        list="register-city-list"
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            validateField('city', e.target.value);
                                        }}
                                        autoComplete="off"
                                        disabled={!stateIso && cities.length === 0}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
                                            errors.address?.city || fieldErrors.city ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder={stateIso ? (cities.length ? 'Start typing your city' : 'No cities — type your city') : 'Pick a state first'}
                                    />
                                    <datalist id="register-city-list">
                                        {cities.map((c, i) => (
                                            <option key={`${c.name}-${i}`} value={c.name} />
                                        ))}
                                    </datalist>
                                </>
                            )}
                        />
                    </div>
                    {errors.address?.city && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.city.message}
                        </p>
                    )}
                    <FormFieldHint hint={stateIso && cities.length > 0 ? `Select from ${cities.length} cities` : 'Select a state first'} error={fieldErrors.city} />
                </div>
            </div>

            {/* Zip Code (full row) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                </label>
                <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        {...register('address.zipCode', {
                            onChange: (e) => validateField('zipCode', e.target.value),
                        })}
                        onKeyDown={filterZipCodeInput}
                        maxLength={10}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.address?.zipCode || fieldErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="10001"
                    />
                </div>
                {errors.address?.zipCode && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.address.zipCode.message}
                    </p>
                )}
                <FormFieldHint hint={FORMAT_HINTS.zipCode} error={fieldErrors.zipCode} />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <button id="auth-register-step3-btn-back"
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
                <button id="auth-register-step3-btn-continue"
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
