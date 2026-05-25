export const ADMIN_DELETE_ENTITY_TYPES = [
  "instructor",
  "course",
  "institution",
  "supplier",
  "session",
] as const;

export type AdminDeleteEntityType = (typeof ADMIN_DELETE_ENTITY_TYPES)[number];

export type AdminDeleteDependencyItem = {
  label: string;
  count: number;
};

export type AdminDeletePreview = {
  entityType: AdminDeleteEntityType;
  entityId: string;
  entityLabel: string;
  canNormalDelete: boolean;
  items: AdminDeleteDependencyItem[];
};

export type AdminDeleteMode = "normal" | "force";

export const FORCE_DELETE_WARNING =
  "מחיקה כפויה עלולה למחוק נתונים קשורים ולהשפיע על דוחות ושכר.";
