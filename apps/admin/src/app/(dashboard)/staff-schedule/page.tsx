"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "sonner";

import {
  bookingRepository,
  type AdminSlot,
  type StaffOption,
} from "@/lib/repositories/booking.repository";

import type { BookingStaff } from "@inspection/contracts";
import { HPageHeader } from "@/components/common/HPageHeader";

export default function StaffSchedulePage() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AdminSlot | null>(null);

  const [slotStaff, setSlotStaff] = useState<BookingStaff[]>([]);
  const [staffId, setStaffId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSlots = async () => {
    setLoading(true);

    try {
      const [slotData, staffData] = await Promise.all([
        bookingRepository.adminSlots({
          date: date || undefined,
        }),
        bookingRepository.staff(),
      ]);

      setSlots(slotData);
      setStaff(staffData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không tải được lịch nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const selectSlot = async (slot: AdminSlot) => {
    setSelectedSlot(slot);
    setStaffId("");

    try {
      const data = await bookingRepository.slotStaff(slot.id);
      setSlotStaff(data);
    } catch {
      toast.error("Không tải được nhân viên của khung giờ");
    }
  };

  const addStaff = async () => {
    if (!selectedSlot || !staffId) return;

    setSaving(true);

    try {
      await bookingRepository.configureStaff(selectedSlot.id, staffId);

      toast.success("Đã bố trí nhân viên");
      await selectSlot(selectedSlot);
      await loadSlots();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể bố trí nhân viên"
      );
    } finally {
      setSaving(false);
    }
  };

  const removeStaff = async (id: string) => {
    if (!selectedSlot) return;

    setSaving(true);

    try {
      await bookingRepository.removeStaff(selectedSlot.id, id);

      toast.success("Đã bỏ nhân viên khỏi khung giờ");
      await selectSlot(selectedSlot);
      await loadSlots();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa nhân viên"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <HPageHeader
        title="Lịch nhân viên phụ trách"
        description="Bố trí nhân viên vào từng khung giờ trước khi mở nhận booking"
        actions={
          <Button variant="outlined" onClick={() => void loadSlots()}>
            Làm mới
          </Button>
        }
      />

      <Card variant="outlined">
        <CardContent>
          <TextField
            type="date"
            size="small"
            label="Ngày đăng kiểm"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            slotProps={{
              inputLabel: { shrink: true } as never,
            }}
          />
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {slots.map((slot) => (
            <Card
              key={slot.id}
              variant="outlined"
              sx={{
                borderColor:
                  selectedSlot?.id === slot.id ? "primary.main" : "divider",
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    spacing: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {slot.centerName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {slot.slotDate} · {slot.startTime.slice(0, 5)} –{" "}
                      {slot.endTime.slice(0, 5)} · {slot.vehicleType}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    sx={{ alignItems: "center", spacing: 1, flexWrap: "wrap" }}
                  >
                    <Chip
                      size="small"
                      label={`Trung tâm: ${slot.centerCapacity}`}
                    />
                    <Chip
                      size="small"
                      color="info"
                      label={`Nhân viên: ${slot.staffCount}`}
                    />
                    <Chip
                      size="small"
                      color={slot.remaining ? "success" : "warning"}
                      label={`Còn ${slot.remaining} suất`}
                    />

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => void selectSlot(slot)}
                    >
                      Bố trí
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {slots.length === 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary">
                  Chưa có khung giờ. Cần tạo lịch của trung tâm trước khi bố trí
                  nhân viên.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {selectedSlot && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nhân viên trong khung giờ {selectedSlot.startTime.slice(0, 5)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Nhân viên"
                size="small"
                value={staffId}
                onChange={(event) => setStaffId(event.target.value)}
              >
                {staff
                  .filter(
                    (person) => !slotStaff.some((item) => item.id === person.id)
                  )
                  .map((person) => (
                    <MenuItem key={person.id} value={person.id}>
                      {person.fullName}
                    </MenuItem>
                  ))}
              </TextField>

              <Button
                variant="contained"
                disabled={!staffId || saving}
                onClick={() => void addStaff()}
                sx={{ minWidth: 120 }}
              >
                Thêm nhân viên
              </Button>
            </Stack>

            <Stack spacing={1} sx={{ mt: 3 }}>
              {slotStaff.map((person) => (
                <Stack
                  key={person.id}
                  direction="row"
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {person.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {person.assignedBookingId
                        ? "Đã được phân công"
                        : "Còn trống"}
                    </Typography>
                  </Box>

                  <Button
                    color="error"
                    size="small"
                    disabled={saving || Boolean(person.assignedBookingId)}
                    onClick={() => void removeStaff(person.id)}
                  >
                    Bỏ
                  </Button>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
