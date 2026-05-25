import { ButtonLink } from "@/components/ui/button-link";

type AdminListAddButtonProps = {
  href: string;
  label: string;
};

/** כפתור הוספה קבוע מתחת לכותרת — תמיד גלוי (מובייל ודסקטופ). */
export function AdminListAddButton({ href, label }: AdminListAddButtonProps) {
  return (
    <div className="relative z-10 w-full max-w-full shrink-0">
      <ButtonLink
        href={href}
        className="flex min-h-12 w-full items-center justify-center text-base font-semibold shadow-sm"
      >
        {label}
      </ButtonLink>
    </div>
  );
}
