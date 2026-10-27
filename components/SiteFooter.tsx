import type { Brand } from "@/lib/types";

export function SiteFooter({ brand }: { brand: Pick<Brand, "firmName" | "logoUrl"> }) {
  return (
    <footer className="site-foot">
      <div className="brand">
        {brand.logoUrl ? (
          <span className="logo-mark">
            <img className="logo" src={brand.logoUrl} alt="" />
          </span>
        ) : null}
        <p className="firm-name">{brand.firmName}</p>
      </div>
      <nav aria-label="Firm">
        <a href="https://www.ramosjames.com/privacy-policy/">Privacy Policy</a>
        <span aria-hidden="true">|</span>
        <a href="https://www.ramosjames.com/">Visit Our Website</a>
      </nav>
    </footer>
  );
}
