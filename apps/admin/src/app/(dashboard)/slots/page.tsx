"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

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
  EventAvailable,
  PowerSettingsNew,
} from "@mui/icons-material";

import { toast } from "sonner";

import { HForm } from "@/components/forms/HForm";
import { HDataGrid } from "@/components/common/HDataGrid";
import { HPageHeader } from "@/components/common/HPageHeader";
import { HConfirmDialog } from "@/components/common/HConfirmDialog";

import {
  slotManagementRepository as repo,
  type SlotFormValues,
  type SlotItem,
} from "@/lib/repositories/slot-management.repository";

import {
  catalogRepository,
  type CenterItem,
} from "@/lib/repositories/catalog.repository";

const vehicleTypes = [
  { value: "car", label: "Ô tô con" },
  { value: "truck", label: "Xe tải" },
  { value: "bus", label: "Xe khách" },
];

const defaults: SlotFormValues = {
  centerId: "",
  slotDate: "",
  startTime: "08:00",
  endTime: "09:00",
  vehicleType: "car",
  capacity: 5,
};

export default function SlotsPage() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const [centerFilter, setCenterFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [editing, setEditing] = useState<SlotItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<SlotItem | null>(null);
  const [saving, setSaving] = useState(false);

  const methods = useForm<SlotFormValues>({
    defaultValues: defaults,
  });

  const { data: centersData } = useQuery({
    queryKey: ["slot-centers"],
    queryFn: async () => {
      const response = await catalogRepository.centers.list({
        page: 1,
        limit: 100,
      });
      return response.data;
    },
  });

  const centers: CenterItem[] = centersData ?? [];

  const { data, isFetching } = useQuery({
    queryKey: [
      "admin-slot-management",
      pagination.page,
      pagination.pageSize,
      centerFilter,
      dateFilter,
    ],
    queryFn: () =>
      repo.list({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        centerId: centerFilter || undefined,
        date: dateFilter || undefined,
      }),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin-slot-management"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["admin-slots"],
    });
  };

  const openCreate = () => {
    setEditing(null);
    methods.reset(defaults);
    setFormOpen(true);
  };

  const openEdit = (slot: SlotItem) => {
    setEditing(slot);

    methods.reset({
      centerId: slot.centerId,
      slotDate: slot.slotDate,
      startTime: slot.startTime.slice(0, 5),
      endTime: slot.endTime.slice(0, 5),
      vehicleType: slot.vehicleType,
      capacity: slot.capacity,
    });

    setFormOpen(true);
  };

  const save = async (values: SlotFormValues) => {
    setSaving(true);

    try {
      const payload = {
        ...values,
        capacity: Number(values.capacity),
      };

      if (editing) {
        await repo.update(editing.id, {
          startTime: payload.startTime,
          endTime: payload.endTime,
          capacity: payload.capacity,
        });
      } else {
        await repo.create(payload);
      }

      toast.success(
        editing ? "Đã cập nhật khung giờ" : "Đã tạo khung giờ đăng kiểm"
      );

      setFormOpen(false);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu khung giờ"
      );
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async () => {
    if (!statusTarget) return;

    setSaving(true);

    try {
      const next = statusTarget.status === "open" ? "closed" : "open";

      await repo.changeStatus(statusTarget.id, next);

      toast.success("Đã cập nhật trạng thái khung giờ");
      setStatusTarget(null);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật khung giờ"
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<GridColDef<SlotItem>[]>(
    () => [
      {
        field: "slotDate",
        headerName: "Ngày",
        minWidth: 125,
      },
      {
        field: "centerName",
        headerName: "Trung tâm",
        minWidth: 210,
        flex: 1,
      },
      {
        field: "startTime",
        headerName: "Bắt đầu",
        minWidth: 105,
        valueFormatter: (value: string) => value?.slice(0, 5) ?? "",
      },
      {
        field: "endTime",
        headerName: "Kết thúc",
        minWidth: 105,
        valueFormatter: (value: string) => value?.slice(0, 5) ?? "",
      },
      {
        field: "vehicleType",
        headerName: "Loại xe",
        minWidth: 125,
        valueFormatter: (value: string) =>
          vehicleTypes.find((x) => x.value === value)?.label ?? value,
      },
      {
        field: "capacity",
        headerName: "Hạn mức",
        minWidth: 105,
        type: "number",
      },
      {
        field: "reservedCount",
        headerName: "Đã đặt",
        minWidth: 100,
        type: "number",
      },
      {
        field: "status",
        headerName: "Trạng thái",
        minWidth: 125,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={row.status === "open" ? "success" : "default"}
            label={row.status === "open" ? "Mở nhận" : "Đã đóng"}
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

            <Tooltip
              title={
                row.status === "open" ? "Đóng nhận booking" : "Mở nhận booking"
              }
            >
              <IconButton
                size="small"
                color={row.status === "open" ? "error" : "success"}
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
        title="Quản lý khung giờ"
        description="Thiết lập hạn mức và thời gian tiếp nhận xe tại từng trung tâm đăng kiểm."
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              href="/staff-schedule"
              variant="outlined"
              startIcon={<EventAvailable />}
            >
              Bố trí nhân viên
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
            >
              Thêm khung giờ
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          select
          size="small"
          label="Trung tâm"
          value={centerFilter}
          onChange={(event) => {
            setCenterFilter(event.target.value);
            setPagination((p) => ({ ...p, page: 0 }));
          }}
          sx={{ minWidth: 240, flex: 1 }}
        >
          <MenuItem value="">Tất cả trung tâm</MenuItem>

          {centers.map((center) => (
            <MenuItem key={center.id} value={center.id}>
              {center.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          size="small"
          label="Ngày đăng kiểm"
          value={dateFilter}
          onChange={(event) => {
            setDateFilter(event.target.value);
            setPagination((p) => ({ ...p, page: 0 }));
          }}
          sx={{ minWidth: 200 }}
        />
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
            {editing ? "Chỉnh sửa khung giờ" : "Tạo khung giờ"}
          </Typography>
        </DialogTitle>

        <HForm methods={methods} onSubmit={save}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                select
                fullWidth
                label="Trung tâm đăng kiểm"
                value={methods.watch("centerId")}
                disabled={Boolean(editing)}
                onChange={(event) =>
                  methods.setValue("centerId", event.target.value)
                }
              >
                <MenuItem value="">Chọn trung tâm</MenuItem>
                {centers
                  .filter((center) => center.status === "active")
                  .map((center) => (
                    <MenuItem key={center.id} value={center.id}>
                      {center.name}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                type="date"
                fullWidth
                label="Ngày"
                value={methods.watch("slotDate")}
                disabled={Boolean(editing)}
                onChange={(event) =>
                  methods.setValue("slotDate", event.target.value)
                }
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  type="time"
                  fullWidth
                  label="Giờ bắt đầu"
                  value={methods.watch("startTime")}
                  onChange={(event) =>
                    methods.setValue("startTime", event.target.value)
                  }
                />

                <TextField
                  type="time"
                  fullWidth
                  label="Giờ kết thúc"
                  value={methods.watch("endTime")}
                  onChange={(event) =>
                    methods.setValue("endTime", event.target.value)
                  }
                />
              </Stack>

              <TextField
                select
                fullWidth
                label="Loại xe"
                value={methods.watch("vehicleType")}
                disabled={Boolean(editing)}
                onChange={(event) =>
                  methods.setValue(
                    "vehicleType",
                    event.target.value as SlotFormValues["vehicleType"]
                  )
                }
              >
                {vehicleTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="number"
                fullWidth
                label="Hạn mức tiếp nhận"
                value={methods.watch("capacity")}
                onChange={(event) =>
                  methods.setValue("capacity", Number(event.target.value))
                }
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 1000,
                  },
                }}
              />

              <Typography variant="body2" color="text.secondary">
                Hạn mức là số xe tối đa được trung tâm tiếp nhận. Website chỉ mở
                số suất tương ứng với nhân viên phụ trách khả dụng.
              </Typography>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setFormOpen(false)} disabled={saving}>
              Hủy
            </Button>

            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu khung giờ"}
            </Button>
          </DialogActions>
        </HForm>
      </Dialog>

      <HConfirmDialog
        open={Boolean(statusTarget)}
        title="Xác nhận trạng thái khung giờ"
        message={`Bạn muốn ${
          statusTarget?.status === "open" ? "đóng" : "mở"
        } nhận booking cho khung giờ ${
          statusTarget?.startTime?.slice(0, 5) ?? ""
        } ngày ${statusTarget?.slotDate ?? ""}?`}
        loading={saving}
        confirmText="Xác nhận"
        onConfirm={changeStatus}
        onClose={() => setStatusTarget(null)}
      />
    </Stack>
  );
}
