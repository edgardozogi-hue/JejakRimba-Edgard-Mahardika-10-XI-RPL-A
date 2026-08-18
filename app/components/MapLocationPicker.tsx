"use client";

import { useState } from "react";
import { LocateFixed, MapPin, AlertCircle, Check, Loader2 } from "lucide-react";
import { useLanguage } from "../lib/i18n";

const OSM_EMBED = "https://www.openstreetmap.org/export/embed.html";
const NOMINATIM = "https://nominatim.openstreetmap.org";

export type LocationPicked = {
  lat: number;
  lng: number;
  address: string;
  city: string;
  error: string | null;
};

const defaultCenter = { lat: -7.9666, lng: 112.6326 };

export default function MapLocationPicker({
  onChange,
  initial,
}: {
  onChange: (loc: LocationPicked) => void;
  initial?: { lat: number; lng: number };
}) {
  const { t } = useLanguage();
  const [loc, setLoc] = useState<LocationPicked>({
    lat: initial?.lat ?? defaultCenter.lat,
    lng: initial?.lng ?? defaultCenter.lng,
    address: "",
    city: "Malang",
    error: null,
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

  const bbox = 0.015;

  const mapSrc = `${OSM_EMBED}?bbox=${(loc.lng - bbox).toFixed(4)}%2C${(loc.lat - bbox).toFixed(4)}%2C${(loc.lng + bbox).toFixed(4)}%2C${(loc.lat + bbox).toFixed(4)}&layer=mapnik&marker=${loc.lat}%2C${loc.lng}`;

  function emit(next: LocationPicked) {
    setLoc(next);
    onChange({
      lat: next.lat,
      lng: next.lng,
      address: next.address,
      city: next.city,
      error: next.error,
    });
  }

  async function reverseGeocode(lat: number, lng: number) {
    setResolving(true);
    try {
      const res = await fetch(
        `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=id`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("geocode gagal");
      const data = await res.json();
      const addr = data?.address ?? {};
      const city =
        addr?.city ??
        addr?.town ??
        addr?.municipality ??
        addr?.county ??
        "Malang";
      const address = [addr?.road, addr?.suburb, city].filter(Boolean).join(", ");
      emit({ lat, lng, address, city, error: null });
    } catch {
      emit({ lat, lng, address: "", city: "Malang", error: null });
    } finally {
      setResolving(false);
    }
  }

  function onNumChange(field: "lat" | "lng", value: string) {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    const next = { ...loc, [field]: num };
    setLoc(next);
    // update marker, jangan reverse geocode tiap ketik agar hemat request
    emit({ ...next, error: null });
  }

  function onBlurResolve() {
    void reverseGeocode(loc.lat, loc.lng);
  }

  async function useMyLocation() {
    setGeoLoading(true);
    if (!("geolocation" in navigator)) {
      emit({ ...loc, error: t("map.error_no_geolocation") });
      setGeoLoading(false);
      return;
    }
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const { latitude, longitude } = pos.coords;
      await reverseGeocode(latitude, longitude);
    } catch {
      emit({ ...loc, error: t("map.error_access") });
    } finally {
      setGeoLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Map embed */}
      <div className="relative h-52 w-full overflow-hidden rounded-xl border border-surface-border bg-bg-elevated">
        <iframe
          title={t("map.title")}
          src={mapSrc}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-archivo text-[10px] text-white backdrop-blur-sm">
          <MapPin size={11} /> {t("map.marker_hint")}
        </div>
        {resolving && (
          <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-archivo text-[10px] text-white backdrop-blur-sm">
            <Loader2 size={11} className="animate-spin" /> {t("map.detecting_address")}
          </div>
        )}
      </div>

      {/* Use my location */}
      <button
        type="button"
        onClick={useMyLocation}
        disabled={geoLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-accent disabled:opacity-60"
      >
        {geoLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> {t("map.detecting_loc")}
          </>
        ) : (
          <>
            <LocateFixed size={16} className="text-accent" /> {t("auth.gunakan_lokasiku")}
          </>
        )}
      </button>

      {/* Manual coords */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Latitude</label>
          <input
            type="number"
            value={loc.lat.toFixed(6)}
            onChange={(e) => onNumChange("lat", e.target.value)}
            onBlur={onBlurResolve}
            step="any"
            className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Longitude</label>
          <input
            type="number"
            value={loc.lng.toFixed(6)}
            onChange={(e) => onNumChange("lng", e.target.value)}
            onBlur={onBlurResolve}
            step="any"
            className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Reverse geocode result */}
      {loc.address && (
        <div className="flex items-start gap-2 rounded-xl bg-bg-elevated px-3 py-2.5">
          <Check size={15} className="mt-0.5 shrink-0 text-moss" />
          <p className="text-xs text-text-secondary">{loc.address}</p>
        </div>
      )}

      {/* Error */}
      {loc.error && (
        <div className="flex items-start gap-2 rounded-xl bg-bg-elevated px-3 py-2.5">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs text-text-secondary">{loc.error}</p>
        </div>
      )}
    </div>
  );
}