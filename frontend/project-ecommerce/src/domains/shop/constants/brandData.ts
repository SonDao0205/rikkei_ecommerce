export interface BrandOption {
  id: number | null;
  name: string;
  isVerified?: boolean;
}

export const AVAILABLE_BRANDS: BrandOption[] = [
  { id: null, name: "No Brand (Không có thương hiệu)", isVerified: false },
  { id: 940003, name: "Apple", isVerified: true },
  { id: 940004, name: "Samsung", isVerified: true },
  { id: 940005, name: "Xiaomi", isVerified: true },
  { id: 940006, name: "Anker", isVerified: true },
  { id: 940007, name: "Lenovo", isVerified: true },
  { id: 940008, name: "Dell", isVerified: true },
  { id: 940009, name: "Logitech", isVerified: true },
  { id: 940001, name: "An Nhiên", isVerified: true },
  { id: 940002, name: "Bếp Việt", isVerified: true },
  { id: 940010, name: "Khe Sanh Coffee", isVerified: true },
];

