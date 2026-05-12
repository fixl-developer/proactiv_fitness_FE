/**
 * The 195 sovereign countries recognised in 2026 = 193 UN Member States + 2
 * UN Observer States (Holy See, State of Palestine).
 *
 * Used to filter the comprehensive `country-state-city` dataset (which includes
 * dependencies and territories like Bermuda or American Samoa) down to the
 * conventional "list of countries" expected on registration forms.
 *
 * Source: UN Member States register + UN Observer States, ISO 3166-1 alpha-2.
 */
export const SOVEREIGN_COUNTRY_ISOS: ReadonlySet<string> = new Set([
    // UN Member States (193)
    'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ',
    'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI',
    'CV', 'KH', 'CM', 'CA', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ',
    'DK', 'DJ', 'DM', 'DO',
    'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET',
    'FJ', 'FI', 'FR',
    'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY',
    'HT', 'HN', 'HU',
    'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT',
    'JM', 'JP', 'JO',
    'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG',
    'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU',
    'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM',
    'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO',
    'OM',
    'PK', 'PW', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT',
    'QA',
    'RO', 'RU', 'RW',
    'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'SS', 'ES', 'LK', 'SD', 'SR', 'SE', 'CH', 'SY',
    'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'TV',
    'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ',
    'VU', 'VE', 'VN',
    'YE',
    'ZM', 'ZW',
    // UN Observer States (2)
    'VA', // Holy See / Vatican City
    'PS', // State of Palestine
]);
