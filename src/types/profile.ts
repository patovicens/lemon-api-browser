import { AuthUser } from './auth';

export interface UserProfileProps {
  user: AuthUser;
  onLogout: () => void;
}

export interface ProfileScreenProps {
  user: AuthUser;
  onLogout: () => void;
}
