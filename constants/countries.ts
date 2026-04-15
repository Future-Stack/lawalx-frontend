import { getCountries, getCountryCallingCode } from 'react-phone-number-input';

export interface CountryData {
  code: string;
  name: string;
  dialCode: string;
  display: string;
  maxLength: number; // Maximum digits allowed after the dial code
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// Heuristic for country phone lengths
const countryLengthMap: Record<string, number> = {
  US: 10,
  GB: 10,
  BD: 10,
  CA: 10,
  IN: 10,
  NG: 10,
  AU: 9,
  DE: 11,
  FR: 9,
  CN: 11,
  RU: 10,
  JP: 10,
  // Add more as needed, default to 10
};

export const countries: CountryData[] = getCountries().map((country) => {
  const name = regionNames.of(country) || country;
  const dialCode = `+${getCountryCallingCode(country)}`;
  return {
    code: country,
    name,
    dialCode,
    display: `${name} (${dialCode})`,
    maxLength: countryLengthMap[country] || 10,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

export const getCountryByCode = (code: string) => countries.find(c => c.code === code);
export const getCountryByDisplay = (display: string) => countries.find(c => c.display === display);
