export interface UserInfo {
  uid: string;
  email: string;
  country_code?: string;
  telephone?: string;
  name?: string;
  nickname?: string;
  gender?: string;
  birthday?: string;
  roles: string[];
  token: string;
}
