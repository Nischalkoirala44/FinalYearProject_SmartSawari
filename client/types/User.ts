
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  profileImage?: string;
  role: "owner" | "renter" | "admin";
  esewaMobile?: string;
}

export interface AuthContextType {
  user: User | null;
  token?: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (
    name: string,
    email: string,
    mobile: string,
    password: string,
    role: "owner" | "renter" | "admin"
  ) => Promise<any>;
  logout: () => Promise<void>;
}
