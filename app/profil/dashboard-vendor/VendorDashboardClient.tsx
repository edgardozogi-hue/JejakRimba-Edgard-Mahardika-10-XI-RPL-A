"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Clock,
  ClipboardList,
  Search,
  MapPin,
  X,
  AlertCircle,
  Check,
  PackagePlus,
} from "lucide-react";
import PageShell from "../../components/PageShell";
import { staggerContainer, fadeUp } from "../../lib/animations";
import {
  createEquipment,
  updateEquipment,
  toggleEquipmentActive,
  deleteEquipment,
  type VendorOverview,
} from "../../actions/vendor";
import { updateBookingStatus } from "../../actions/booking";

const CATEGORY_OPTIONS = ["tenda", "carrier", "sleeping_bag", "kompor", "matras", "jaket"];
const CONDITION_OPTIONS = ["baru", "sangat_baik", "baik"];

const CATEGORY_LABEL: Record<string, string> = {
  tenda: "Tenda",
  carrier: "Carrier",
  sleeping_bag: "Sleeping Bag",
  kompor: "Kompor",
  matras: "Matras",
  jaket: "Jaket",
};

const CONDITION_LABEL: Record<string, string> = {
  baru: "Baru",
  sangat_baik: "Sangat Baik",
  baik: "Baik",
};

type FormState = {
  name: string;
  category: string;
  description: string;
  price_per_day: string;
  stock: string;
  capacity: string;
  condition: string;
  image_url: string;
  elevation: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  category: "tenda",
  description: "",
  price_per_day: "",
  stock: "1",
  capacity: "",
  condition: "baik",
  image_url: "",
  elevation: "",
};

export default function VendorDashboardClient({ data }: { data: VendorOverview }) {
  const [tab, setTab] = useState<"tools" | "bookings">("tools");
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const filteredEquip = useMemo(() => {
    let list = data.equipment;
    if (!showInactive) list = list.filter((e) => e.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data.equipment, search, showInactive]);

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                Vendor Dashboard
              </p>
              <h1 className="mt-2 font-display text-3xl font-black uppercase leading-[0.92] tracking-tight text-text-primary md:text-4xl">
                {data.vendor?.business_name ?? "Kelola Toko"}
              </h1>
            </div>
            <Link
              href="/katalog"
              className="hidden shrink-0 items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-accent/40 sm:flex"
            >
              <Eye size={16} /> Lihat katalog
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-2 max-w-2xl text-sm text-text-secondary">
            {data.vendor?.description ?? "Kelola inventaris alat persewaan, harga, stok, dan lihat booking masuk."}
          </motion.p>

          {data.vendor && (
            <motion.div variants={fadeUp} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
              {data.vendor.address && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} className="text-accent" /> {data.vendor.address}
                  {data.vendor.city ? `, ${data.vendor.city}` : ""}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                WhatsApp: {data.vendor.whatsapp_number ?? "-"}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <StatCard icon={Package} label="Total Alat" value={data.stats.equipment_count} />
          <StatCard icon={Check} label="Alat Aktif" value={data.stats.active_count} />
          <StatCard icon={ClipboardList} label="Booking Masuk" value={data.stats.booking_count} />
          <StatCard icon={Clock} label="Menunggu Konfirmasi" value={data.stats.pending_count} accent />
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-10 flex gap-2">
          <TabButton active={tab === "tools"} onClick={() => setTab("tools")} icon={Package}>
            Kelola Alat
          </TabButton>
          <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")} icon={ClipboardList}>
            Booking Masuk
          </TabButton>
        </motion.div>

        {tab === "tools" ? (
          <ToolsTab
            equipment={filteredEquip}
            totalEquipment={data.equipment.length}
            search={search}
            setSearch={setSearch}
            showInactive={showInactive}
            setShowInactive={setShowInactive}
          />
        ) : (
          <BookingsTab bookings={data.bookings} />
        )}
      </div>
    </PageShell>
  );
}

// ── Stat card ──

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-surface-border bg-surface p-4"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? "bg-accent/15" : "bg-bg-elevated"}`}>
        <Icon size={17} className={accent ? "text-accent" : "text-text-secondary"} />
      </div>
      <p className="mt-3 font-display text-2xl font-black text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </motion.div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-accent text-paper"
          : "border border-surface-border bg-surface text-text-secondary hover:text-text-primary"
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

// ── Tools tab ──

function ToolsTab({
  equipment,
  totalEquipment,
  search,
  setSearch,
  showInactive,
  setShowInactive,
}: {
  equipment: VendorOverview["equipment"];
  totalEquipment: number;
  search: string;
  setSearch: (v: string) => void;
  showInactive: boolean;
  setShowInactive: (v: boolean) => void;
}) {
  const [modal, setModal] = useState<
    | { mode: "create"; form: FormState }
    | { mode: "edit"; id: string; form: FormState }
    | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleCreate() {
    if (!modal || modal.mode !== "create") return;
    const err = validateForm(modal.form);
    if (err) {
      setFormError(err);
      return;
    }
    setBusy(true);
    setFormError(null);
    const res = await createEquipment(toInput(modal.form));
    setBusy(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setModal(null);
    }
  }

  async function handleEdit() {
    if (!modal || modal.mode !== "edit") return;
    const err = validateForm(modal.form);
    if (err) {
      setFormError(err);
      return;
    }
    setBusy(true);
    setFormError(null);
    const res = await updateEquipment(modal.id, toInput(modal.form));
    setBusy(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setModal(null);
    }
  }

  async function handleToggle(id: string) {
    await toggleEquipmentActive(id);
  }

  async function handleDelete(id: string) {
    setBusy(true);
    await deleteEquipment(id);
    setBusy(false);
    setConfirmDelete(null);
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari alat..."
            className="w-full rounded-xl border border-surface-border bg-surface py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Tampilkan non-aktif
          </label>
          <button
            onClick={() => {
              setModal({ mode: "create", form: EMPTY_FORM });
              setFormError(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover"
          >
            <PackagePlus size={16} /> Tambah Alat
          </button>
        </div>
      </div>

      {/* List */}
      {equipment.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border p-16 text-center">
          <Package size={36} className="text-text-secondary" />
          <div>
            <p className="font-display text-lg font-bold text-text-primary">
              {totalEquipment === 0 ? "Belum ada alat" : "Tidak ada alat ditemukan"}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {totalEquipment === 0
                ? "Tambahkan alat pertamamu untuk mulai menyewakan."
                : "Coba ubah pencarian atau filter."}
            </p>
          </div>
          {totalEquipment === 0 && (
            <button
              onClick={() => {
                setModal({ mode: "create", form: EMPTY_FORM });
                setFormError(null);
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover"
            >
              <Plus size={16} /> Tambah Alat Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {equipment.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-4 sm:flex-row sm:items-center"
            >
              {/* Image */}
              <div className="h-16 w-full shrink-0 overflow-hidden rounded-xl bg-bg-elevated sm:h-16 sm:w-16">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={20} className="text-text-secondary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-display font-semibold text-text-primary">{item.name}</p>
                  <span className="rounded-full bg-bg-elevated px-2 py-0.5 font-archivo text-[10px] text-text-secondary">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </span>
                  {!item.is_active && (
                    <span className="rounded-full bg-red/10 px-2 py-0.5 font-archivo text-[10px] font-semibold text-red-400">
                      Non-aktif
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-text-secondary">
                  {CONDITION_LABEL[item.condition] ?? item.condition}
                  {item.capacity ? ` · ${item.capacity}` : ""}
                  {item.stock > 0 ? (
                    <span className="text-moss"> · Stok {item.stock}</span>
                  ) : (
                    <span className="text-red-400"> · Habis</span>
                  )}
                </p>
                <p className="mt-1 font-archivo text-sm font-bold text-accent">
                  Rp{item.price_per_day.toLocaleString("id-ID")}
                  <span className="text-[10px] font-normal text-text-secondary">/hari</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2 sm:flex-col lg:flex-row">
                {item.stock === 0 && (
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-moss transition hover:border-moss/40"
                    title="Aktifkan kembali"
                  >
                    <Check size={13} /> Aktifkan
                  </button>
                )}
                <button
                  onClick={() =>
                    setModal({
                      mode: "edit",
                      id: item.id,
                      form: {
                        name: item.name,
                        category: item.category,
                        description: "",
                        price_per_day: String(item.price_per_day),
                        stock: String(item.stock),
                        capacity: item.capacity ?? "",
                        condition: item.condition,
                        image_url: "",
                        elevation: item.elevation ?? "",
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-text-secondary transition hover:border-accent/40 hover:text-text-primary"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => handleToggle(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-text-secondary transition hover:border-accent/40 hover:text-text-primary"
                  title={item.is_active ? "Nonaktifkan (sembunyikan dari katalog)" : "Aktifkan"}
                >
                  {item.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  onClick={() => setConfirmDelete(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-red-400 transition hover:border-red-400/50"
                >
                  <Trash2 size={13} /> Hapus
                </button>
              </div>

              {/* Delete confirm inline */}
              {confirmDelete === item.id && (
                <div className="flex items-center justify-end gap-2 border-t border-surface-border pt-3 sm:col-span-1">
                  <span className="text-xs text-text-secondary">Hapus alat ini?</span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={busy}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                  >
                    Yakin
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
                  >
                    Batal
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {modal && (
        <EquipmentModal
          mode={modal.mode}
          form={modal.form}
          setForm={(f) => setModal({ ...modal, form: f })}
          error={formError}
          setError={setFormError}
          busy={busy}
          onCancel={() => setModal(null)}
          onSubmit={modal.mode === "create" ? handleCreate : handleEdit}
        />
      )}
    </div>
  );
}

// ── Bookings tab ──

const BOOKING_STATUS_LABEL: Record<string, string> = {
  menunggu_konfirmasi: "Menunggu",
  dikonfirmasi: "Dikonfirmasi",
  sedang_berjalan: "Sedang Berjalan",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

function BookingsTab({ bookings }: { bookings: VendorOverview["bookings"] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const router = useRouter();

  async function handleStatus(id: string, status: "dikonfirmasi" | "sedang_berjalan" | "selesai" | "dibatalkan") {
    setBusy(id);
    setStatusError(null);
    const res = await updateBookingStatus(id, status);
    setBusy(null);
    if (res.error) {
      setStatusError(res.error);
    } else {
      router.refresh();
    }
  }

  function fmtDate(v: string) {
    return new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  if (bookings.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border p-16 text-center">
        <ClipboardList size={36} className="text-text-secondary" />
        <p className="font-display text-lg font-bold text-text-primary">Belum ada booking masuk</p>
        <p className="max-w-sm text-sm text-text-secondary">
          Ketika penyewa memesan alat dari tokomu, pesanannya akan muncul di sini untuk kamu konfirmasi.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {statusError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={16} /> {statusError}
        </div>
      )}
      <div className="space-y-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-4 md:flex-row md:items-center"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-text-primary">{b.equipment_name}</p>
                <span className="rounded-full bg-bg-elevated px-2.5 py-0.5 text-[11px] text-text-secondary">
                  x{b.quantity}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                Penyewa: <span className="text-text-primary">{b.renter_name}</span>
              </p>
              <p className="text-xs text-text-secondary">
                {fmtDate(b.start_date)} &rarr; {fmtDate(b.end_date)}
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                IDR {b.total_price.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="flex items-center gap-2 md:flex-col md:items-end">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  b.status === "dibatalkan"
                    ? "bg-red-500/10 text-red-500"
                    : b.status === "selesai"
                      ? "bg-bg-elevated text-text-secondary"
                      : b.status === "menunggu_konfirmasi"
                        ? "bg-accent/15 text-accent"
                        : "bg-green-500/10 text-green-600"
                }`}
              >
                {BOOKING_STATUS_LABEL[b.status] ?? b.status}
              </span>
              {b.status === "menunggu_konfirmasi" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatus(b.id, "dikonfirmasi")}
                    disabled={busy === b.id}
                    className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
                  >
                    <Check size={13} /> Terima
                  </button>
                  <button
                    onClick={() => handleStatus(b.id, "dibatalkan")}
                    disabled={busy === b.id}
                    className="flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <X size={13} /> Tolak
                  </button>
                </div>
              )}
              {b.status === "dikonfirmasi" && (
                <button
                  onClick={() => handleStatus(b.id, "sedang_berjalan")}
                  disabled={busy === b.id}
                  className="flex items-center gap-1.5 rounded-lg border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-50"
                >
                  <PackagePlus size={13} /> Mulai Sewa
                </button>
              )}
              {b.status === "sedang_berjalan" && (
                <button
                  onClick={() => handleStatus(b.id, "selesai")}
                  disabled={busy === b.id}
                  className="flex items-center gap-1.5 rounded-lg border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-500/10 disabled:opacity-50"
                >
                  <Check size={13} /> Tandai Selesai
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Equipment modal ──

function EquipmentModal({
  mode,
  form,
  setForm,
  error,
  setError,
  busy,
  onCancel,
  onSubmit,
}: {
  mode: "create" | "edit";
  form: FormState;
  setForm: (f: FormState) => void;
  error: string | null;
  setError: (e: string | null) => void;
  busy: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setError(null);
    setForm({ ...form, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-bg p-6 sm:rounded-2xl sm:border sm:border-surface-border"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">
            {mode === "create" ? "Tambah Alat" : "Edit Alat"}
          </h2>
          <button
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <ModalField label="Nama Alat" required>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Contoh: Tenda Dome 4 Orang"
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </ModalField>

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Kategori" required>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface px-3 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </ModalField>
            <ModalField label="Kondisi" required>
              <select
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface px-3 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {CONDITION_LABEL[c]}
                  </option>
                ))}
              </select>
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Harga / hari (Rp)" required>
              <input
                type="number"
                min={0}
                value={form.price_per_day}
                onChange={(e) => set("price_per_day", e.target.value)}
                placeholder="50000"
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </ModalField>
            <ModalField label="Stok" required>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="1"
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </ModalField>
          </div>

          <ModalField label="Kapasitas / Spesifikasi">
            <input
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="Contoh: 4 Orang atau 60L"
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </ModalField>

          <ModalField label="Elevasi (mdpl)">
            <input
              value={form.elevation}
              onChange={(e) => set("elevation", e.target.value)}
              placeholder="Contoh: ≥ 2000 mdpl"
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </ModalField>

          <ModalField label="URL Foto (opsional)">
            <input
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="https://... (oke, opsional)"
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </ModalField>

          <ModalField label="Deskripsi">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Jelaskan detail alat..."
              className="w-full resize-none rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </ModalField>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-bg-elevated px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-sm text-text-primary">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-surface-border bg-surface py-3 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? "Menyimpan..." : mode === "create" ? "Tambah Alat" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ModalField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-primary">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Helpers ──

function validateForm(form: FormState): string | null {
  if (!form.name.trim()) return "Nama alat wajib diisi.";
  if (!form.price_per_day || Number(form.price_per_day) < 0)
    return "Harga wajib diisi dan tidak boleh negatif.";
  if (form.stock === "" || Number(form.stock) < 0) return "Stok wajib diisi.";
  return null;
}

function toInput(form: FormState) {
  return {
    name: form.name,
    category: form.category,
    description: form.description || undefined,
    price_per_day: Number(form.price_per_day),
    stock: Number(form.stock),
    capacity: form.capacity || undefined,
    condition: form.condition,
    image_url: form.image_url || undefined,
    elevation: form.elevation || undefined,
  };
}