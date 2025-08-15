export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  familyName: string;
  givenName: string;
}

export interface AuthSession {
  user: AuthUser;
  idToken: string;
  expiresAt: number;
}
