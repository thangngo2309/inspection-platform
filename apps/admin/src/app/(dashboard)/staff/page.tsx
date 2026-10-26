"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";

import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Add,
  EditOutlined,
  PowerSettingsNew,
  Search,
} from "@mui/icons-material";
import { toast } from "sonner";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";
import { HDataGrid } from "@/components/common/HDataGrid";
import { HPageHeader } from "@/components/common/HPageHeader";
import { HConfirmDialog } from "@/components/common/HConfirmDialog";

import {
  staffManagementRepository as repo,
  type StaffItem,
  type StaffFormValues,
} from "@/lib/repositories/staff-management.repository";

const defaults: StaffFormValues = {
  fullName: "",
  phone: "",
  employeeCode: "",
  password: "",
  driverLicenseNumber: "",
  serviceArea: "",
  status: "available",
};

export default function StaffPage() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<StaffItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<StaffItem | null>(null);
  const [saving, setSaving] = useState(false);

  const methods = useForm<StaffFormValues>({
    defaultValues: defaults,
  });

  const { data, isFetching } = useQuery({
    queryKey: [
      "admin-staff-management",
      pagination.page,
      pagination.pageSize,
      search,
    ],
    queryFn: () =>
      repo.list({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search: search || undefined,
      }),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin-staff-management"],
    });
  };

  const openCreate = () => {
    setEditing(null);
    methods.reset(defaults);
    setFormOpen(true);
  };

  const openEdit = (staff: StaffItem) => {
    setEditing(staff);

    methods.reset({
      fullName: staff.fullName,
      phone: staff.phone,
      employeeCode: staff.employeeCode,
      password: "",
      driverLicenseNumber: staff.driverLicenseNumber ?? "",
      serviceArea: staff.serviceArea ?? "",
      status: staff.status === "available" ? "available" : "unavailable",
    });

    setFormOpen(true);
  };

  const save = async (values: StaffFormValues) => {
    setSaving(true);

    try {
      if (editing) {
        await repo.update(editing.id, values);
      } else {
        await repo.create(values);
      }

      toast.success(
        editing
          ? "Đã cập nhật thông tin nhân viên"
          : "Đã tạo tài khoản nhân viên"
      );

      setFormOpen(false);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu nhân viên"
      );
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async () => {
    if (!statusTarget) return;

    setSaving(true);

    try {
      await repo.changeStatus(statusTarget.id, !statusTarget.active);

      toast.success("Đã cập nhật trạng thái nhân viên");
      setStatusTarget(null);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật"
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<GridColDef<StaffItem>[]>(
    () => [
      {
        field: "employeeCode",
        headerName: "Mã nhân viên",
        minWidth: 140,
      },
      {
        field: "fullName",
        headerName: "Họ tên",
        flex: 1,
        minWidth: 190,
      },
      {
        field: "phone",
        headerName: "Điện thoại",
        minWidth: 140,
      },
      {
        field: "driverLicenseNumber",
        headerName: "Số GPLX",
        minWidth: 160,
      },
      {
        field: "serviceArea",
        headerName: "Khu vực",
        minWidth: 170,
        flex: 1,
      },
      {
        field: "status",
        headerName: "Sẵn sàng",
        minWidth: 125,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={row.status === "available" ? "success" : "default"}
            label={row.status === "available" ? "Sẵn sàng" : "Không sẵn sàng"}
          />
        ),
      },
      {
        field: "active",
        headerName: "Tài khoản",
        minWidth: 135,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={row.active ? "primary" : "error"}
            label={row.active ? "Hoạt động" : "Đã khóa"}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Thao tác",
        minWidth: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row">
            <Tooltip title="Chỉnh sửa">
              <IconButton size="small" onClick={() => openEdit(row)}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={row.active ? "Khóa nhân viên" : "Kích hoạt"}>
              <IconButton
                size="small"
                color={row.active ? "error" : "success"}
                onClick={() => setStatusTarget(row)}
              >
                <PowerSettingsNew fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <HPageHeader
        title="Quản lý nhân viên"
        description="Tài khoản nhân viên nhận xe và phụ trách booking đăng kiểm."
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Thêm nhân viên
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          size="small"
          placeholder="Tên, số điện thoại, mã nhân viên..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setPagination((p) => ({ ...p, page: 0 }));
              setSearch(searchInput.trim());
            }
          }}
          sx={{ flex: 1 }}
        />

        <Button
          variant="outlined"
          startIcon={<Search />}
          onClick={() => {
            setPagination((p) => ({ ...p, page: 0 }));
            setSearch(searchInput.trim());
          }}
        >
          Tìm kiếm
        </Button>
      </Stack>

      <HDataGrid
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationMode="server"
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[10, 20, 50]}
        minHeight={520}
      />

      <Dialog
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
          </Typography>
        </DialogTitle>

        <HForm methods={methods} onSubmit={save}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <HTextField<StaffFormValues>
                name="employeeCode"
                label="Mã nhân viên"
                required
              />

              <HTextField<StaffFormValues>
                name="fullName"
                label="Họ và tên"
                required
              />

              <HTextField<StaffFormValues>
                name="phone"
                label="Số điện thoại"
                required
              />

              {!editing && (
                <HTextField<StaffFormValues>
                  name="password"
                  label="Mật khẩu ban đầu (ít nhất 12 ký tự)"
                  type="password"
                  required
                />
              )}

              <HTextField<StaffFormValues>
                name="driverLicenseNumber"
                label="Số giấy phép lái xe"
              />

              <HTextField<StaffFormValues>
                name="serviceArea"
                label="Khu vực phụ trách"
              />

              <TextField
                select
                fullWidth
                label="Tình trạng làm việc"
                value={methods.watch("status")}
                onChange={(event) =>
                  methods.setValue(
                    "status",
                    event.target.value as "available" | "unavailable"
                  )
                }
              >
                <MenuItem value="available">Sẵn sàng</MenuItem>
                <MenuItem value="unavailable">Không sẵn sàng</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={saving} onClick={() => setFormOpen(false)}>
              Hủy
            </Button>

            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu nhân viên"}
            </Button>
          </DialogActions>
        </HForm>
      </Dialog>

      <HConfirmDialog
        open={Boolean(statusTarget)}
        title="Thay đổi trạng thái nhân viên"
        message={`Bạn có muốn ${
          statusTarget?.active ? "khóa" : "kích hoạt"
        } nhân viên "${statusTarget?.fullName ?? ""}" không?`}
        confirmText="Xác nhận"
        loading={saving}
        color={statusTarget?.active ? "error" : "primary"}
        onConfirm={changeStatus}
        onClose={() => setStatusTarget(null)}
      />
    </Stack>
  );
}
