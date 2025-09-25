// BookingsPanel.jsx — full file with instant updates + AOS fade-up
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  ChevronRight,
  XCircle,
  PhoneCall,
  ShieldCheck,
  Star,
  X,
  MapPin,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// --- Status chips (minimal, for potential reuse) ---
const StatusChip = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "confirmed"
      ? "bg-emerald-100 text-emerald-700"
      : s === "cancelled"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${cls}`}>
      {String(status || "pending").toUpperCase()}
    </span>
  );
};

const PayChip = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const cls = s === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${cls}`}>
      {String(status || "pending").toUpperCase()}
    </span>
  );
};

// --- Skeleton for loading ---
const RowSkeleton = () => (
  <div className="px-4 md:px-6 py-4" data-aos="fade-up">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-56 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>
      <div className="w-40 space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded ml-auto" />
      </div>
    </div>
  </div>
);

// --- Filters ---
const filters = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const BookingDetailsModal = ({ 
  booking, 
  isOpen, 
  onClose, 
  setSelectedBooking,
  setBookings, 
  bookings
}) => {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  const titleId = useMemo(
    () => (booking?._id ? `booking-title-${booking._id}` : "booking-title"),
    [booking?._id]
  );
  const descId = useMemo(
    () => (booking?._id ? `booking-desc-${booking._id}` : "booking-desc"),
    [booking?._id]
  );

  // Scroll lock + focus mgmt + ESC close + basic focus trap
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);

    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables);
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey, true);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const {
    _id,
    id,
    bookingNumber,
    title,
    vendor,
    vendorVerified,
    vendorRating,
    vendorPhone,
    serviceDate,
    location,
    baseAmount,
    depositAmount,
    payableAmount,
    paymentStatus,
    bookingStatus,
    canCancel,
    imageUrl,
  } = booking;
  
  const bookingId = _id || id; // Handle both _id and id
  const letter = (vendor || "V").toString().trim().charAt(0).toUpperCase();
  const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const statusColor =
    String(bookingStatus || "").toLowerCase() === "confirmed"
      ? "bg-emerald-100 text-emerald-700"
      : String(bookingStatus || "").toLowerCase() === "cancelled"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";
  const payColor =
    String(paymentStatus || "").toLowerCase() === "paid"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  const canPay =
    String(paymentStatus || "").toLowerCase() !== "paid" &&
    Number(payableAmount || 0) > 0;

  // 🚀 INSTANT UPDATE CANCEL FUNCTION
  const handleCancel = async () => {
    try {
      const updatedBooking = {
        ...booking,
        bookingStatus: 'cancelled',
        cancelledAt: new Date().toISOString(),
        canCancel: false
      };
      
      setSelectedBooking(updatedBooking);
      setBookings(prev => 
        prev.map(b => 
          (b._id === bookingId || b.id === bookingId) 
            ? updatedBooking 
            : b
        )
      );

      const response = await axios.patch(
        buildApiUrl(`/api/bookings/${bookingId}/cancel`)
      );
      
      if (response.data.success) {
        setTimeout(() => {
          onClose();
        }, 800);
        window.dispatchEvent(new Event('booking:updated'));
      }
      
    } catch (error) {
      console.error('Cancel booking failed:', error);
      setSelectedBooking(booking);
      setBookings(prev => 
        prev.map(b => 
          (b._id === bookingId || b.id === bookingId) 
            ? booking 
            : b
        )
      );
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handlePay = () => {
    window.location.href = `/checkout?bookingId=${bookingId}`;
  };

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          ref={dialogRef}
          className="fixed inset-0 z-[80] grid place-items-center px-4 py-8"
          onClick={(e) => e.stopPropagation()}
          data-aos="fade-up"
        >
          <div className="w-full max-w-2xl rounded-2xl border bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-4 p-5 border-b">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-blue-700 font-semibold">
                    {letter}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="text-[16px] font-semibold text-gray-900 truncate">
                  {title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-gray-600">
                  <span className="font-medium text-gray-900">{vendor}</span>
                  {vendorVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                  {vendorRating ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5">
                      <Star className="h-3.5 w-3.5" />
                      {Number(vendorRating).toFixed(1)}
                    </span>
                  ) : null}
                  <span className="ml-auto font-mono text-gray-500">#{bookingNumber}</span>
                </div>
              </div>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div id={descId} className="p-5 space-y-5">
              {/* When & Where */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-3" data-aos="fade-up">
                  <div className="text-[12px] text-gray-500 mb-1">When</div>
                  <div className="flex items-center gap-2 text-[14px] text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {new Date(serviceDate).toLocaleString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="rounded-xl border p-3" data-aos="fade-up" data-aos-delay="60">
                  <div className="text-[12px] text-gray-500 mb-1">Where</div>
                  <div className="flex items-center gap-2 text-[14px] text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{location || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Status chips */}
              <div className="flex flex-wrap items-center gap-2" data-aos="fade-up">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${statusColor}`}>
                  Status: {String(bookingStatus || "pending").toUpperCase()}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${payColor}`}>
                  Payment: {String(paymentStatus || "pending").toUpperCase()}
                </span>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-aos="fade-up">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[12px] text-gray-500">Base</div>
                  <div className="text-[15px] font-semibold text-gray-900">{formatINR(baseAmount)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[12px] text-gray-500">Deposit</div>
                  <div className="text-[15px] font-semibold text-emerald-700">{formatINR(depositAmount)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[12px] text-gray-500">Remaining</div>
                  <div className="text-[15px] font-semibold text-blue-700">{formatINR(payableAmount)}</div>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-xl border p-3 flex items-center justify-between" data-aos="fade-up">
                <div className="text-[13px] text-gray-600">
                  Vendor contact
                  <div className="text-[14px] text-gray-900">{vendorPhone || "N/A"}</div>
                </div>
                {vendorPhone && (
                  <a
                    href={`tel:${vendorPhone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Call vendor
                  </a>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-5 border-t flex flex-wrap gap-2 justify-end" data-aos="fade-up">
              {canCancel && bookingStatus !== 'cancelled' && (
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Cancel booking
                </button>
              )}
              {canPay && (
                <button
                  onClick={handlePay}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Pay now
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(
    <>
      {overlay}
      {panel}
    </>,
    document.body
  );
};

// --- Main panel ---
const BookingsPanel = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // AOS init + refresh on changes
  useEffect(() => {
    AOS.init({
      duration: 350,
      easing: "ease-out",
      once: true,
      offset: 40,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [bookings, activeFilter, showModal]);

  const fetchBookings = async (status = "all") => {
    if (!user?._id) return;
    try {
      setLoading(true);
      setError(null);
      const params = { status, page: 1, limit: 50 };
      const res = await axios.get(buildApiUrl(`/api/bookings/user/${user._id}`), { params });
      if (res.data.success) setBookings(res.data.data.bookings || []);
      else setError("Failed to fetch bookings");
      console.log(res.data.data.bookings)
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchBookings(activeFilter);
  }, [user?._id, activeFilter]);

  // Refresh after actions from modal (cancel, pay)
  useEffect(() => {
    const handler = () => {
      if (user?._id) fetchBookings(activeFilter);
    };
    window.addEventListener("booking:updated", handler);
    return () => window.removeEventListener("booking:updated", handler);
  }, [activeFilter, user?._id]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return bookings;
    if (activeFilter === "upcoming") {
      return bookings.filter(
        (b) =>
          ["pending", "confirmed"].includes(String(b.bookingStatus || "").toLowerCase()) &&
          new Date(b.serviceDate) >= new Date()
      );
    }
    return bookings.filter((b) => String(b.bookingStatus || "").toLowerCase() === activeFilter);
  }, [bookings, activeFilter]);

  const countFor = (key) => {
    if (key === "all") return bookings.length;
    if (key === "upcoming") {
      return bookings.filter(
        (b) =>
          ["pending", "confirmed"].includes(String(b.bookingStatus || "").toLowerCase()) &&
          new Date(b.serviceDate) >= new Date()
      ).length;
    }
    return bookings.filter((b) => String(b.bookingStatus || "").toLowerCase() === key).length;
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString()}`;

  return (
    <div className="max-w-6xl mx-auto p-6" data-aos="fade-up">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-5 tracking-tight">My Bookings</h1>

      {/* Segmented filter */}
      <div className="mb-4" data-aos="fade-up" data-aos-delay="60">
        <div className="inline-flex rounded-full border bg-white p-1 shadow-sm">
          {filters.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span>{f.label}</span>
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] ${
                      active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {countFor(f.key)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card list – compact Airbnb-style */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="80">
        {loading ? (
          <div className="divide-y">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        ) : error ? (
          <div className="p-12 text-center" data-aos="fade-up">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchBookings(activeFilter)}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center" data-aos="fade-up">
            <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-[15px] font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 text-[13px]">Try a different filter</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((b, idx) => {
              const id = b._id || b.id;
              const letter = (b.vendor || "V").toString().trim().charAt(0).toUpperCase();
              return (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => handleView(b)}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="w-full text-left px-4 md:px-6 py-4 md:py-5 border-b last:border-0 hover:bg-gray-50/80 focus:bg-gray-50 transition-colors"
                  data-aos="fade-up"
                  data-aos-delay={Math.min(idx * 60, 360)}
                >
                 <div className="bg-white p-4 sm:p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
  <div className="flex items-center gap-4 sm:gap-5">
    {/* Thumbnail */}
    <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border">
      {b.imageUrl ? (
        <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full grid place-items-center text-gray-500 font-bold text-2xl">
          {letter}
        </div>
      )}
    </div>

    {/* Middle Section: Details */}
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-3">
        <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">
          {b.title}
        </h3>
        <span className="text-xs font-mono text-gray-400 truncate">#{b.bookingNumber}</span>
      </div>

      <div className="mt-2.5 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 text-gray-700 px-2.5 py-1 text-xs sm:text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>
            {new Date(b.serviceDate).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <PhoneCall className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{b.vendorPhone}</span>
        </div>
      </div>
    </div>

    {/* Right Section: Amounts & Status */}
    <div className="flex flex-col items-end justify-between self-stretch">
      {/* Amounts */}
      <div className="flex gap-4 sm:gap-6">
        <div className="text-right">
          <div className="text-[12px] sm:text-sm text-gray-500">Deposit</div>
          <div className="text-sm sm:text-base font-bold text-emerald-600">
            {formatINR(b.depositAmount)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] sm:text-sm text-gray-500">Balance</div>
          <div className="text-sm sm:text-base font-bold text-blue-600">
            {formatINR(b.payableAmount)}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`px-3 py-1 rounded-full font-medium
            ${
              b.bookingStatus === "confirmed"
                ? "bg-emerald-100 text-emerald-800"
                : b.bookingStatus === "cancelled"
                ? "bg-rose-100 text-rose-800"
                : b.bookingStatus === "pending"
                ? "bg-amber-100 text-amber-800"
                : b.bookingStatus === "completed"
                ? "bg-sky-100 text-sky-800"
                : "bg-gray-100 text-gray-800"
            }`}
        >
          {b.bookingStatus.charAt(0).toUpperCase() + b.bookingStatus.slice(1)}
        </span>
      </div>
    </div>

    {/* Chevron */}
    <div className="pl-2 sm:pl-4">
       <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </div>
</div>

                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* 🚀 Modal with instant update props */}
      <BookingDetailsModal 
        booking={selectedBooking} 
        isOpen={showModal} 
        onClose={closeModal}
        setSelectedBooking={setSelectedBooking}
        setBookings={setBookings}
        bookings={bookings}
      />
    </div>
  );
};

export default BookingsPanel;
