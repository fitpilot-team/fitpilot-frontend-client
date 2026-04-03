import { normalizePhoneInput, sanitizePhoneDigits } from '@/utils/phone'

export const PHONE_COUNTRY_DATA = [
  { code: 'AC', dialCode: '+247' },
  { code: 'AD', dialCode: '+376' },
  { code: 'AE', dialCode: '+971' },
  { code: 'AF', dialCode: '+93' },
  { code: 'AG', dialCode: '+1' },
  { code: 'AI', dialCode: '+1' },
  { code: 'AL', dialCode: '+355' },
  { code: 'AM', dialCode: '+374' },
  { code: 'AO', dialCode: '+244' },
  { code: 'AR', dialCode: '+54' },
  { code: 'AS', dialCode: '+1' },
  { code: 'AT', dialCode: '+43' },
  { code: 'AU', dialCode: '+61' },
  { code: 'AW', dialCode: '+297' },
  { code: 'AX', dialCode: '+358' },
  { code: 'AZ', dialCode: '+994' },
  { code: 'BA', dialCode: '+387' },
  { code: 'BB', dialCode: '+1' },
  { code: 'BD', dialCode: '+880' },
  { code: 'BE', dialCode: '+32' },
  { code: 'BF', dialCode: '+226' },
  { code: 'BG', dialCode: '+359' },
  { code: 'BH', dialCode: '+973' },
  { code: 'BI', dialCode: '+257' },
  { code: 'BJ', dialCode: '+229' },
  { code: 'BL', dialCode: '+590' },
  { code: 'BM', dialCode: '+1' },
  { code: 'BN', dialCode: '+673' },
  { code: 'BO', dialCode: '+591' },
  { code: 'BQ', dialCode: '+599' },
  { code: 'BR', dialCode: '+55' },
  { code: 'BS', dialCode: '+1' },
  { code: 'BT', dialCode: '+975' },
  { code: 'BW', dialCode: '+267' },
  { code: 'BY', dialCode: '+375' },
  { code: 'BZ', dialCode: '+501' },
  { code: 'CA', dialCode: '+1' },
  { code: 'CC', dialCode: '+61' },
  { code: 'CD', dialCode: '+243' },
  { code: 'CF', dialCode: '+236' },
  { code: 'CG', dialCode: '+242' },
  { code: 'CH', dialCode: '+41' },
  { code: 'CI', dialCode: '+225' },
  { code: 'CK', dialCode: '+682' },
  { code: 'CL', dialCode: '+56' },
  { code: 'CM', dialCode: '+237' },
  { code: 'CN', dialCode: '+86' },
  { code: 'CO', dialCode: '+57' },
  { code: 'CR', dialCode: '+506' },
  { code: 'CU', dialCode: '+53' },
  { code: 'CV', dialCode: '+238' },
  { code: 'CW', dialCode: '+599' },
  { code: 'CX', dialCode: '+61' },
  { code: 'CY', dialCode: '+357' },
  { code: 'CZ', dialCode: '+420' },
  { code: 'DE', dialCode: '+49' },
  { code: 'DJ', dialCode: '+253' },
  { code: 'DK', dialCode: '+45' },
  { code: 'DM', dialCode: '+1' },
  { code: 'DO', dialCode: '+1' },
  { code: 'DZ', dialCode: '+213' },
  { code: 'EC', dialCode: '+593' },
  { code: 'EE', dialCode: '+372' },
  { code: 'EG', dialCode: '+20' },
  { code: 'EH', dialCode: '+212' },
  { code: 'ER', dialCode: '+291' },
  { code: 'ES', dialCode: '+34' },
  { code: 'ET', dialCode: '+251' },
  { code: 'FI', dialCode: '+358' },
  { code: 'FJ', dialCode: '+679' },
  { code: 'FK', dialCode: '+500' },
  { code: 'FM', dialCode: '+691' },
  { code: 'FO', dialCode: '+298' },
  { code: 'FR', dialCode: '+33' },
  { code: 'GA', dialCode: '+241' },
  { code: 'GB', dialCode: '+44' },
  { code: 'GD', dialCode: '+1' },
  { code: 'GE', dialCode: '+995' },
  { code: 'GF', dialCode: '+594' },
  { code: 'GG', dialCode: '+44' },
  { code: 'GH', dialCode: '+233' },
  { code: 'GI', dialCode: '+350' },
  { code: 'GL', dialCode: '+299' },
  { code: 'GM', dialCode: '+220' },
  { code: 'GN', dialCode: '+224' },
  { code: 'GP', dialCode: '+590' },
  { code: 'GQ', dialCode: '+240' },
  { code: 'GR', dialCode: '+30' },
  { code: 'GT', dialCode: '+502' },
  { code: 'GU', dialCode: '+1' },
  { code: 'GW', dialCode: '+245' },
  { code: 'GY', dialCode: '+592' },
  { code: 'HK', dialCode: '+852' },
  { code: 'HN', dialCode: '+504' },
  { code: 'HR', dialCode: '+385' },
  { code: 'HT', dialCode: '+509' },
  { code: 'HU', dialCode: '+36' },
  { code: 'ID', dialCode: '+62' },
  { code: 'IE', dialCode: '+353' },
  { code: 'IL', dialCode: '+972' },
  { code: 'IM', dialCode: '+44' },
  { code: 'IN', dialCode: '+91' },
  { code: 'IO', dialCode: '+246' },
  { code: 'IQ', dialCode: '+964' },
  { code: 'IR', dialCode: '+98' },
  { code: 'IS', dialCode: '+354' },
  { code: 'IT', dialCode: '+39' },
  { code: 'JE', dialCode: '+44' },
  { code: 'JM', dialCode: '+1' },
  { code: 'JO', dialCode: '+962' },
  { code: 'JP', dialCode: '+81' },
  { code: 'KE', dialCode: '+254' },
  { code: 'KG', dialCode: '+996' },
  { code: 'KH', dialCode: '+855' },
  { code: 'KI', dialCode: '+686' },
  { code: 'KM', dialCode: '+269' },
  { code: 'KN', dialCode: '+1' },
  { code: 'KP', dialCode: '+850' },
  { code: 'KR', dialCode: '+82' },
  { code: 'KW', dialCode: '+965' },
  { code: 'KY', dialCode: '+1' },
  { code: 'KZ', dialCode: '+7' },
  { code: 'LA', dialCode: '+856' },
  { code: 'LB', dialCode: '+961' },
  { code: 'LC', dialCode: '+1' },
  { code: 'LI', dialCode: '+423' },
  { code: 'LK', dialCode: '+94' },
  { code: 'LR', dialCode: '+231' },
  { code: 'LS', dialCode: '+266' },
  { code: 'LT', dialCode: '+370' },
  { code: 'LU', dialCode: '+352' },
  { code: 'LV', dialCode: '+371' },
  { code: 'LY', dialCode: '+218' },
  { code: 'MA', dialCode: '+212' },
  { code: 'MC', dialCode: '+377' },
  { code: 'MD', dialCode: '+373' },
  { code: 'ME', dialCode: '+382' },
  { code: 'MF', dialCode: '+590' },
  { code: 'MG', dialCode: '+261' },
  { code: 'MH', dialCode: '+692' },
  { code: 'MK', dialCode: '+389' },
  { code: 'ML', dialCode: '+223' },
  { code: 'MM', dialCode: '+95' },
  { code: 'MN', dialCode: '+976' },
  { code: 'MO', dialCode: '+853' },
  { code: 'MP', dialCode: '+1' },
  { code: 'MQ', dialCode: '+596' },
  { code: 'MR', dialCode: '+222' },
  { code: 'MS', dialCode: '+1' },
  { code: 'MT', dialCode: '+356' },
  { code: 'MU', dialCode: '+230' },
  { code: 'MV', dialCode: '+960' },
  { code: 'MW', dialCode: '+265' },
  { code: 'MX', dialCode: '+52' },
  { code: 'MY', dialCode: '+60' },
  { code: 'MZ', dialCode: '+258' },
  { code: 'NA', dialCode: '+264' },
  { code: 'NC', dialCode: '+687' },
  { code: 'NE', dialCode: '+227' },
  { code: 'NF', dialCode: '+672' },
  { code: 'NG', dialCode: '+234' },
  { code: 'NI', dialCode: '+505' },
  { code: 'NL', dialCode: '+31' },
  { code: 'NO', dialCode: '+47' },
  { code: 'NP', dialCode: '+977' },
  { code: 'NR', dialCode: '+674' },
  { code: 'NU', dialCode: '+683' },
  { code: 'NZ', dialCode: '+64' },
  { code: 'OM', dialCode: '+968' },
  { code: 'PA', dialCode: '+507' },
  { code: 'PE', dialCode: '+51' },
  { code: 'PF', dialCode: '+689' },
  { code: 'PG', dialCode: '+675' },
  { code: 'PH', dialCode: '+63' },
  { code: 'PK', dialCode: '+92' },
  { code: 'PL', dialCode: '+48' },
  { code: 'PM', dialCode: '+508' },
  { code: 'PR', dialCode: '+1' },
  { code: 'PS', dialCode: '+970' },
  { code: 'PT', dialCode: '+351' },
  { code: 'PW', dialCode: '+680' },
  { code: 'PY', dialCode: '+595' },
  { code: 'QA', dialCode: '+974' },
  { code: 'RE', dialCode: '+262' },
  { code: 'RO', dialCode: '+40' },
  { code: 'RS', dialCode: '+381' },
  { code: 'RU', dialCode: '+7' },
  { code: 'RW', dialCode: '+250' },
  { code: 'SA', dialCode: '+966' },
  { code: 'SB', dialCode: '+677' },
  { code: 'SC', dialCode: '+248' },
  { code: 'SD', dialCode: '+249' },
  { code: 'SE', dialCode: '+46' },
  { code: 'SG', dialCode: '+65' },
  { code: 'SH', dialCode: '+290' },
  { code: 'SI', dialCode: '+386' },
  { code: 'SJ', dialCode: '+47' },
  { code: 'SK', dialCode: '+421' },
  { code: 'SL', dialCode: '+232' },
  { code: 'SM', dialCode: '+378' },
  { code: 'SN', dialCode: '+221' },
  { code: 'SO', dialCode: '+252' },
  { code: 'SR', dialCode: '+597' },
  { code: 'SS', dialCode: '+211' },
  { code: 'ST', dialCode: '+239' },
  { code: 'SV', dialCode: '+503' },
  { code: 'SX', dialCode: '+1' },
  { code: 'SY', dialCode: '+963' },
  { code: 'SZ', dialCode: '+268' },
  { code: 'TA', dialCode: '+290' },
  { code: 'TC', dialCode: '+1' },
  { code: 'TD', dialCode: '+235' },
  { code: 'TG', dialCode: '+228' },
  { code: 'TH', dialCode: '+66' },
  { code: 'TJ', dialCode: '+992' },
  { code: 'TK', dialCode: '+690' },
  { code: 'TL', dialCode: '+670' },
  { code: 'TM', dialCode: '+993' },
  { code: 'TN', dialCode: '+216' },
  { code: 'TO', dialCode: '+676' },
  { code: 'TR', dialCode: '+90' },
  { code: 'TT', dialCode: '+1' },
  { code: 'TV', dialCode: '+688' },
  { code: 'TW', dialCode: '+886' },
  { code: 'TZ', dialCode: '+255' },
  { code: 'UA', dialCode: '+380' },
  { code: 'UG', dialCode: '+256' },
  { code: 'US', dialCode: '+1' },
  { code: 'UY', dialCode: '+598' },
  { code: 'UZ', dialCode: '+998' },
  { code: 'VA', dialCode: '+39' },
  { code: 'VC', dialCode: '+1' },
  { code: 'VE', dialCode: '+58' },
  { code: 'VG', dialCode: '+1' },
  { code: 'VI', dialCode: '+1' },
  { code: 'VN', dialCode: '+84' },
  { code: 'VU', dialCode: '+678' },
  { code: 'WF', dialCode: '+681' },
  { code: 'WS', dialCode: '+685' },
  { code: 'XK', dialCode: '+383' },
  { code: 'YE', dialCode: '+967' },
  { code: 'YT', dialCode: '+262' },
  { code: 'ZA', dialCode: '+27' },
  { code: 'ZM', dialCode: '+260' },
  { code: 'ZW', dialCode: '+263' },
] as const

export type PhoneCountryCode = (typeof PHONE_COUNTRY_DATA)[number]['code']

export interface PhoneCountryOption {
  alpha3: string
  code: PhoneCountryCode
  dialCode: string
  flag: string
  name: string
}

export type PhoneCountryMatchStatus = 'ambiguous' | 'none' | 'unique'

export interface PhoneCountryMatchResult {
  dialCode: string | null
  matchedCountries: PhoneCountryOption[]
  matchedCountry: PhoneCountryOption | null
  nationalNumber: string
  normalizedPhone: string | null
  status: PhoneCountryMatchStatus
}

export const DEFAULT_PHONE_COUNTRY_CODE: PhoneCountryCode = 'MX'

const phoneCountryOptionsCache = new Map<string, PhoneCountryOption[]>()
const phoneCountrySearchTermsCache = new Map<string, string[]>()
const displayNamesCache = new Map<string, Intl.DisplayNames>()

const flagOffset = 127397
const FALLBACK_ALPHA3_BY_CODE = {
  AC: 'ASC',
  AD: 'AND',
  AE: 'ARE',
  AF: 'AFG',
  AG: 'ATG',
  AI: 'AIA',
  AL: 'ALB',
  AM: 'ARM',
  AO: 'AGO',
  AR: 'ARG',
  AS: 'ASM',
  AT: 'AUT',
  AU: 'AUS',
  AW: 'ABW',
  AX: 'ALA',
  AZ: 'AZE',
  BA: 'BIH',
  BB: 'BRB',
  BD: 'BGD',
  BE: 'BEL',
  BF: 'BFA',
  BG: 'BGR',
  BH: 'BHR',
  BI: 'BDI',
  BJ: 'BEN',
  BL: 'BLM',
  BM: 'BMU',
  BN: 'BRN',
  BO: 'BOL',
  BQ: 'BES',
  BR: 'BRA',
  BS: 'BHS',
  BT: 'BTN',
  BW: 'BWA',
  BY: 'BLR',
  BZ: 'BLZ',
  CA: 'CAN',
  CC: 'CCK',
  CD: 'COD',
  CF: 'CAF',
  CG: 'COG',
  CH: 'CHE',
  CI: 'CIV',
  CK: 'COK',
  CL: 'CHL',
  CM: 'CMR',
  CN: 'CHN',
  CO: 'COL',
  CR: 'CRI',
  CU: 'CUB',
  CV: 'CPV',
  CW: 'CUW',
  CX: 'CXR',
  CY: 'CYP',
  CZ: 'CZE',
  DE: 'DEU',
  DJ: 'DJI',
  DK: 'DNK',
  DM: 'DMA',
  DO: 'DOM',
  DZ: 'DZA',
  EC: 'ECU',
  EE: 'EST',
  EG: 'EGY',
  EH: 'ESH',
  ER: 'ERI',
  ES: 'ESP',
  ET: 'ETH',
  FI: 'FIN',
  FJ: 'FJI',
  FK: 'FLK',
  FM: 'FSM',
  FO: 'FRO',
  FR: 'FRA',
  GA: 'GAB',
  GB: 'GBR',
  GD: 'GRD',
  GE: 'GEO',
  GF: 'GUF',
  GG: 'GGY',
  GH: 'GHA',
  GI: 'GIB',
  GL: 'GRL',
  GM: 'GMB',
  GN: 'GIN',
  GP: 'GLP',
  GQ: 'GNQ',
  GR: 'GRC',
  GT: 'GTM',
  GU: 'GUM',
  GW: 'GNB',
  GY: 'GUY',
  HK: 'HKG',
  HN: 'HND',
  HR: 'HRV',
  HT: 'HTI',
  HU: 'HUN',
  ID: 'IDN',
  IE: 'IRL',
  IL: 'ISR',
  IM: 'IMN',
  IN: 'IND',
  IO: 'IOT',
  IQ: 'IRQ',
  IR: 'IRN',
  IS: 'ISL',
  IT: 'ITA',
  JE: 'JEY',
  JM: 'JAM',
  JO: 'JOR',
  JP: 'JPN',
  KE: 'KEN',
  KG: 'KGZ',
  KH: 'KHM',
  KI: 'KIR',
  KM: 'COM',
  KN: 'KNA',
  KP: 'PRK',
  KR: 'KOR',
  KW: 'KWT',
  KY: 'CYM',
  KZ: 'KAZ',
  LA: 'LAO',
  LB: 'LBN',
  LC: 'LCA',
  LI: 'LIE',
  LK: 'LKA',
  LR: 'LBR',
  LS: 'LSO',
  LT: 'LTU',
  LU: 'LUX',
  LV: 'LVA',
  LY: 'LBY',
  MA: 'MAR',
  MC: 'MCO',
  MD: 'MDA',
  ME: 'MNE',
  MF: 'MAF',
  MG: 'MDG',
  MH: 'MHL',
  MK: 'MKD',
  ML: 'MLI',
  MM: 'MMR',
  MN: 'MNG',
  MO: 'MAC',
  MP: 'MNP',
  MQ: 'MTQ',
  MR: 'MRT',
  MS: 'MSR',
  MT: 'MLT',
  MU: 'MUS',
  MV: 'MDV',
  MW: 'MWI',
  MX: 'MEX',
  MY: 'MYS',
  MZ: 'MOZ',
  NA: 'NAM',
  NC: 'NCL',
  NE: 'NER',
  NF: 'NFK',
  NG: 'NGA',
  NI: 'NIC',
  NL: 'NLD',
  NO: 'NOR',
  NP: 'NPL',
  NR: 'NRU',
  NU: 'NIU',
  NZ: 'NZL',
  OM: 'OMN',
  PA: 'PAN',
  PE: 'PER',
  PF: 'PYF',
  PG: 'PNG',
  PH: 'PHL',
  PK: 'PAK',
  PL: 'POL',
  PM: 'SPM',
  PR: 'PRI',
  PS: 'PSE',
  PT: 'PRT',
  PW: 'PLW',
  PY: 'PRY',
  QA: 'QAT',
  RE: 'REU',
  RO: 'ROU',
  RS: 'SRB',
  RU: 'RUS',
  RW: 'RWA',
  SA: 'SAU',
  SB: 'SLB',
  SC: 'SYC',
  SD: 'SDN',
  SE: 'SWE',
  SG: 'SGP',
  SH: 'SHN',
  SI: 'SVN',
  SJ: 'SJM',
  SK: 'SVK',
  SL: 'SLE',
  SM: 'SMR',
  SN: 'SEN',
  SO: 'SOM',
  SR: 'SUR',
  SS: 'SSD',
  ST: 'STP',
  SV: 'SLV',
  SX: 'SXM',
  SY: 'SYR',
  SZ: 'SWZ',
  TA: 'TDC',
  TC: 'TCA',
  TD: 'TCD',
  TG: 'TGO',
  TH: 'THA',
  TJ: 'TJK',
  TK: 'TKL',
  TL: 'TLS',
  TM: 'TKM',
  TN: 'TUN',
  TO: 'TON',
  TR: 'TUR',
  TT: 'TTO',
  TV: 'TUV',
  TW: 'TWN',
  TZ: 'TZA',
  UA: 'UKR',
  UG: 'UGA',
  US: 'USA',
  UY: 'URY',
  UZ: 'UZB',
  VA: 'VAT',
  VC: 'VCT',
  VE: 'VEN',
  VG: 'VGB',
  VI: 'VIR',
  VN: 'VNM',
  VU: 'VUT',
  WF: 'WLF',
  WS: 'WSM',
  XK: 'XKX',
  YE: 'YEM',
  YT: 'MYT',
  ZA: 'ZAF',
  ZM: 'ZMB',
  ZW: 'ZWE',
} satisfies Record<PhoneCountryCode, string>
const phoneCountryDataByCode = new Map(PHONE_COUNTRY_DATA.map((country) => [country.code, country]))
const uniqueDialCodes = [...new Set(PHONE_COUNTRY_DATA.map(({ dialCode }) => dialCode))].sort(
  (left, right) => right.length - left.length || left.localeCompare(right),
)

const normalizeLocale = (locale?: string) => locale?.trim() || 'es'

const getDisplayNames = (locale: string) => {
  const normalizedLocale = normalizeLocale(locale)
  const cachedDisplayNames = displayNamesCache.get(normalizedLocale)

  if (cachedDisplayNames) {
    return cachedDisplayNames
  }

  const displayNames = new Intl.DisplayNames([normalizedLocale], { type: 'region' })
  displayNamesCache.set(normalizedLocale, displayNames)
  return displayNames
}

export const getPhoneCountryName = (code: PhoneCountryCode, locale?: string) =>
  getDisplayNames(normalizeLocale(locale)).of(code) ?? code

export const getPhoneCountryFlag = (code: string) =>
  code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + flagOffset))
    .join('')

export const getPhoneCountryOptions = (locale?: string): PhoneCountryOption[] => {
  const normalizedLocale = normalizeLocale(locale)
  const cachedOptions = phoneCountryOptionsCache.get(normalizedLocale)

  if (cachedOptions) {
    return cachedOptions
  }

  const options = PHONE_COUNTRY_DATA.map(({ code, dialCode }) => ({
    alpha3: FALLBACK_ALPHA3_BY_CODE[code],
    code,
    dialCode,
    flag: getPhoneCountryFlag(code),
    name: getPhoneCountryName(code, normalizedLocale),
  })).sort((left, right) => {
    if (left.code === DEFAULT_PHONE_COUNTRY_CODE) return -1
    if (right.code === DEFAULT_PHONE_COUNTRY_CODE) return 1

    return left.name.localeCompare(right.name, normalizedLocale)
  })

  phoneCountryOptionsCache.set(normalizedLocale, options)
  return options
}

export const getPhoneCountryCompactLabel = (
  country: Pick<PhoneCountryOption, 'dialCode' | 'flag'>,
) => `${country.flag} ${country.dialCode}`

export const getPhoneCountryOption = (
  code: string | null | undefined,
  locale?: string,
): PhoneCountryOption => {
  const options = getPhoneCountryOptions(locale)

  return (
    options.find((country) => country.code === code) ??
    options.find((country) => country.code === DEFAULT_PHONE_COUNTRY_CODE) ??
    options[0]
  )
}

export const getPhoneCountrySearchTerms = (
  code: PhoneCountryCode,
  locale?: string,
): string[] => {
  const normalizedLocale = normalizeLocale(locale)
  const cacheKey = `${normalizedLocale}:${code}`
  const cachedTerms = phoneCountrySearchTermsCache.get(cacheKey)

  if (cachedTerms) {
    return cachedTerms
  }

  const countryData = phoneCountryDataByCode.get(code)
  if (!countryData) {
    return [code]
  }

  const searchTerms = Array.from(
    new Set(
      [normalizedLocale, 'es', 'en']
        .map((candidateLocale) => getPhoneCountryName(code, candidateLocale))
        .concat([code, FALLBACK_ALPHA3_BY_CODE[code], countryData.dialCode]),
    ),
  )

  phoneCountrySearchTermsCache.set(cacheKey, searchTerms)
  return searchTerms
}

export const resolvePhoneCountryFromInternationalNumber = (
  value: unknown,
  locale?: string,
): PhoneCountryMatchResult => {
  const normalizedPhone = normalizePhoneInput(value)
  if (!normalizedPhone || !normalizedPhone.startsWith('+')) {
    return {
      dialCode: null,
      matchedCountries: [],
      matchedCountry: null,
      nationalNumber: sanitizePhoneDigits(normalizedPhone ?? value),
      normalizedPhone,
      status: 'none',
    }
  }

  const dialCode = uniqueDialCodes.find((candidateDialCode) =>
    normalizedPhone.startsWith(candidateDialCode),
  )

  if (!dialCode) {
    return {
      dialCode: null,
      matchedCountries: [],
      matchedCountry: null,
      nationalNumber: sanitizePhoneDigits(normalizedPhone),
      normalizedPhone,
      status: 'none',
    }
  }

  const matchedCountries = getPhoneCountryOptions(locale).filter(
    (country) => country.dialCode === dialCode,
  )
  const matchedCountry = matchedCountries.length === 1 ? matchedCountries[0] : null

  return {
    dialCode,
    matchedCountries,
    matchedCountry,
    nationalNumber: sanitizePhoneDigits(normalizedPhone.slice(dialCode.length)),
    normalizedPhone,
    status: matchedCountry ? 'unique' : 'ambiguous',
  }
}
