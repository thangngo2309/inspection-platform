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
  Stack,
  TextField,
  Typography,
  Tooltip,
  MenuItem,
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
  catalogRepository,
  type CenterItem,
  type CenterPayload,
} from "@/lib/repositories/catalog.repository";

const defaults: CenterPayload = {
  code: "",
  name: "",
  address: "",
  phone: "",
  latitude: "",
  longitude: "",
  description: "",
  status: "active",
};

export default function CentersPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CenterItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<CenterItem | null>(null);
  const [saving, setSaving] = useState(false);

  const methods = useForm<CenterPayload>({ defaultValues: defaults });

  const { data, isFetching } = useQuery({
    queryKey: ["admin-centers", pagination.page, pagination.pageSize, search],
    queryFn: () =>
      catalogRepository.centers.list({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search: search || undefined,
      }),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-centers"] });
  };

  const openCreate = () => {
    setEditing(null);
    methods.reset(defaults);
    setFormOpen(true);
  };

  const openEdit = (item: CenterItem) => {
    setEditing(item);
    methods.reset({
      code: item.code,
      name: item.name,
      address: item.address,
      phone: item.phone ?? "",
      latitude: item.latitude ?? "",
      longitude: item.longitude ?? "",
      description: item.description ?? "",
      status: item.status,
    });
    setFormOpen(true);
  };

  const save = async (values: CenterPayload) => {
    if (!values.code.trim() || !values.name.trim() || !values.address.trim()) {
      toast.error("Vui lòng nhập mã, tên và địa chỉ trung tâm");
      return;
    }

    const payload: CenterPayload = {
        ...values,
        phone: values.phone?.trim() || undefined,
        latitude: values.latitude?.trim() || undefined,
        longitude: values.longitude?.trim() || undefined,
        description: values.description?.trim() || undefined,
      };

    setSaving(true);
    try {
      if (editing) {
        await catalogRepository.centers.update(editing.id, payload);
      } else {
        await catalogRepository.centers.create(payload);
      }
      toast.success(editing ? "Đã cập nhật trung tâm" : "Đã thêm trung tâm");
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
      await catalogRepository.centers.setStatus(
        statusTarget.id,
        statusTarget.status === "active" ? "inactive" : "active"
      );
      toast.success("Đã thay đổi trạng thái trung tâm");
      setStatusTarget(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<GridColDef<CenterItem>[]>(
    () => [
      { field: "code", headerName: "Mã trung tâm", minWidth: 145 },
      {
        field: "name",
        headerName: "Tên trung tâm",
        minWidth: 220,
        flex: 1,
      },
      {
        field: "address",
        headerName: "Địa chỉ",
        minWidth: 270,
        flex: 1.4,
      },
      { field: "phone", headerName: "Điện thoại", minWidth: 135 },
      {
        field: "status",
        headerName: "Trạng thái",
        minWidth: 140,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={row.status === "active" ? "success" : "default"}
            label={row.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
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
            <Tooltip title={row.status === "active" ? "Ngừng" : "Kích hoạt"}>
              <IconButton
                size="small"
                color={row.status === "active" ? "error" : "success"}
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
        title="Trung tâm đăng kiểm"
        description="Quản lý danh sách trung tâm liên kết hiển thị khi khách đặt lịch."
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Thêm trung tâm
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          size="small"
          placeholder="Tìm mã, tên hoặc địa chỉ trung tâm..."
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
        minHeight={520}
      />

      <Dialog
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle component="div">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editing ? "Chỉnh sửa trung tâm" : "Thêm trung tâm đăng kiểm"}
          </Typography>
        </DialogTitle>

        <HForm methods={methods} onSubmit={save}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <HTextField<CenterPayload>
                name="code"
                label="Mã trung tâm"
                required
              />
              <HTextField<CenterPayload>
                name="name"
                label="Tên trung tâm"
                required
              />
              <HTextField<CenterPayload>
                name="address"
                label="Địa chỉ"
                required
                multiline
                rows={2}
              />
              <HTextField<CenterPayload>
                name="phone"
                label="Điện thoại liên hệ"
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <HTextField<CenterPayload>
                  name="latitude"
                  label="Vĩ độ"
                  placeholder="16.047079"
                />
                <HTextField<CenterPayload>
                  name="longitude"
                  label="Kinh độ"
                  placeholder="108.206230"
                />
              </Stack>
              <HTextField<CenterPayload>
                name="description"
                label="Thông tin ghi chú"
                multiline
                rows={3}
              />
              <TextField
                select
                fullWidth
                label="Trạng thái"
                value={methods.watch("status")}
                onChange={(e) =>
                  methods.setValue(
                    "status",
                    e.target.value as "active" | "inactive"
                  )
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
              {saving ? "Đang lưu..." : "Lưu trung tâm"}
            </Button>
          </DialogActions>
        </HForm>
      </Dialog>

      <HConfirmDialog
        open={!!statusTarget}
        title="Xác nhận thay đổi"
        message={`Bạn muốn ${
          statusTarget?.status === "active" ? "ngừng hoạt động" : "kích hoạt"
        } trung tâm "${statusTarget?.name ?? ""}"?`}
        confirmText="Xác nhận"
        loading={saving}
        onClose={() => setStatusTarget(null)}
        onConfirm={changeStatus}
      />
    </Stack>
  );
}
