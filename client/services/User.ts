import { User } from "../types/User";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function uploadProfilePicture(file: File, token: string) {
  const formData = new FormData();
  formData.append("profileImage", file);

  const res = await fetch(`${API_URL}/api/user/upload-profile-picture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Upload failed");
  }

  return res.json();
}

export const updateProfile = async (
  userData: {
    name: string;
    email: string;
    mobile: string;
    esewaMobile?: string;
  },
  file: File | null,
  token: string,
): Promise<User> => {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("email", userData.email);
  formData.append("mobile", userData.mobile);

  if (userData.esewaMobile) {
    formData.append("esewaMobile", userData.esewaMobile);
  }

  if (file) formData.append("profileImage", file);

  const res = await fetch(`${API_URL}/api/user/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update profile");

  return data.user as User;
};

export const updatePassword = async (
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
  token: string,
): Promise<boolean> => {
  const res = await fetch(`${API_URL}/api/user/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(passwordData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to update password");
  }
  return true;
};

export const getProfile = async (token: string): Promise<User> => {
  const res = await fetch(`${API_URL}/api/user/getprofile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch profile");

  return data.user as User;
};
