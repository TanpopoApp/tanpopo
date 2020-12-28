export interface GeoIP {
  organization: string;
  longitude: number;
  city: string;
  timezone: string;
  isp: string;
  offset: number;
  region: string;
  asn: number;
  asn_organization: string;
  country: string;
  ip: string;
  latitude: number;
  postal_code: string;
  continent_code: string;
  country_code?: string;
  region_code: string;
}
