"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";

import {
  Box,
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
  Search,
  PowerSettingsNew,
} from "@mui/icons-material";
import { toast } from "sonner";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";
import { HDataGrid } from "@/components/common/HDataGrid";
import { HPageHeader } from "@/components/common/HPageHeader";
import { HConfirmDialog } from "@/components/common/HConfirmDialog";

import {
  catalogRepository,
  type ServiceItem,
  type ServicePayload,
} from "@/lib/repositories/catalog.repository";

const defaultValues: ServicePayload = {
  code: "",
  name: "",
  serviceType: "inspection_booking",
  basePrice: "0",
  description: "",
  active: true,
};

const serviceTypes = [
  { value: "inspection_booking", label: "Đặt lịch đăng kiểm" },
  { value: "inspection_pickup", label: "Nhận xe đăng kiểm hộ" },
  { value: "other", label: "Dịch vụ khác" },
];

export default function ServicesPage() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusTarget, setStatusTarget] = useState<ServiceItem | null>(null);

  const methods = useForm<ServicePayload>({
    defaultValues,
  });

  const { data, isFetching } = useQuery({
    queryKey: ["admin-services", pagination.page, pagination.pageSize, search],
    queryFn: () =>
      catalogRepository.services.list({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search: search || undefined,
      }),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
  };

  const openCreate = () => {
    setEditing(null);
    methods.reset(defaultValues);
    setFormOpen(true);
  };

  const openEdit = (item: ServiceItem) => {
    setEditing(item);
    methods.reset({
      code: item.code,
      name: item.name,
      description: item.description ?? "",
      serviceType: item.serviceType,
      basePrice: item.basePrice,
      active: item.active,
    });
    setFormOpen(true);
  };

  const save = async (values: ServicePayload) => {
    setSaving(true);
    try {
      if (editing) {
        await catalogRepository.services.update(editing.id, values);
      } else {
        await catalogRepository.services.create(values);
      }

      toast.success(editing ? "Đã cập nhật dịch vụ" : "Đã thêm dịch vụ");
      setFormOpen(false);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async () => {
    if (!statusTarget) return;

    setSaving(true);
    try {
      await catalogRepository.services.setStatus(
        statusTarget.id,
        !statusTarget.active
      );
      toast.success("Đã cập nhật trạng thái");
      setStatusTarget(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<GridColDef<ServiceItem>[]>(
    () => [
      { field: "code", headerName: "Mã dịch vụ", minWidth: 155 },
      { field: "name", headerName: "Tên dịch vụ", flex: 1, minWidth: 230 },
      {
        field: "serviceType",
        headerName: "Loại dịch vụ",
        minWidth: 195,
        valueFormatter: (value: string) =>
          serviceTypes.find((x) => x.value === value)?.label ?? value,
      },
      {
        field: "basePrice",
        headerName: "Đơn giá",
        minWidth: 150,
        align: "right",
        headerAlign: "right",
        valueFormatter: (value: string) =>
          `${Number(value).toLocaleString("vi-VN")} đ`,
      },
      {
        field: "active",
        headerName: "Trạng thái",
        minWidth: 145,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={row.active ? "success" : "default"}
            label={row.active ? "Hoạt động" : "Ngừng hoạt động"}
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
            <Tooltip title={row.active ? "Ngừng hoạt động" : "Kích hoạt"}>
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
        title="Quản lý dịch vụ"
        description="Cấu hình dịch vụ và đơn giá hiển thị trên website đặt lịch."
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Thêm dịch vụ
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          size="small"
          placeholder="Tìm mã hoặc tên dịch vụ..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
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
        minHeight={500}
      />

      <Dialog
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle component="div">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
          </Typography>
        </DialogTitle>

        <HForm methods={methods} onSubmit={save}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <HTextField<ServicePayload>
                name="code"
                label="Mã dịch vụ"
                required
              />
              <HTextField<ServicePayload>
                name="name"
                label="Tên dịch vụ"
                required
              />

              <TextField
                select
                fullWidth
                label="Loại dịch vụ"
                value={methods.watch("serviceType")}
                onChange={(e) =>
                  methods.setValue("serviceType", e.target.value)
                }
              >
                {serviceTypes.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>

              <HTextField<ServicePayload>
                name="basePrice"
                label="Đơn giá (VNĐ)"
                type="number"
                required
              />

              <HTextField<ServicePayload>
                name="description"
                label="Mô tả"
                multiline
                rows={3}
              />

              <TextField
                select
                fullWidth
                label="Trạng thái"
                value={methods.watch("active") ? "active" : "inactive"}
                onChange={(e) =>
                  methods.setValue("active", e.target.value === "active")
                }
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setFormOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button variant="contained" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu dịch vụ"}
            </Button>
          </DialogActions>
        </HForm>
      </Dialog>

      <HConfirmDialog
        open={!!statusTarget}
        title="Xác nhận trạng thái"
        message={`Bạn muốn ${
          statusTarget?.active ? "ngừng" : "kích hoạt"
        } dịch vụ "${statusTarget?.name ?? ""}"?`}
        confirmText="Xác nhận"
        loading={saving}
        onConfirm={changeStatus}
        onClose={() => setStatusTarget(null)}
      />
    </Stack>
  );
}
