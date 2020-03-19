export interface KeyCloakState {
  keycloakAuth?: object;
  authenticated: boolean;
  token: string;
  loading?: boolean;
  profile: [];
  isAdmin: boolean;
  isClient: boolean;
  isVerfied: boolean;
  fields: [];
  errorStatus: boolean;
  successStatus: boolean;
  profileErrorStatus: boolean;
}
