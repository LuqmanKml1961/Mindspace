import { BrandFrame } from "@/components/layout/brand-frame";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <BrandFrame>{children}</BrandFrame>;
}
