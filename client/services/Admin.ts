const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAdminVerifications = async () => {
  try {
    const res = await fetch(`${API_URL}/api/verifications/dashboard/admin`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch verifications: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

export const fetchVerificationById = async (id: number | string | undefined) => {
  if (!id) return { success: false, message: "ID is missing" };

  const res = await fetch(`${API_URL}/api/verifications/dashboard/admin/${id}`, {
    credentials: "include",
  });
  return res.json();
};


export const approveVerification = async (id: number | string) => {
  const res = await fetch(`${API_URL}/api/verifications/dashboard/admin/approve/${id}`, {
    method: "PUT",
    credentials: "include",
  });
  return res.json();
};

export const rejectVerification = async (id: number, remarks: string) => {
  const res = await fetch(`${API_URL}/api/verifications/dashboard/admin/reject/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ remarks }),
  });
  return res.json();
};

// Get approved vehicles for admin
export const fetchApprovedVehicles = async () => {
  try {
    const res = await fetch(`${API_URL}/api/vehicles/approved`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch approved vehicles: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

// Get rejected vehicles for admin
export const fetchRejectedVehicles = async () => {
  try {
    const res = await fetch(`${API_URL}/api/vehicles/rejected`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch rejected vehicles: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  }
  catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};
