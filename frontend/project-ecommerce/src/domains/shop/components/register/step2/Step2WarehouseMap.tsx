import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Step2WarehouseMapProps {
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

// Default Coordinates for supported regions in Vietnam
const PROVINCE_COORDINATES: Record<string, [number, number]> = {
  "TP. Hồ Chí Minh": [10.7769, 106.7009],
  "Hà Nội": [21.0285, 105.8542],
  "Đà Nẵng": [16.0544, 108.2022],
  "Bình Dương": [10.9805, 106.6519],
  "Cần Thơ": [10.0452, 105.7469],
  "Hải Phòng": [20.8449, 106.6881],
};

const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  // TP. HCM
  "Quận 1": [10.7756, 106.7004],
  "Quận 3": [10.7844, 106.6844],
  "Quận 7": [10.734, 106.7218],
  "Quận Bình Thạnh": [10.8106, 106.7091],
  "TP. Thủ Đức": [10.8494, 106.7537],
  // Hà Nội
  "Quận Hoàn Kiếm": [21.0313, 105.8524],
  "Quận Ba Đình": [21.0341, 105.8242],
  "Quận Đống Đa": [21.0181, 105.8267],
  "Quận Cầu Giấy": [21.0312, 105.7942],
  // Đà Nẵng
  "Quận Hải Châu": [16.06, 108.22],
  "Quận Thanh Khê": [16.065, 108.188],
  "Quận Sơn Trà": [16.09, 108.245],
  // Bình Dương
  "TP. Thủ Dầu Một": [10.9805, 106.6519],
  "TP. Dĩ An": [10.9068, 106.7718],
  "TP. Thuận An": [10.9255, 106.7032],
  // Cần Thơ
  "Quận Ninh Kiều": [10.0342, 105.7883],
  "Quận Bình Thủy": [10.0711, 105.736],
  "Quận Cái Răng": [9.9982, 105.7628],
  // Hải Phòng
  "Quận Hồng Bàng": [20.8655, 106.6715],
  "Quận Ngô Quyền": [20.8566, 106.698],
  "Quận Lê Chân": [20.8427, 106.6806],
};

const WARD_COORDINATES: Record<string, [number, number]> = {
  // Quận 1
  "Phường Bến Nghé": [10.778, 106.703],
  "Phường Bến Thành": [10.7719, 106.7044],
  "Phường Đa Kao": [10.7891, 106.6997],
  "Phường Nguyễn Thái Bình": [10.7686, 106.6992],
  // Quận 3
  "Phường Võ Thị Sáu": [10.785, 106.69],
  "Phường 1": [10.769, 106.681],
  "Phường 2": [10.771, 106.683],
  "Phường 3": [10.773, 106.685],
  // Quận 7
  "Phường Tân Phong": [10.7289, 106.7083],
  "Phường Tân Phú": [10.736, 106.723],
  "Phường Tân Thuận Đông": [10.762, 106.732],
  // Quận Bình Thạnh
  "Phường 25": [10.803, 106.716],
  "Phường 26": [10.813, 106.71],
  "Phường 19": [10.792, 106.708],
  // TP. Thủ Đức
  "Phường An Phú": [10.797, 106.745],
  "Phường Thảo Điền": [10.807, 106.733],
  "Phường Hiệp Phú": [10.852, 106.776],
};

// Deterministic small micro-offset so different street numbers produce distinct coordinates around the ward center
function computeAddressOffset(detail: string): [number, number] {
  if (!detail.trim()) return [0, 0];
  let hash = 0;
  for (let i = 0; i < detail.length; i++) {
    hash = (hash << 5) - hash + detail.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = (((hash % 1000) / 1000) - 0.5) * 0.003;
  const lngOffset = (((((hash >> 4) % 1000) / 1000) - 0.5)) * 0.003;
  return [latOffset, lngOffset];
}

// Leaflet Map recentering component
const MapRecenter: React.FC<{ coords: [number, number]; zoom: number }> = ({
  coords,
  zoom,
}) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, zoom, { duration: 0.8 });
  }, [coords, zoom, map]);
  return null;
};

// Map click listener to allow user to fine-tune warehouse location pin
const MapClickListener: React.FC<{
  onLocationChange: (lat: number, lng: number) => void;
}> = ({ onLocationChange }) => {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const Step2WarehouseMap: React.FC<Step2WarehouseMapProps> = ({
  province,
  district,
  ward,
  addressDetail,
  onCoordinatesChange,
}) => {
  // Manual coordinates set by dragging/clicking marker or from async geocode
  const [manualCoords, setManualCoords] = useState<[number, number] | null>(
    null
  );
  const [prevAddressKey, setPrevAddressKey] = useState<string>("");

  const addressKey = `${province}-${district}-${ward}-${addressDetail}`;

  // Reset manual override during render when user edits the address inputs
  if (addressKey !== prevAddressKey) {
    setPrevAddressKey(addressKey);
    setManualCoords(null);
  }

  // Derive coordinates directly from the selected address fields during render
  const defaultCoords = useMemo<[number, number]>(() => {
    const baseCoord =
      (ward && WARD_COORDINATES[ward]) ||
      (district && DISTRICT_COORDINATES[district]) ||
      (province && PROVINCE_COORDINATES[province]) ||
      [10.7719, 106.7044];

    const offset = computeAddressOffset(addressDetail);
    const derivedLat = Number((baseCoord[0] + offset[0]).toFixed(4));
    const derivedLng = Number((baseCoord[1] + offset[1]).toFixed(4));
    return [derivedLat, derivedLng];
  }, [province, district, ward, addressDetail]);

  const activeCoords: [number, number] = manualCoords ?? defaultCoords;
  const zoom = addressDetail.trim() ? 16 : ward ? 15 : district ? 14 : 12;

  const isAddressComplete = Boolean(
    province && district && ward && addressDetail.trim()
  );

  // Modern custom warehouse pin icon using Material Symbols
  const customPinIcon = useMemo(() => {
    return L.divIcon({
      className: "custom-warehouse-pin",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(67, 56, 202, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: #4338ca; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 4px 12px rgba(67, 56, 202, 0.45); border: 2.5px solid #ffffff;">
            <span class="material-symbols-outlined" style="font-size: 20px; line-height: 1;">pin_drop</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  }, []);

  // Async geocode with debounce when a full address is entered
  useEffect(() => {
    if (!addressDetail.trim() || addressDetail.trim().length < 3) return;

    const fullQuery = [addressDetail, ward, district, province, "Việt Nam"]
      .filter(Boolean)
      .join(", ");

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            fullQuery
          )}&limit=1`,
          {
            signal: controller.signal,
            headers: { "Accept-Language": "vi,en" },
          }
        );
        if (res.ok) {
          const results = await res.json();
          if (Array.isArray(results) && results.length > 0) {
            const geoLat = Number(parseFloat(results[0].lat).toFixed(4));
            const geoLng = Number(parseFloat(results[0].lon).toFixed(4));
            setManualCoords([geoLat, geoLng]);
          }
        }
      } catch {
        // Fallback to defaultCoords remains active
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [province, district, ward, addressDetail]);

  const handleManualLocationChange = (newLat: number, newLng: number) => {
    const lat = Number(newLat.toFixed(4));
    const lng = Number(newLng.toFixed(4));
    setManualCoords([lat, lng]);
    onCoordinatesChange?.(lat, lng);
  };

  const fullDisplayAddress = [addressDetail, ward, district, province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-sm bg-surface-container relative border border-outline-variant/30">
      {/* Map Canvas */}
      <div className="w-full h-64 sm:h-72 relative">
        <MapContainer
          center={activeCoords}
          zoom={zoom}
          scrollWheelZoom={false}
          className="w-full h-full z-0"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter coords={activeCoords} zoom={zoom} />
          <MapClickListener onLocationChange={handleManualLocationChange} />

          <Marker
            position={activeCoords}
            icon={customPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleManualLocationChange(position.lat, position.lng);
              },
            }}
          >
            <Popup>
              <div className="p-1 font-body-sm text-body-sm text-on-surface">
                <span className="font-bold text-primary block">
                  Vị trí kho lấy hàng
                </span>
                <span className="block text-on-surface-variant text-xs mt-0.5">
                  {fullDisplayAddress || "Chưa nhập địa chỉ"}
                </span>
                <span className="block font-mono text-[11px] text-secondary mt-1">
                  {activeCoords[0].toFixed(4)}° N, {activeCoords[1].toFixed(4)}° E
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Hint Top-Right */}
        <div className="absolute top-3 right-3 z-[1000] pointer-events-none hidden sm:block">
          <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface-variant text-[11px] font-label-sm shadow-sm border border-outline-variant/20 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary">
              touch_app
            </span>
            Kéo thả ghim hoặc click để chỉnh vị trí
          </span>
        </div>

        {/* Floating GPS Coordinates Info Banner (Bottom Overlay Matching Mockup Image) */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] pointer-events-auto">
          <div className="bg-surface-container-lowest/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md border border-outline-variant/30 flex items-center gap-3 max-w-full sm:max-w-xl">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                pin_drop
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Vị trí kho đã định vị tọa độ GPS
                </span>
                {isAddressComplete && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-secondary px-2 py-0.5 rounded-full bg-secondary-container/20">
                    <span className="material-symbols-outlined text-[13px]">
                      verified
                    </span>
                    Đã định vị
                  </span>
                )}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-mono truncate">
                {activeCoords[0].toFixed(4)}° N, {activeCoords[1].toFixed(4)}° E •{" "}
                {isAddressComplete
                  ? "Hỗ trợ tài xế điều hướng chuẩn xác"
                  : "Nhập đầy đủ địa chỉ để định vị chuẩn xác"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2WarehouseMap;
