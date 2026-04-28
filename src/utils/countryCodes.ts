/**
 * ISO country list with dial codes, flag emojis and expected national-number
 * digit lengths. `lengths` lists every valid number of *national* digits
 * (excluding the country/dial code) for that country. Multiple values mean the
 * country supports more than one valid length (e.g. UK fixed/mobile).
 *
 * Used by the shared PhoneInput component for country-aware validation.
 */

export interface CountryCode {
  /** ISO 3166-1 alpha-2 code */
  iso2: string
  /** Country name (English) */
  name: string
  /** International dial code, e.g. "+91" */
  dialCode: string
  /** Flag emoji */
  flag: string
  /** Allowed national-number digit lengths */
  lengths: number[]
}

export const COUNTRY_CODES: CountryCode[] = [
  { iso2: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', lengths: [9] },
  { iso2: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱', lengths: [9] },
  { iso2: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', lengths: [9] },
  { iso2: 'AS', name: 'American Samoa', dialCode: '+1684', flag: '🇦🇸', lengths: [10] },
  { iso2: 'AD', name: 'Andorra', dialCode: '+376', flag: '🇦🇩', lengths: [6, 8, 9] },
  { iso2: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴', lengths: [9] },
  { iso2: 'AI', name: 'Anguilla', dialCode: '+1264', flag: '🇦🇮', lengths: [10] },
  { iso2: 'AG', name: 'Antigua and Barbuda', dialCode: '+1268', flag: '🇦🇬', lengths: [10] },
  { iso2: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', lengths: [10, 11] },
  { iso2: 'AM', name: 'Armenia', dialCode: '+374', flag: '🇦🇲', lengths: [8] },
  { iso2: 'AW', name: 'Aruba', dialCode: '+297', flag: '🇦🇼', lengths: [7] },
  { iso2: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', lengths: [9] },
  { iso2: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', lengths: [10, 11, 12, 13] },
  { iso2: 'AZ', name: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿', lengths: [9] },
  { iso2: 'BS', name: 'Bahamas', dialCode: '+1242', flag: '🇧🇸', lengths: [10] },
  { iso2: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', lengths: [8] },
  { iso2: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', lengths: [10] },
  { iso2: 'BB', name: 'Barbados', dialCode: '+1246', flag: '🇧🇧', lengths: [10] },
  { iso2: 'BY', name: 'Belarus', dialCode: '+375', flag: '🇧🇾', lengths: [9] },
  { iso2: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', lengths: [9] },
  { iso2: 'BZ', name: 'Belize', dialCode: '+501', flag: '🇧🇿', lengths: [7] },
  { iso2: 'BJ', name: 'Benin', dialCode: '+229', flag: '🇧🇯', lengths: [8] },
  { iso2: 'BM', name: 'Bermuda', dialCode: '+1441', flag: '🇧🇲', lengths: [10] },
  { iso2: 'BT', name: 'Bhutan', dialCode: '+975', flag: '🇧🇹', lengths: [7, 8] },
  { iso2: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', lengths: [8] },
  { iso2: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387', flag: '🇧🇦', lengths: [8] },
  { iso2: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼', lengths: [7, 8] },
  { iso2: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', lengths: [10, 11] },
  { iso2: 'IO', name: 'British Indian Ocean Territory', dialCode: '+246', flag: '🇮🇴', lengths: [7] },
  { iso2: 'VG', name: 'British Virgin Islands', dialCode: '+1284', flag: '🇻🇬', lengths: [10] },
  { iso2: 'BN', name: 'Brunei', dialCode: '+673', flag: '🇧🇳', lengths: [7] },
  { iso2: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', lengths: [8, 9] },
  { iso2: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', lengths: [8] },
  { iso2: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮', lengths: [8] },
  { iso2: 'KH', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭', lengths: [8, 9] },
  { iso2: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲', lengths: [8, 9] },
  { iso2: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', lengths: [10] },
  { iso2: 'CV', name: 'Cape Verde', dialCode: '+238', flag: '🇨🇻', lengths: [7] },
  { iso2: 'KY', name: 'Cayman Islands', dialCode: '+1345', flag: '🇰🇾', lengths: [10] },
  { iso2: 'CF', name: 'Central African Republic', dialCode: '+236', flag: '🇨🇫', lengths: [8] },
  { iso2: 'TD', name: 'Chad', dialCode: '+235', flag: '🇹🇩', lengths: [8] },
  { iso2: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', lengths: [9] },
  { iso2: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', lengths: [11] },
  { iso2: 'CX', name: 'Christmas Island', dialCode: '+61', flag: '🇨🇽', lengths: [9] },
  { iso2: 'CC', name: 'Cocos Islands', dialCode: '+61', flag: '🇨🇨', lengths: [9] },
  { iso2: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', lengths: [10] },
  { iso2: 'KM', name: 'Comoros', dialCode: '+269', flag: '🇰🇲', lengths: [7] },
  { iso2: 'CK', name: 'Cook Islands', dialCode: '+682', flag: '🇨🇰', lengths: [5] },
  { iso2: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', lengths: [8] },
  { iso2: 'HR', name: 'Croatia', dialCode: '+385', flag: '🇭🇷', lengths: [8, 9] },
  { iso2: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺', lengths: [8] },
  { iso2: 'CW', name: 'Curacao', dialCode: '+599', flag: '🇨🇼', lengths: [7, 8] },
  { iso2: 'CY', name: 'Cyprus', dialCode: '+357', flag: '🇨🇾', lengths: [8] },
  { iso2: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', lengths: [9] },
  { iso2: 'CD', name: 'Democratic Republic of the Congo', dialCode: '+243', flag: '🇨🇩', lengths: [9] },
  { iso2: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', lengths: [8] },
  { iso2: 'DJ', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯', lengths: [8] },
  { iso2: 'DM', name: 'Dominica', dialCode: '+1767', flag: '🇩🇲', lengths: [10] },
  { iso2: 'DO', name: 'Dominican Republic', dialCode: '+1', flag: '🇩🇴', lengths: [10] },
  { iso2: 'TL', name: 'East Timor', dialCode: '+670', flag: '🇹🇱', lengths: [7] },
  { iso2: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', lengths: [8, 9] },
  { iso2: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', lengths: [10] },
  { iso2: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', lengths: [8] },
  { iso2: 'GQ', name: 'Equatorial Guinea', dialCode: '+240', flag: '🇬🇶', lengths: [9] },
  { iso2: 'ER', name: 'Eritrea', dialCode: '+291', flag: '🇪🇷', lengths: [7] },
  { iso2: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪', lengths: [7, 8] },
  { iso2: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹', lengths: [9] },
  { iso2: 'FK', name: 'Falkland Islands', dialCode: '+500', flag: '🇫🇰', lengths: [5] },
  { iso2: 'FO', name: 'Faroe Islands', dialCode: '+298', flag: '🇫🇴', lengths: [6] },
  { iso2: 'FJ', name: 'Fiji', dialCode: '+679', flag: '🇫🇯', lengths: [7] },
  { iso2: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', lengths: [9, 10] },
  { iso2: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', lengths: [9] },
  { iso2: 'PF', name: 'French Polynesia', dialCode: '+689', flag: '🇵🇫', lengths: [8] },
  { iso2: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', lengths: [7, 8] },
  { iso2: 'GM', name: 'Gambia', dialCode: '+220', flag: '🇬🇲', lengths: [7] },
  { iso2: 'GE', name: 'Georgia', dialCode: '+995', flag: '🇬🇪', lengths: [9] },
  { iso2: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', lengths: [10, 11] },
  { iso2: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', lengths: [9] },
  { iso2: 'GI', name: 'Gibraltar', dialCode: '+350', flag: '🇬🇮', lengths: [8] },
  { iso2: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', lengths: [10] },
  { iso2: 'GL', name: 'Greenland', dialCode: '+299', flag: '🇬🇱', lengths: [6] },
  { iso2: 'GD', name: 'Grenada', dialCode: '+1473', flag: '🇬🇩', lengths: [10] },
  { iso2: 'GU', name: 'Guam', dialCode: '+1671', flag: '🇬🇺', lengths: [10] },
  { iso2: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', lengths: [8] },
  { iso2: 'GG', name: 'Guernsey', dialCode: '+44', flag: '🇬🇬', lengths: [10] },
  { iso2: 'GN', name: 'Guinea', dialCode: '+224', flag: '🇬🇳', lengths: [8, 9] },
  { iso2: 'GW', name: 'Guinea-Bissau', dialCode: '+245', flag: '🇬🇼', lengths: [7] },
  { iso2: 'GY', name: 'Guyana', dialCode: '+592', flag: '🇬🇾', lengths: [7] },
  { iso2: 'HT', name: 'Haiti', dialCode: '+509', flag: '🇭🇹', lengths: [8] },
  { iso2: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', lengths: [8] },
  { iso2: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', lengths: [8] },
  { iso2: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺', lengths: [8, 9] },
  { iso2: 'IS', name: 'Iceland', dialCode: '+354', flag: '🇮🇸', lengths: [7, 9] },
  { iso2: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', lengths: [10] },
  { iso2: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', lengths: [9, 10, 11, 12] },
  { iso2: 'IR', name: 'Iran', dialCode: '+98', flag: '🇮🇷', lengths: [10] },
  { iso2: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶', lengths: [10] },
  { iso2: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', lengths: [9] },
  { iso2: 'IM', name: 'Isle of Man', dialCode: '+44', flag: '🇮🇲', lengths: [10] },
  { iso2: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', lengths: [9] },
  { iso2: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', lengths: [9, 10, 11] },
  { iso2: 'CI', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮', lengths: [10] },
  { iso2: 'JM', name: 'Jamaica', dialCode: '+1876', flag: '🇯🇲', lengths: [10] },
  { iso2: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', lengths: [10, 11] },
  { iso2: 'JE', name: 'Jersey', dialCode: '+44', flag: '🇯🇪', lengths: [10] },
  { iso2: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', lengths: [9] },
  { iso2: 'KZ', name: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿', lengths: [10] },
  { iso2: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', lengths: [9, 10] },
  { iso2: 'KI', name: 'Kiribati', dialCode: '+686', flag: '🇰🇮', lengths: [5, 8] },
  { iso2: 'XK', name: 'Kosovo', dialCode: '+383', flag: '🇽🇰', lengths: [8, 9] },
  { iso2: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', lengths: [8] },
  { iso2: 'KG', name: 'Kyrgyzstan', dialCode: '+996', flag: '🇰🇬', lengths: [9] },
  { iso2: 'LA', name: 'Laos', dialCode: '+856', flag: '🇱🇦', lengths: [9, 10] },
  { iso2: 'LV', name: 'Latvia', dialCode: '+371', flag: '🇱🇻', lengths: [8] },
  { iso2: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', lengths: [7, 8] },
  { iso2: 'LS', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸', lengths: [8] },
  { iso2: 'LR', name: 'Liberia', dialCode: '+231', flag: '🇱🇷', lengths: [7, 8, 9] },
  { iso2: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾', lengths: [9, 10] },
  { iso2: 'LI', name: 'Liechtenstein', dialCode: '+423', flag: '🇱🇮', lengths: [7] },
  { iso2: 'LT', name: 'Lithuania', dialCode: '+370', flag: '🇱🇹', lengths: [8] },
  { iso2: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺', lengths: [9] },
  { iso2: 'MO', name: 'Macau', dialCode: '+853', flag: '🇲🇴', lengths: [8] },
  { iso2: 'MK', name: 'North Macedonia', dialCode: '+389', flag: '🇲🇰', lengths: [8] },
  { iso2: 'MG', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬', lengths: [9, 10] },
  { iso2: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼', lengths: [9] },
  { iso2: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', lengths: [9, 10] },
  { iso2: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻', lengths: [7] },
  { iso2: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', lengths: [8] },
  { iso2: 'MT', name: 'Malta', dialCode: '+356', flag: '🇲🇹', lengths: [8] },
  { iso2: 'MH', name: 'Marshall Islands', dialCode: '+692', flag: '🇲🇭', lengths: [7] },
  { iso2: 'MR', name: 'Mauritania', dialCode: '+222', flag: '🇲🇷', lengths: [8] },
  { iso2: 'MU', name: 'Mauritius', dialCode: '+230', flag: '🇲🇺', lengths: [7, 8] },
  { iso2: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', lengths: [10] },
  { iso2: 'FM', name: 'Micronesia', dialCode: '+691', flag: '🇫🇲', lengths: [7] },
  { iso2: 'MD', name: 'Moldova', dialCode: '+373', flag: '🇲🇩', lengths: [8] },
  { iso2: 'MC', name: 'Monaco', dialCode: '+377', flag: '🇲🇨', lengths: [8, 9] },
  { iso2: 'MN', name: 'Mongolia', dialCode: '+976', flag: '🇲🇳', lengths: [8] },
  { iso2: 'ME', name: 'Montenegro', dialCode: '+382', flag: '🇲🇪', lengths: [8, 9] },
  { iso2: 'MS', name: 'Montserrat', dialCode: '+1664', flag: '🇲🇸', lengths: [10] },
  { iso2: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', lengths: [9] },
  { iso2: 'MZ', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿', lengths: [9] },
  { iso2: 'MM', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲', lengths: [8, 9, 10] },
  { iso2: 'NA', name: 'Namibia', dialCode: '+264', flag: '🇳🇦', lengths: [9] },
  { iso2: 'NR', name: 'Nauru', dialCode: '+674', flag: '🇳🇷', lengths: [7] },
  { iso2: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', lengths: [10] },
  { iso2: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', lengths: [9] },
  { iso2: 'NC', name: 'New Caledonia', dialCode: '+687', flag: '🇳🇨', lengths: [6] },
  { iso2: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', lengths: [8, 9, 10] },
  { iso2: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', lengths: [8] },
  { iso2: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪', lengths: [8] },
  { iso2: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', lengths: [10] },
  { iso2: 'NU', name: 'Niue', dialCode: '+683', flag: '🇳🇺', lengths: [4] },
  { iso2: 'KP', name: 'North Korea', dialCode: '+850', flag: '🇰🇵', lengths: [8, 9, 10] },
  { iso2: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', lengths: [8] },
  { iso2: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', lengths: [8] },
  { iso2: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', lengths: [10] },
  { iso2: 'PW', name: 'Palau', dialCode: '+680', flag: '🇵🇼', lengths: [7] },
  { iso2: 'PS', name: 'Palestine', dialCode: '+970', flag: '🇵🇸', lengths: [9] },
  { iso2: 'PA', name: 'Panama', dialCode: '+507', flag: '🇵🇦', lengths: [7, 8] },
  { iso2: 'PG', name: 'Papua New Guinea', dialCode: '+675', flag: '🇵🇬', lengths: [7, 8] },
  { iso2: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', lengths: [9] },
  { iso2: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪', lengths: [9] },
  { iso2: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', lengths: [10] },
  { iso2: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', lengths: [9] },
  { iso2: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', lengths: [9] },
  { iso2: 'PR', name: 'Puerto Rico', dialCode: '+1', flag: '🇵🇷', lengths: [10] },
  { iso2: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', lengths: [8] },
  { iso2: 'CG', name: 'Republic of the Congo', dialCode: '+242', flag: '🇨🇬', lengths: [9] },
  { iso2: 'RE', name: 'Reunion', dialCode: '+262', flag: '🇷🇪', lengths: [9] },
  { iso2: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴', lengths: [9] },
  { iso2: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', lengths: [10] },
  { iso2: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼', lengths: [9] },
  { iso2: 'BL', name: 'Saint Barthelemy', dialCode: '+590', flag: '🇧🇱', lengths: [9] },
  { iso2: 'SH', name: 'Saint Helena', dialCode: '+290', flag: '🇸🇭', lengths: [4] },
  { iso2: 'KN', name: 'Saint Kitts and Nevis', dialCode: '+1869', flag: '🇰🇳', lengths: [10] },
  { iso2: 'LC', name: 'Saint Lucia', dialCode: '+1758', flag: '🇱🇨', lengths: [10] },
  { iso2: 'MF', name: 'Saint Martin', dialCode: '+590', flag: '🇲🇫', lengths: [9] },
  { iso2: 'PM', name: 'Saint Pierre and Miquelon', dialCode: '+508', flag: '🇵🇲', lengths: [6] },
  { iso2: 'VC', name: 'Saint Vincent and the Grenadines', dialCode: '+1784', flag: '🇻🇨', lengths: [10] },
  { iso2: 'WS', name: 'Samoa', dialCode: '+685', flag: '🇼🇸', lengths: [5, 6, 7] },
  { iso2: 'SM', name: 'San Marino', dialCode: '+378', flag: '🇸🇲', lengths: [10] },
  { iso2: 'ST', name: 'Sao Tome and Principe', dialCode: '+239', flag: '🇸🇹', lengths: [7] },
  { iso2: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', lengths: [9] },
  { iso2: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳', lengths: [9] },
  { iso2: 'RS', name: 'Serbia', dialCode: '+381', flag: '🇷🇸', lengths: [8, 9, 10] },
  { iso2: 'SC', name: 'Seychelles', dialCode: '+248', flag: '🇸🇨', lengths: [7] },
  { iso2: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱', lengths: [8] },
  { iso2: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', lengths: [8] },
  { iso2: 'SX', name: 'Sint Maarten', dialCode: '+1721', flag: '🇸🇽', lengths: [10] },
  { iso2: 'SK', name: 'Slovakia', dialCode: '+421', flag: '🇸🇰', lengths: [9] },
  { iso2: 'SI', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮', lengths: [8, 9] },
  { iso2: 'SB', name: 'Solomon Islands', dialCode: '+677', flag: '🇸🇧', lengths: [5, 7] },
  { iso2: 'SO', name: 'Somalia', dialCode: '+252', flag: '🇸🇴', lengths: [7, 8] },
  { iso2: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', lengths: [9] },
  { iso2: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', lengths: [9, 10] },
  { iso2: 'SS', name: 'South Sudan', dialCode: '+211', flag: '🇸🇸', lengths: [9] },
  { iso2: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', lengths: [9] },
  { iso2: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', lengths: [9] },
  { iso2: 'SD', name: 'Sudan', dialCode: '+249', flag: '🇸🇩', lengths: [9] },
  { iso2: 'SR', name: 'Suriname', dialCode: '+597', flag: '🇸🇷', lengths: [6, 7] },
  { iso2: 'SZ', name: 'Eswatini', dialCode: '+268', flag: '🇸🇿', lengths: [8] },
  { iso2: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', lengths: [7, 8, 9, 10] },
  { iso2: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', lengths: [9] },
  { iso2: 'SY', name: 'Syria', dialCode: '+963', flag: '🇸🇾', lengths: [8, 9] },
  { iso2: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', lengths: [9] },
  { iso2: 'TJ', name: 'Tajikistan', dialCode: '+992', flag: '🇹🇯', lengths: [9] },
  { iso2: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', lengths: [9] },
  { iso2: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', lengths: [8, 9] },
  { iso2: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', lengths: [8] },
  { iso2: 'TK', name: 'Tokelau', dialCode: '+690', flag: '🇹🇰', lengths: [4] },
  { iso2: 'TO', name: 'Tonga', dialCode: '+676', flag: '🇹🇴', lengths: [5, 7] },
  { iso2: 'TT', name: 'Trinidad and Tobago', dialCode: '+1868', flag: '🇹🇹', lengths: [10] },
  { iso2: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳', lengths: [8] },
  { iso2: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', lengths: [10] },
  { iso2: 'TM', name: 'Turkmenistan', dialCode: '+993', flag: '🇹🇲', lengths: [8] },
  { iso2: 'TC', name: 'Turks and Caicos Islands', dialCode: '+1649', flag: '🇹🇨', lengths: [10] },
  { iso2: 'TV', name: 'Tuvalu', dialCode: '+688', flag: '🇹🇻', lengths: [5, 6] },
  { iso2: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', lengths: [9] },
  { iso2: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', lengths: [9] },
  { iso2: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', lengths: [8, 9] },
  { iso2: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', lengths: [10] },
  { iso2: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', lengths: [10] },
  { iso2: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', lengths: [8] },
  { iso2: 'UZ', name: 'Uzbekistan', dialCode: '+998', flag: '🇺🇿', lengths: [9] },
  { iso2: 'VU', name: 'Vanuatu', dialCode: '+678', flag: '🇻🇺', lengths: [5, 7] },
  { iso2: 'VA', name: 'Vatican City', dialCode: '+39', flag: '🇻🇦', lengths: [9, 10, 11] },
  { iso2: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', lengths: [10] },
  { iso2: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', lengths: [9, 10] },
  { iso2: 'VI', name: 'U.S. Virgin Islands', dialCode: '+1340', flag: '🇻🇮', lengths: [10] },
  { iso2: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪', lengths: [7, 8, 9] },
  { iso2: 'ZM', name: 'Zambia', dialCode: '+260', flag: '🇿🇲', lengths: [9] },
  { iso2: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼', lengths: [9, 10] },
]

/** Default country for new forms (Hong Kong — ProActiv Fitness HQ). */
export const DEFAULT_COUNTRY_ISO2 = 'HK'

/** Look up a country by its ISO-2 code. */
export function findByIso2(iso2: string): CountryCode | undefined {
  return COUNTRY_CODES.find((c) => c.iso2 === iso2)
}

/**
 * Find best country match for a dial code prefix the user typed.
 * Longer dial codes win (so "+1264" matches Anguilla over generic "+1").
 */
export function findByDialCode(dialCode: string): CountryCode | undefined {
  const normalized = dialCode.startsWith('+') ? dialCode : `+${dialCode}`
  let best: CountryCode | undefined
  for (const c of COUNTRY_CODES) {
    if (normalized.startsWith(c.dialCode)) {
      if (!best || c.dialCode.length > best.dialCode.length) best = c
    }
  }
  return best
}

/** Validate a national-digit string against the country's allowed lengths. */
export function validatePhoneForCountry(
  national: string,
  country: CountryCode
): string | null {
  const digits = national.replace(/\D/g, '')
  if (!digits) return 'Phone number is required'
  if (!country.lengths.includes(digits.length)) {
    const expected =
      country.lengths.length === 1
        ? `${country.lengths[0]} digits`
        : `${country.lengths.join(' or ')} digits`
    return `${country.name} numbers must be ${expected} (you entered ${digits.length})`
  }
  return null
}
