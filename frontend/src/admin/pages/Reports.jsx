import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import {
  FileText,
  Filter,
  RotateCcw,
  Printer,
  Building2,
  CalendarDays,
  Wallet,
  ClipboardList,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Hotel,
  Layers3,
  ShieldAlert,
  Clock3,
} from "lucide-react";

export default function Reports() {
  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const isReceptionist = adminUser?.role === "receptionist";
  const canAccessAllHotels =
    adminUser?.role === "boss" ||
    adminUser?.role === "super_admin" ||
    adminUser?.role === "pengawas";

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [userAccessHotels, setUserAccessHotels] = useState([]);
  const [loadingUserAccessHotels, setLoadingUserAccessHotels] = useState(false);

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    hotel_id: "",
    status: "",
    booking_type: "",
    shift: "all",
    payment_method: "all",
    report_view: "all",
  });

  const assignedHotelIds = useMemo(() => {
    if (canAccessAllHotels) return [];

    const sourceHotels =
      Array.isArray(userAccessHotels) && userAccessHotels.length > 0
        ? userAccessHotels
        : Array.isArray(adminUser?.hotels)
        ? adminUser.hotels
        : [];

    return sourceHotels.map((hotel) => String(hotel?.id)).filter(Boolean);
  }, [adminUser, canAccessAllHotels, userAccessHotels]);

  const needsFolderSelection = !canAccessAllHotels;
  const hasSelectedFolder = canAccessAllHotels ? true : !!filters.hotel_id;

  useEffect(() => {
    if (isReceptionist) {
      setLoading(false);
      return;
    }

    fetchUserAccessHotels();
    fetchReportData();
  }, []);

  const fetchUserAccessHotels = async () => {
    if (!adminUser?.id || canAccessAllHotels) {
      setUserAccessHotels(Array.isArray(adminUser?.hotels) ? adminUser.hotels : []);
      return;
    }

    try {
      setLoadingUserAccessHotels(true);

      const response = await api.get("/admin/users/admin");
      const usersData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      const currentUser = usersData.find(
        (user) => String(user.id) === String(adminUser.id)
      );

      setUserAccessHotels(Array.isArray(currentUser?.hotels) ? currentUser.hotels : []);
    } catch (error) {
      console.error("GAGAL AMBIL HOTEL AKSES USER:", error.response?.data || error);
      setUserAccessHotels(Array.isArray(adminUser?.hotels) ? adminUser.hotels : []);
    } finally {
      setLoadingUserAccessHotels(false);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const [bookingRes, hotelRes] = await Promise.all([
        api.get("/admin/bookings", {
          params: {
            admin_user_id: adminUser?.id,
          },
        }),
        api.get("/admin/hotels"),
      ]);

      const bookingData = Array.isArray(bookingRes.data?.data)
        ? bookingRes.data.data
        : Array.isArray(bookingRes.data)
        ? bookingRes.data
        : [];

      const hotelData = Array.isArray(hotelRes.data?.data)
        ? hotelRes.data.data
        : Array.isArray(hotelRes.data)
        ? hotelRes.data
        : [];

      setBookings(bookingData);
      setHotels(hotelData);
    } catch (error) {
      console.error("GAGAL AMBIL DATA REPORT:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const accessibleHotels = useMemo(() => {
    if (canAccessAllHotels) {
      return hotels;
    }

    if (assignedHotelIds.length > 0) {
      return hotels.filter((hotel) => assignedHotelIds.includes(String(hotel.id)));
    }

    return [];
  }, [hotels, assignedHotelIds, canAccessAllHotels]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFolderClick = (hotelId) => {
    setFilters((prev) => ({
      ...prev,
      hotel_id: String(hotelId),
    }));
  };

  const resetFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      hotel_id: canAccessAllHotels ? "" : filters.hotel_id,
      status: "",
      booking_type: "",
      shift: "all",
      payment_method: "all",
      report_view: "all",
    });
  };

  const toSafeDate = (value) => {
    if (!value) return null;

    const normalized = String(value).includes("T")
      ? String(value)
      : String(value).replace(" ", "T");

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getOperationalMetaFromNote = (note) => {
    const raw = String(note || "");
    const match = raw.match(
      /\[RR_OPS\s+actual_check_in="([^"]*)"\s+expected_check_out="([^"]*)"\]/i
    );

    return {
      actualCheckIn: match?.[1] || null,
      expectedCheckOut: match?.[2] || null,
    };
  };

  const getOperationalMeta = (booking) => {
    const noteMeta = getOperationalMetaFromNote(booking?.payment_note);

    return {
      actualCheckIn:
        booking?.actual_check_in ||
        booking?.check_in_actual ||
        booking?.actual_checkin_at ||
        booking?.actual_checked_in_at ||
        booking?.checked_in_at ||
        booking?.checkin_at ||
        booking?.paid_at ||
        booking?.payment?.paid_at ||
        booking?.transaction?.paid_at ||
        noteMeta.actualCheckIn ||
        null,
      expectedCheckOut:
        booking?.expected_check_out ||
        booking?.expected_checkout ||
        booking?.target_check_out ||
        booking?.target_checkout ||
        booking?.checkout_target ||
        booking?.operational_check_out ||
        booking?.actual_check_out_target ||
        booking?.payment?.expected_check_out ||
        booking?.transaction?.expected_check_out ||
        noteMeta.expectedCheckOut ||
        null,
    };
  };

  const getActualCheckInTime = (booking) => {
    const meta = getOperationalMeta(booking);
    return meta.actualCheckIn || booking?.check_in || null;
  };

  const getTargetCheckOutTime = (booking) => {
    const meta = getOperationalMeta(booking);
    return (
      booking?.actual_check_out ||
      booking?.check_out_actual ||
      booking?.actual_checkout_at ||
      booking?.checked_out_at ||
      booking?.checkout_at ||
      meta.expectedCheckOut ||
      booking?.check_out ||
      null
    );
  };

  const isWithinDateRange = (booking) => {
    const actualCheckIn = toSafeDate(getActualCheckInTime(booking));
    if (!actualCheckIn) return false;

    if (filters.start_date) {
      const start = new Date(filters.start_date);
      start.setHours(0, 0, 0, 0);
      if (actualCheckIn < start) return false;
    }

    if (filters.end_date) {
      const end = new Date(filters.end_date);
      end.setHours(23, 59, 59, 999);
      if (actualCheckIn > end) return false;
    }

    return true;
  };

  const isMatchShift = (booking) => {
    if (filters.shift === "all") return true;

    const actualCheckIn = toSafeDate(getActualCheckInTime(booking));
    if (!actualCheckIn) return false;

    const hour = actualCheckIn.getHours();

    if (filters.shift === "pagi") {
      return hour >= 0 && hour < 12;
    }

    if (filters.shift === "malam") {
      return hour >= 12 && hour < 24;
    }

    return true;
  };

  const getHotelName = (hotelId) => {
    if (!hotelId) return "Semua Hotel";
    const hotel = hotels.find((item) => String(item.id) === String(hotelId));
    return hotel?.name || "Hotel Tidak Ditemukan";
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = toSafeDate(value);
    if (!date) return "-";

    return date.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const date = toSafeDate(value);
    if (!date) return "-";

    return date.toLocaleDateString("id-ID", {
      dateStyle: "medium",
    });
  };

  const getShiftLabel = (value) => {
    if (!value) return "Semua";
    if (value === "all") return "Semua Shift";
    if (value === "pagi") return "Shift Pagi (00:00 - 11:59)";
    if (value === "malam") return "Shift Malam (12:00 - 23:59)";
    return value;
  };

  const getBookingTypeLabel = (value, fallback = "-") => {
    const type = String(value || "").trim().toLowerCase();

    if (!type) return fallback;
    if (type === "transit") return "Transit";
    if (type === "overnight") return "Full Day";
    if (type === "full_day" || type === "full day" || type === "fullday") {
      return "Full Day";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusLabel = (value) => {
    const status = String(value || "").trim().toLowerCase();

    if (!status) return "-";
    if (status === "pending") return "Pending";
    if (status === "confirmed") return "Confirmed";
    if (status === "checked_in") return "Checked In";
    if (status === "checked_out") return "Checked Out";
    if (status === "cleaning") return "Cleaning";
    if (status === "completed") return "Completed";
    if (status === "cancelled" || status === "canceled") return "Cancelled";
    if (status === "rejected") return "Rejected";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPaymentStatusLabel = (booking) => {
    const status = String(booking?.payment_status || "").trim().toLowerCase();

    if (status === "paid") return "Lunas";
    if (status === "refunded") return "Refund";
    if (status === "unpaid") return "Belum Lunas";
    if (status === "pending") return "Menunggu Bayar";
    if (!status) return "Belum Lunas";

    return String(booking?.payment_status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getRawPaymentMethod = (booking) => {
    return (
      booking?.payment_method ||
      booking?.payment_type ||
      booking?.payment_channel ||
      booking?.method_payment ||
      booking?.paymentMethod ||
      booking?.payment?.method ||
      booking?.payment?.payment_method ||
      booking?.transaction?.payment_method ||
      ""
    );
  };

  const getPaymentMethodKey = (booking) => {
    const rawMethod = getRawPaymentMethod(booking);
    const method = String(rawMethod || "").trim().toLowerCase();

    if (!method) {
      const paymentStatus = String(booking?.payment_status || "").toLowerCase();

      if (paymentStatus === "paid" || paymentStatus === "refunded") {
        return "cash";
      }

      return "unknown";
    }

    if (
      method === "cash" ||
      method === "ots" ||
      method.includes("cash") ||
      method.includes("tunai") ||
      method.includes("on the spot") ||
      method.includes("onsite") ||
      method.includes("hotel")
    ) {
      return "cash";
    }

    if (
      method.includes("transfer") ||
      method.includes("bank") ||
      method === "tf" ||
      method.includes("qris") ||
      method.includes("qr")
    ) {
      return "digital";
    }

    if (method.includes("manual")) {
      return "manual";
    }

    return "other";
  };

  const getPaymentMethodLabelByKey = (key) => {
    if (!key || key === "all") return "Semua Metode";
    if (key === "cash") return "Tunai / OTS";
    if (key === "digital") return "Transfer / QRIS";
    if (key === "manual") return "Manual";
    if (key === "unknown") return "Belum Dipilih";
    if (key === "other") return "Lainnya";
    return key;
  };

  const getPaymentMethodLabel = (booking) => {
    const rawMethod = getRawPaymentMethod(booking);
    const method = String(rawMethod || "").trim().toLowerCase();
    const key = getPaymentMethodKey(booking);

    if (!method) {
      if (key === "cash") return "Tunai / OTS";
      return "-";
    }

    if (key === "cash") return "Tunai / OTS";
    if (method.includes("qris") || method.includes("qr")) return "QRIS";
    if (method.includes("transfer") || method.includes("bank") || method === "tf") {
      return "Transfer Bank";
    }
    if (key === "digital") return "Transfer / QRIS";
    if (key === "manual") return "Manual";

    return String(rawMethod)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getReportViewLabel = (value) => {
    if (!value || value === "all") return "Booking + Denda";
    if (value === "booking") return "Booking saja";
    if (value === "penalty") return "Denda saja";
    return value;
  };

  const getNumberValue = (...values) => {
    for (const value of values) {
      const numericValue = Number(value || 0);

      if (!Number.isNaN(numericValue) && numericValue > 0) {
        return numericValue;
      }
    }

    return 0;
  };

  const getRefundAmount = (booking) => {
    return getNumberValue(
      booking?.refund_amount,
      booking?.refunded_amount,
      booking?.payment?.refund_amount,
      booking?.transaction?.refund_amount
    );
  };

  const getDiscountPercent = (booking) => {
    return Math.min(
      100,
      getNumberValue(
        booking?.discount_percent,
        booking?.manual_discount_percent,
        booking?.discount_percentage,
        booking?.discount_rate,
        booking?.payment?.discount_percent,
        booking?.transaction?.discount_percent
      )
    );
  };

  const getDiscountAmount = (booking) => {
    const explicitDiscountAmount = getNumberValue(
      booking?.discount_amount,
      booking?.discount_value,
      booking?.manual_discount_amount,
      booking?.booking_discount_amount,
      booking?.voucher_discount_amount,
      booking?.promo_discount_amount,
      booking?.payment?.discount_amount,
      booking?.transaction?.discount_amount
    );

    if (explicitDiscountAmount > 0) {
      return explicitDiscountAmount;
    }

    const discountPercent = getDiscountPercent(booking);

    if (discountPercent <= 0) {
      return 0;
    }

    const originalAmount = getNumberValue(
      booking?.original_total_price,
      booking?.normal_total_price,
      booking?.subtotal_price,
      booking?.gross_total,
      booking?.gross_amount,
      booking?.price_before_discount,
      booking?.room_price_before_discount,
      booking?.payment?.gross_amount,
      booking?.transaction?.gross_amount
    );

    if (originalAmount > 0) {
      return Math.round((originalAmount * discountPercent) / 100);
    }

    const finalAmount = getNumberValue(
      booking?.total_price,
      booking?.paid_amount,
      booking?.amount_paid,
      booking?.payment?.paid_amount,
      booking?.transaction?.paid_amount
    );

    if (finalAmount > 0 && discountPercent < 100) {
      return Math.round((finalAmount * discountPercent) / (100 - discountPercent));
    }

    return 0;
  };

  const getPenaltyTypeLabel = (value) => {
    const type = String(value || "").trim().toLowerCase();

    if (!type) return "Denda Operasional";
    if (type === "smoking") return "Merokok di kamar";
    if (type === "damage") return "Kerusakan fasilitas";
    if (type === "lost_item") return "Barang hotel hilang";
    if (type === "extra_cleaning") return "Extra cleaning";
    if (type === "late_checkout") return "Telat check-out";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPenaltyInputBy = (penalty, booking) => {
    return (
      penalty?.creator?.name ||
      penalty?.created_by_user?.name ||
      penalty?.createdBy?.name ||
      penalty?.admin?.name ||
      penalty?.user?.name ||
      booking?.creator?.name ||
      booking?.created_by_user?.name ||
      "-"
    );
  };

  const getPenaltyItems = (booking) => {
    if (Array.isArray(booking?.penalties) && booking.penalties.length > 0) {
      return booking.penalties
        .map((penalty, index) => {
          const amount = Number(penalty?.amount || penalty?.total || 0);
          const title =
            penalty?.title ||
            penalty?.name ||
            getPenaltyTypeLabel(penalty?.penalty_type || penalty?.type);
          const note =
            penalty?.note ||
            penalty?.reason ||
            penalty?.description ||
            penalty?.keterangan ||
            title ||
            "-";

          return {
            id: `${booking?.id || "booking"}-${penalty?.id || index}`,
            booking,
            penalty,
            amount: Number.isNaN(amount) ? 0 : amount,
            title: title || "Denda Operasional",
            note,
            type: getPenaltyTypeLabel(penalty?.penalty_type || penalty?.type || title),
            inputBy: getPenaltyInputBy(penalty, booking),
            createdAt: penalty?.created_at || penalty?.createdAt || booking?.updated_at || null,
          };
        })
        .filter((item) => item.amount > 0 || item.title || item.note);
    }

    const amount = getNumberValue(
      booking?.penalty_amount,
      booking?.fine_amount,
      booking?.denda_amount,
      booking?.late_fee,
      booking?.extra_charge,
      booking?.additional_fee,
      booking?.damage_fee,
      booking?.booking_penalty?.amount,
      booking?.penalty?.amount,
      booking?.fine?.amount
    );

    if (amount <= 0) return [];

    const title =
      booking?.penalty_title ||
      booking?.fine_title ||
      booking?.denda_title ||
      booking?.booking_penalty?.title ||
      booking?.penalty?.title ||
      booking?.fine?.title ||
      "Denda Operasional";

    const note =
      booking?.penalty_reason ||
      booking?.fine_reason ||
      booking?.denda_reason ||
      booking?.late_fee_reason ||
      booking?.extra_charge_reason ||
      booking?.damage_reason ||
      booking?.booking_penalty?.reason ||
      booking?.penalty?.reason ||
      booking?.fine?.reason ||
      title;

    return [
      {
        id: `${booking?.id || "booking"}-fallback-penalty`,
        booking,
        penalty: null,
        amount,
        title,
        note,
        type: getPenaltyTypeLabel(booking?.penalty_type || booking?.fine_type || title),
        inputBy:
          booking?.penalty_creator?.name ||
          booking?.fine_creator?.name ||
          booking?.creator?.name ||
          booking?.created_by_user?.name ||
          "-",
        createdAt: booking?.penalty_created_at || booking?.fine_created_at || booking?.updated_at || null,
      },
    ];
  };

  const getPenaltyAmount = (booking) => {
    return getPenaltyItems(booking).reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0
    );
  };

  const isFinancialReportRecord = (booking) => {
    const paymentStatus = String(booking?.payment_status || "").trim().toLowerCase();
    const paidAmount = getNumberValue(
      booking?.paid_amount,
      booking?.amount_paid,
      booking?.payment?.paid_amount,
      booking?.transaction?.paid_amount
    );
    const refundAmount = getRefundAmount(booking);

    return paymentStatus === "paid" || paymentStatus === "refunded" || paidAmount > 0 || refundAmount > 0;
  };

  const getBookingRevenueAmount = (booking) => {
    if (!isFinancialReportRecord(booking)) return 0;

    const paidAmount = getNumberValue(
      booking?.paid_amount,
      booking?.amount_paid,
      booking?.payment?.paid_amount,
      booking?.transaction?.paid_amount
    );

    if (paidAmount > 0) return paidAmount;

    return Number(booking?.total_price || 0);
  };

  const getRowNetTotal = (booking) => {
    return getBookingRevenueAmount(booking) - getRefundAmount(booking);
  };

  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchDate = isWithinDateRange(booking);

      const matchHotel =
        !filters.hotel_id ||
        String(booking.hotel_id || booking.hotel?.id) === String(filters.hotel_id);

      const matchStatus =
        !filters.status || String(booking.status) === String(filters.status);

      const matchType =
        !filters.booking_type ||
        String(booking.booking_type) === String(filters.booking_type);

      const matchShift = isMatchShift(booking);

      const matchPaymentMethod =
        !filters.payment_method ||
        filters.payment_method === "all" ||
        getPaymentMethodKey(booking) === filters.payment_method;

      return (
        matchDate &&
        matchHotel &&
        matchStatus &&
        matchType &&
        matchShift &&
        matchPaymentMethod
      );
    });
  }, [bookings, filters]);

  const reportBookings = useMemo(() => {
    return filteredBookings.filter((booking) => isFinancialReportRecord(booking));
  }, [filteredBookings]);

  const reportPenaltyRows = useMemo(() => {
    return filteredBookings.flatMap((booking) => getPenaltyItems(booking));
  }, [filteredBookings]);

  const summary = useMemo(() => {
    const totalBooking = reportBookings.length;

    const totalPaid = reportBookings.filter(
      (item) => String(item.payment_status || "").toLowerCase() === "paid"
    ).length;

    const totalCheckIn = reportBookings.filter(
      (item) => item.status === "checked_in"
    ).length;

    const totalCancelled = reportBookings.filter(
      (item) => item.status === "cancelled" || item.status === "canceled"
    ).length;

    const totalPendapatan = reportBookings.reduce(
      (sum, item) => sum + getBookingRevenueAmount(item),
      0
    );

    const totalDiskon = reportBookings.reduce(
      (sum, item) => sum + getDiscountAmount(item),
      0
    );

    const totalDenda = reportPenaltyRows.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalRefund = reportBookings.reduce(
      (sum, item) => sum + getRefundAmount(item),
      0
    );

    const totalBersih = totalPendapatan + totalDenda - totalRefund;

    return {
      totalBooking,
      totalPaid,
      totalCheckIn,
      totalCancelled,
      totalPendapatan,
      totalDiskon,
      totalDenda,
      totalRefund,
      totalBersih,
    };
  }, [reportBookings, reportPenaltyRows]);

  const showBookingReport =
    filters.report_view === "all" || filters.report_view === "booking";

  const showPenaltyReport =
    filters.report_view === "all" || filters.report_view === "penalty";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const bookingRowsHtml = reportBookings
      .map((booking, index) => {
        const guestName = booking.user?.name || booking.guest_name || "Tamu";
        const hotelName = booking.hotel?.name || "-";
        const roomName = booking.room?.name || booking.room?.type || "-";

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(booking.booking_code || "-")}</td>
            <td>${escapeHtml(guestName)}</td>
            <td>${escapeHtml(booking.guest_phone || "-")}</td>
            <td>${escapeHtml(hotelName)}</td>
            <td>${escapeHtml(roomName)}</td>
            <td>${escapeHtml(getBookingTypeLabel(booking.booking_type))}</td>
            <td>${escapeHtml(formatDateTime(getActualCheckInTime(booking)))}</td>
            <td>${escapeHtml(formatDateTime(getTargetCheckOutTime(booking)))}</td>
            <td>${escapeHtml(getPaymentMethodLabel(booking))}</td>
            <td>${escapeHtml(getPaymentStatusLabel(booking))}</td>
            <td>${escapeHtml(formatRupiah(getBookingRevenueAmount(booking)))}</td>
            <td>${escapeHtml(formatRupiah(getDiscountAmount(booking)))}</td>
            <td>${escapeHtml(formatRupiah(getPenaltyAmount(booking)))}</td>
            <td>${escapeHtml(
              getPenaltyItems(booking)
                .map((item) => item.note || item.title)
                .filter(Boolean)
                .join(", ") || "-"
            )}</td>
            <td>${escapeHtml(formatRupiah(getRefundAmount(booking)))}</td>
            <td>${escapeHtml(formatRupiah(getRowNetTotal(booking)))}</td>
          </tr>
        `;
      })
      .join("");

    const penaltyRowsHtml = reportPenaltyRows
      .map((item, index) => {
        const booking = item.booking;
        const guestName = booking?.user?.name || booking?.guest_name || "Tamu";
        const hotelName = booking?.hotel?.name || "-";

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(booking?.booking_code || "-")}</td>
            <td>${escapeHtml(guestName)}</td>
            <td>${escapeHtml(hotelName)}</td>
            <td>${escapeHtml(item.type || item.title || "Denda Operasional")}</td>
            <td>${escapeHtml(item.note || item.title || "-")}</td>
            <td>${escapeHtml(item.inputBy || "-")}</td>
            <td>${escapeHtml(formatDateTime(item.createdAt))}</td>
            <td>${escapeHtml(formatRupiah(item.amount || 0))}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <html>
        <head>
          <title>Laporan Keuangan Booking ReadyRoom</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 12mm;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 0;
              color: #1f2937;
            }

            .header {
              margin-bottom: 18px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 14px;
            }

            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 6px 0;
            }

            .subtitle {
              color: #6b7280;
              margin: 0;
              font-size: 13px;
              line-height: 1.5;
            }

            .meta {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px 14px;
              margin-top: 14px;
              font-size: 12px;
              color: #374151;
              line-height: 1.5;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin: 18px 0;
            }

            .card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 10px;
              background: #f9fafb;
            }

            .card-title {
              font-size: 11px;
              color: #6b7280;
              margin-bottom: 6px;
            }

            .card-value {
              font-size: 16px;
              font-weight: bold;
            }

            .section-title {
              margin: 22px 0 8px;
              font-size: 16px;
              font-weight: bold;
              color: #111827;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 10px;
            }

            th, td {
              border: 1px solid #e5e7eb;
              padding: 6px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background: #f3f4f6;
              font-weight: bold;
              white-space: nowrap;
            }

            .note {
              margin-top: 12px;
              padding: 10px;
              border-radius: 12px;
              background: #fff7ed;
              border: 1px solid #fed7aa;
              color: #9a3412;
              font-size: 11px;
              line-height: 1.5;
            }

            .footer {
              margin-top: 18px;
              font-size: 11px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="title">Laporan Keuangan Booking ReadyRoom</p>
            <p class="subtitle">
              Laporan ini memakai Jam Masuk Tamu / check-in aktual sebagai patokan tanggal dan shift.
              Booking pending / belum lunas tidak dihitung sebagai pendapatan.
            </p>

            <div class="meta">
              <div><strong>Hotel / Cabang:</strong> ${escapeHtml(getHotelName(filters.hotel_id))}</div>
              <div><strong>Tanggal Awal:</strong> ${escapeHtml(filters.start_date ? formatDateOnly(filters.start_date) : "Semua")}</div>
              <div><strong>Tanggal Akhir:</strong> ${escapeHtml(filters.end_date ? formatDateOnly(filters.end_date) : "Semua")}</div>
              <div><strong>Status Booking:</strong> ${escapeHtml(filters.status ? getStatusLabel(filters.status) : "Semua")}</div>
              <div><strong>Jenis Booking:</strong> ${escapeHtml(getBookingTypeLabel(filters.booking_type, "Semua"))}</div>
              <div><strong>Shift:</strong> ${escapeHtml(getShiftLabel(filters.shift))}</div>
              <div><strong>Metode Pembayaran:</strong> ${escapeHtml(getPaymentMethodLabelByKey(filters.payment_method))}</div>
              <div><strong>Isi Laporan:</strong> ${escapeHtml(getReportViewLabel(filters.report_view))}</div>
              <div><strong>Patokan Tanggal:</strong> Jam Masuk Tamu</div>
              <div><strong>Dicetak Pada:</strong> ${escapeHtml(
                new Date().toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              )}</div>
            </div>
          </div>

          <div class="summary">
            <div class="card">
              <div class="card-title">Transaksi Booking</div>
              <div class="card-value">${summary.totalBooking}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Paid</div>
              <div class="card-value">${summary.totalPaid}</div>
            </div>
            <div class="card">
              <div class="card-title">Pendapatan Booking</div>
              <div class="card-value">${escapeHtml(formatRupiah(summary.totalPendapatan))}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Diskon</div>
              <div class="card-value">${escapeHtml(formatRupiah(summary.totalDiskon))}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Denda</div>
              <div class="card-value">${escapeHtml(formatRupiah(summary.totalDenda))}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Refund</div>
              <div class="card-value">${escapeHtml(formatRupiah(summary.totalRefund))}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Bersih</div>
              <div class="card-value">${escapeHtml(formatRupiah(summary.totalBersih))}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Check In</div>
              <div class="card-value">${summary.totalCheckIn}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Cancelled</div>
              <div class="card-value">${summary.totalCancelled}</div>
            </div>
          </div>

          <div class="note">
            Total Bersih = Pendapatan Booking + Total Denda - Total Refund.
            Diskon ditampilkan sebagai informasi potongan booking dan tidak dikurangi lagi dari Total Bersih
            jika Pendapatan Booking sudah memakai nominal akhir transaksi.
            Denda dipisahkan dalam tabel khusus agar mudah dibaca oleh boss dan keuangan.
          </div>

          ${
            showBookingReport
              ? `
                <p class="section-title">Laporan Booking</p>
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode Booking</th>
                      <th>Nama Tamu</th>
                      <th>No HP</th>
                      <th>Hotel</th>
                      <th>Kamar</th>
                      <th>Jenis</th>
                      <th>Jam Masuk Tamu</th>
                      <th> Check-out</th>
                      <th>Metode</th>
                      <th>Status Bayar</th>
                      <th>Pendapatan</th>
                      <th>Diskon</th>
                      <th>Denda</th>
                      <th>Alasan Denda</th>
                      <th>Refund</th>
                      <th>Total Booking Bersih</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      bookingRowsHtml ||
                      `<tr><td colspan="17">Tidak ada data transaksi lunas / refund pada filter ini.</td></tr>`
                    }
                  </tbody>
                </table>
              `
              : ""
          }

          ${
            showPenaltyReport
              ? `
                <p class="section-title">Laporan Denda</p>
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode Booking</th>
                      <th>Nama Tamu</th>
                      <th>Hotel</th>
                      <th>Jenis Denda</th>
                      <th>Alasan / Catatan</th>
                      <th>Input Oleh</th>
                      <th>Tanggal Input</th>
                      <th>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      penaltyRowsHtml ||
                      `<tr><td colspan="9">Tidak ada data denda pada filter ini.</td></tr>`
                    }
                  </tbody>
                </table>
              `
              : ""
          }

          <div class="footer">
            Laporan ini dibuat dari sistem ReadyRoom.
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (isReceptionist) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="flex-1">
          <Topbar />

          <div className="p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold text-red-600 mb-2">
                Panel Admin
              </p>
              <h1 className="text-3xl font-bold text-gray-800">
                Laporan Booking
              </h1>
              <p className="text-gray-500 mt-1">
                Halaman ini khusus boss, super admin, admin, atau pengawas.
              </p>
            </div>

            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <ShieldAlert size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-800">
                    Akses report dibatasi
                  </h2>
                  <p className="mt-2 text-sm text-red-700 leading-7 max-w-2xl">
                    Role receptionist hanya boleh masuk ke Booking List dan Booking Calendar.
                    Untuk melihat laporan, gunakan akun admin, boss, super admin, atau pengawas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-800">
              Laporan Booking
            </h1>
            <p className="text-gray-500 mt-1">
              Lihat ringkasan transaksi booking berdasarkan jam masuk tamu,
              laporan denda terpisah, lalu print atau simpan ke PDF.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="mb-4 flex items-center gap-2">
              <Hotel size={18} className="text-red-500" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">Folder Cabang</h2>
                <p className="text-sm text-gray-500">
                  Klik cabang untuk membuka laporan sesuai akses user.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {canAccessAllHotels && (
                <button
                  type="button"
                  onClick={() => handleFolderClick("")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                    !filters.hotel_id
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Layers3 size={18} />
                  Semua Cabang
                </button>
              )}

              {accessibleHotels.map((hotel) => (
                <button
                  key={hotel.id}
                  type="button"
                  onClick={() => handleFolderClick(hotel.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                    String(filters.hotel_id) === String(hotel.id)
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Building2 size={17} />
                  {hotel.name}
                </button>
              ))}
            </div>
          </div>

          {!hasSelectedFolder && needsFolderSelection && (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Hotel size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Pilih cabang dulu</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    Klik salah satu folder cabang di atas untuk membuka isi laporan sesuai akses user ini.
                  </p>
                  {loadingUserAccessHotels && (
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      Sedang memuat akses cabang user...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {hasSelectedFolder && (
            <>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                  <Filter size={18} className="text-red-500" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Filter Laporan
                    </h2>
                    <p className="text-sm text-gray-500">
                      Tanggal dan shift memakai Jam Masuk Tamu / check-in aktual.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Awal
                    </label>
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) =>
                        handleFilterChange("start_date", e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) =>
                        handleFilterChange("end_date", e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Booking
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="">Semua Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Booking
                    </label>
                    <select
                      value={filters.booking_type}
                      onChange={(e) =>
                        handleFilterChange("booking_type", e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="">Semua Jenis</option>
                      <option value="transit">Transit</option>
                      <option value="overnight">Full Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shift Bisnis
                    </label>
                    <div className="relative">
                      <Clock3
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={filters.shift}
                        onChange={(e) => handleFilterChange("shift", e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      >
                        <option value="all">Semua Shift</option>
                        <option value="pagi">Shift Pagi (00:00 - 11:59)</option>
                        <option value="malam">Shift Malam (12:00 - 23:59)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metode Pembayaran
                    </label>
                    <select
                      value={filters.payment_method}
                      onChange={(e) =>
                        handleFilterChange("payment_method", e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="all">Semua Metode</option>
                      <option value="cash">Tunai / OTS</option>
                      <option value="digital">Transfer / QRIS</option>
                      <option value="manual">Manual</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Isi Laporan / Print
                    </label>
                    <select
                      value={filters.report_view}
                      onChange={(e) =>
                        handleFilterChange("report_view", e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="all">Booking + Denda</option>
                      <option value="booking">Booking saja</option>
                      <option value="penalty">Denda saja</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    type="button"
                    onClick={fetchReportData}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                  >
                    <RefreshCw size={18} />
                    Tampilkan Laporan
                  </button>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gray-200 px-5 py-3 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
                  >
                    <Printer size={18} />
                    Print / Simpan PDF
                  </button>
                </div>

                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                <SummaryCard
                  icon={<ClipboardList size={18} />}
                  title="Transaksi Booking"
                  value={loading ? "..." : summary.totalBooking}
                />
                <SummaryCard
                  icon={<CheckCircle2 size={18} />}
                  title="Total Paid"
                  value={loading ? "..." : summary.totalPaid}
                />
                <SummaryCard
                  icon={<CalendarDays size={18} />}
                  title="Total Check In"
                  value={loading ? "..." : summary.totalCheckIn}
                />
                <SummaryCard
                  icon={<XCircle size={18} />}
                  title="Total Cancelled"
                  value={loading ? "..." : summary.totalCancelled}
                />
                <SummaryCard
                  icon={<Wallet size={18} />}
                  title="Pendapatan Booking"
                  value={loading ? "..." : formatRupiah(summary.totalPendapatan)}
                />
                <SummaryCard
                  icon={<Wallet size={18} />}
                  title="Total Diskon"
                  value={loading ? "..." : formatRupiah(summary.totalDiskon)}
                />
                <SummaryCard
                  icon={<Wallet size={18} />}
                  title="Total Denda"
                  value={loading ? "..." : formatRupiah(summary.totalDenda)}
                />
                <SummaryCard
                  icon={<Wallet size={18} />}
                  title="Total Refund"
                  value={loading ? "..." : formatRupiah(summary.totalRefund)}
                />
                <SummaryCard
                  icon={<Wallet size={18} />}
                  title="Total Bersih"
                  value={loading ? "..." : formatRupiah(summary.totalBersih)}
                />
              </div>

              {showBookingReport && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-red-500" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Detail Laporan Booking
                      </h2>
                      <p className="text-sm text-gray-500">
                        Menggunakan Jam Masuk Tamu dan Target Check-out dari operasional.
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Total data tampil: {reportBookings.length}
                  </div>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-gray-500">
                    Memuat data laporan...
                  </div>
                ) : reportBookings.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <FileText size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tidak ada data transaksi lunas / refund
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Coba ubah filter tanggal, status, jenis booking, shift, atau metode pembayaran.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <table className="min-w-[1680px] border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-sm text-gray-500">
                          <th className="px-4">Kode</th>
                          <th className="px-4">Tamu</th>
                          <th className="px-4">Hotel</th>
                          <th className="px-4">Kamar</th>
                          <th className="px-4">Jenis</th>
                          <th className="px-4"> Chekin</th>
                          <th className="px-4">Check-out</th>
                          <th className="px-4">Metode</th>
                          <th className="px-4">Status</th>
                          <th className="px-4">Pendapatan</th>
                          <th className="px-4">Diskon</th>
                          <th className="px-4">Denda</th>
                          <th className="px-4">Alasan Denda</th>
                          <th className="px-4">Refund</th>
                          <th className="px-4">Total Booking Bersih</th>
                        </tr>
                      </thead>

                      <tbody>
                        {reportBookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="bg-gray-50 border border-gray-100 rounded-2xl"
                          >
                            <td className="px-4 py-4 font-semibold text-gray-800">
                              {booking.booking_code || "-"}
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-medium text-gray-800">
                                {booking.user?.name || booking.guest_name || "Tamu"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.guest_phone || "-"}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <div className="inline-flex items-center gap-2 text-gray-700">
                                <Building2 size={14} className="text-red-500" />
                                {booking.hotel?.name || "-"}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-gray-700">
                              {booking.room?.name || booking.room?.type || "-"}
                            </td>

                            <td className="px-4 py-4 text-gray-700">
                              {getBookingTypeLabel(booking.booking_type)}
                            </td>

                            <td className="px-4 py-4 text-gray-700">
                              {formatDateTime(getActualCheckInTime(booking))}
                            </td>

                            <td className="px-4 py-4 text-gray-700">
                              {formatDateTime(getTargetCheckOutTime(booking))}
                            </td>

                            <td className="px-4 py-4 font-semibold text-gray-700">
                              {getPaymentMethodLabel(booking)}
                            </td>

                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-800">
                                  {getPaymentStatusLabel(booking)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getStatusLabel(booking.status)}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4 font-semibold text-gray-800">
                              {formatRupiah(getBookingRevenueAmount(booking))}
                            </td>

                            <td className="px-4 py-4 font-semibold text-orange-700">
                              {formatRupiah(getDiscountAmount(booking))}
                            </td>

                            <td className="px-4 py-4 font-semibold text-red-700">
                              {formatRupiah(getPenaltyAmount(booking))}
                            </td>

                            <td className="px-4 py-4 text-gray-700 max-w-[260px]">
                              <span className="line-clamp-3">
                                {getPenaltyItems(booking)
                                  .map((item) => item.note || item.title)
                                  .filter(Boolean)
                                  .join(", ") || "-"}
                              </span>
                            </td>

                            <td className="px-4 py-4 font-semibold text-gray-800">
                              {formatRupiah(getRefundAmount(booking))}
                            </td>

                            <td className="px-4 py-4 font-bold text-gray-900">
                              {formatRupiah(getRowNetTotal(booking))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              )}

              {showPenaltyReport && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Wallet size={18} className="text-red-500" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Laporan Denda
                      </h2>
                      <p className="text-sm text-gray-500">
                        Denda dibuat terpisah supaya boss dan keuangan lebih mudah membaca.
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Total data denda: {reportPenaltyRows.length}
                  </div>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-gray-500">
                    Memuat data denda...
                  </div>
                ) : reportPenaltyRows.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <Wallet size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tidak ada data denda
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Denda yang sudah ditambahkan dari Booking List akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <table className="min-w-[1100px] border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-sm text-gray-500">
                          <th className="px-4">Kode</th>
                          <th className="px-4">Tamu</th>
                          <th className="px-4">Hotel</th>
                          <th className="px-4">Jenis Denda</th>
                          <th className="px-4">Alasan / Catatan</th>
                          <th className="px-4">Input Oleh</th>
                          <th className="px-4">Tanggal Input</th>
                          <th className="px-4">Nominal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {reportPenaltyRows.map((item) => {
                          const booking = item.booking;

                          return (
                            <tr
                              key={item.id}
                              className="bg-red-50/70 border border-red-100 rounded-2xl"
                            >
                              <td className="px-4 py-4 font-semibold text-gray-800">
                                {booking?.booking_code || "-"}
                              </td>

                              <td className="px-4 py-4">
                                <p className="font-medium text-gray-800">
                                  {booking?.user?.name || booking?.guest_name || "Tamu"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking?.guest_phone || "-"}
                                </p>
                              </td>

                              <td className="px-4 py-4 text-gray-700">
                                {booking?.hotel?.name || "-"}
                              </td>

                              <td className="px-4 py-4 font-semibold text-gray-800">
                                {item.type || item.title || "Denda Operasional"}
                              </td>

                              <td className="px-4 py-4 text-gray-700 max-w-[320px]">
                                <span className="line-clamp-3">
                                  {item.note || item.title || "-"}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-gray-700">
                                {item.inputBy || "-"}
                              </td>

                              <td className="px-4 py-4 text-gray-700">
                                {formatDateTime(item.createdAt)}
                              </td>

                              <td className="px-4 py-4 font-bold text-red-700">
                                {formatRupiah(item.amount || 0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>

      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function MiniInfo({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[11px] text-gray-500 mb-1">{title}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}
