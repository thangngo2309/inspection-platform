"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import type { AdminBookingRow, BookingStaff } from "@inspection/contracts";

import {
  bookingRepository,
  type StaffOption,
} from "@/lib/repositories/booking.repository";

interface AssignBookingDialogProps {
  open: boolean;
  booking: AdminBookingRow | null;
  onClose: () => void;
  onChanged: () => void;
}

export function AssignBookingDialog({
  open,
  booking,
  onClose,
  onChanged,
}: AssignBookingDialogProps) {
  const [staff, setStaff] = useState<BookingStaff[]>([]);
  const [allStaff, setAllStaff] = useState<StaffOption[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [newStaffId, setNewStaffId] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const slotId = booking?.slotId;

  const load = async () => {
    if (!slotId) return;

    setLoading(true);

    try {
      const [assigned, available] = await Promise.all([
        bookingRepository.slotStaff(slotId),
        bookingRepository.staff(),
      ]);

      setStaff(assigned);
      setAllStaff(available);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !slotId) return;

    setSelectedStaffId("");
    setNewStaffId("");
    void load();
    // load dựa trên slotId hiện tại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slotId]);

  const freeStaff = staff.filter((item) => !item.assignedBookingId);

  const addStaff = async () => {
    if (!slotId || !newStaffId) return;

    setSaving(true);

    try {
      await bookingRepository.configureStaff(slotId, newStaffId);

      toast.success("Đã thêm nhân viên vào khung giờ");
      setNewStaffId("");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể thêm nhân viên"
      );
    } finally {
      setSaving(false);
    }
  };

  const assign = async () => {
    if (!booking || !selectedStaffId) return;

    setSaving(true);

    try {
      await bookingRepository.assign(booking.id, selectedStaffId);

      toast.success("Phân công nhân viên thành công");
      onChanged();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể phân công nhân viên"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle component="div">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Phân công nhân viên
        </Typography>

        {booking && (
          <Typography variant="body2" color="text.secondary">
            {booking.code} – {booking.plate}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Nhân viên khả dụng
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                label="Chọn nhân viên phụ trách"
                value={selectedStaffId}
                onChange={(event) => setSelectedStaffId(event.target.value)}
                disabled={Boolean(booking?.staffId)}
              >
                {freeStaff.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.fullName} – {item.employeeCode}
                  </MenuItem>
                ))}
              </TextField>

              {booking?.staffId ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Booking đã được phân công cho {booking.staffName}.
                </Alert>
              ) : freeStaff.length === 0 ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Không còn nhân viên trống. Hãy kiểm tra danh sách nhân viên
                  được bố trí cho khung giờ.
                </Alert>
              ) : null}
            </Box>

            <Box
              sx={{
                borderTop: 1,
                borderColor: "divider",
                pt: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Bố trí thêm nhân viên cho khung giờ
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Chọn nhân viên"
                  value={newStaffId}
                  onChange={(event) => setNewStaffId(event.target.value)}
                >
                  {allStaff
                    .filter((item) => !staff.some((s) => s.id === item.id))
                    .map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.fullName}
                      </MenuItem>
                    ))}
                </TextField>

                <Button
                  variant="outlined"
                  disabled={!newStaffId || saving}
                  onClick={() => void addStaff()}
                  sx={{ minWidth: 110 }}
                >
                  Thêm
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Đã bố trí {staff.length} nhân viên; còn {freeStaff.length} nhân
                viên chưa được phân công.
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={saving}>
          Đóng
        </Button>

        <Button
          variant="contained"
          onClick={() => void assign()}
          disabled={
            saving || loading || !selectedStaffId || Boolean(booking?.staffId)
          }
        >
          {saving ? "Đang xử lý..." : "Xác nhận phân công"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
