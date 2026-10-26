import { apiClient } from "../api-client";

export interface StaffItem {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  employeeCode: string;
  driverLicenseNumber: string | null;
  serviceArea: string | null;
  status: string;
  active: boolean;
  createdAt: string;
}

export interface StaffFormValues {
  fullName: string;
  phone: string;
  employeeCode: string;
  password: string;
  driverLicenseNumber: string;
  serviceArea: string;
  status: "available" | "unavailable";
}

export interface StaffPage {
  data: StaffItem[];
  total: number;
  page: number;
  limit: number;
}

export const staffManagementRepository = {
  async list(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<StaffPage> {
    const { data } = await apiClient.get<StaffPage>("/admin/staff-management", {
      params,
    });
    return data;
  },

  async create(values: StaffFormValues) {
    const { data } = await apiClient.post("/admin/staff-management", {
      ...values,
      driverLicenseNumber: values.driverLicenseNumber || undefined,
      serviceArea: values.serviceArea || undefined,
    });
    return data;
  },

  async update(id: string, values: StaffFormValues) {
    const { data } = await apiClient.patch(`/admin/staff-management/${id}`, {
      fullName: values.fullName,
      phone: values.phone,
      employeeCode: values.employeeCode,
      driverLicenseNumber: values.driverLicenseNumber || undefined,
      serviceArea: values.serviceArea || undefined,
      status: values.status,
    });
    return data;
  },

  async changeStatus(id: string, active: boolean) {
    const { data } = await apiClient.patch(
      `/admin/staff-management/${id}/status`,
      { active }
    );
    return data;
  },
};
