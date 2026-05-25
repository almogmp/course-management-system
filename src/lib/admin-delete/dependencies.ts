import "server-only";

import type { AdminDeleteSupabaseClient } from "@/lib/admin-delete/supabase";
import type { AdminDeleteDependencyItem, AdminDeleteEntityType, AdminDeletePreview } from "@/lib/admin-delete/types";

async function countExact(
  admin: AdminDeleteSupabaseClient,
  table:
    | "sessions"
    | "courses"
    | "institutions"
    | "primary_suppliers"
    | "notification_log"
    | "institution_coordinators"
    | "session_series",
  filters: Array<{ column: string; value: string }>,
): Promise<number> {
  let query = admin.from(table).select("id", { count: "exact", head: true });

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function countSessionsForCourses(
  admin: AdminDeleteSupabaseClient,
  courseIds: string[],
): Promise<number> {
  if (courseIds.length === 0) {
    return 0;
  }

  const { count, error } = await admin
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .in("course_id", courseIds);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getCourseIdsForInstitution(
  admin: AdminDeleteSupabaseClient,
  institutionId: string,
): Promise<string[]> {
  const { data, error } = await admin
    .from("courses")
    .select("id")
    .eq("institution_id", institutionId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.id);
}

async function getCourseIdsForSupplier(
  admin: AdminDeleteSupabaseClient,
  supplierId: string,
): Promise<string[]> {
  const { data, error } = await admin
    .from("courses")
    .select("id")
    .eq("primary_supplier_id", supplierId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.id);
}

async function countInstructorLinkedSessions(
  admin: AdminDeleteSupabaseClient,
  instructorId: string,
): Promise<number> {
  const { data: leadCourses, error: leadCoursesError } = await admin
    .from("courses")
    .select("id")
    .eq("lead_instructor_id", instructorId);

  if (leadCoursesError) {
    throw new Error(leadCoursesError.message);
  }

  const leadCourseIds = (leadCourses ?? []).map((row) => row.id);
  const sessionIds = new Set<string>();

  const { data: substituteSessions, error: substituteError } = await admin
    .from("sessions")
    .select("id")
    .eq("substitute_instructor_id", instructorId);

  if (substituteError) {
    throw new Error(substituteError.message);
  }

  for (const row of substituteSessions ?? []) {
    sessionIds.add(row.id);
  }

  if (leadCourseIds.length > 0) {
    const { data: leadSessions, error: leadSessionsError } = await admin
      .from("sessions")
      .select("id")
      .in("course_id", leadCourseIds);

    if (leadSessionsError) {
      throw new Error(leadSessionsError.message);
    }

    for (const row of leadSessions ?? []) {
      sessionIds.add(row.id);
    }
  }

  return sessionIds.size;
}

async function resolveEntityLabel(
  admin: AdminDeleteSupabaseClient,
  entityType: AdminDeleteEntityType,
  entityId: string,
): Promise<string> {
  switch (entityType) {
    case "instructor": {
      const { data, error } = await admin
        .from("instructors")
        .select("full_name")
        .eq("id", entityId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return data?.full_name ?? "מדריך";
    }
    case "course": {
      const { data, error } = await admin
        .from("courses")
        .select("name")
        .eq("id", entityId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return data?.name ?? "קורס";
    }
    case "institution": {
      const { data, error } = await admin
        .from("institutions")
        .select("name")
        .eq("id", entityId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return data?.name ?? "מוסד";
    }
    case "supplier": {
      const { data, error } = await admin
        .from("primary_suppliers")
        .select("name")
        .eq("id", entityId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return data?.name ?? "ספק";
    }
    case "session": {
      const { data, error } = await admin
        .from("sessions")
        .select("session_date, courses(name)")
        .eq("id", entityId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      const courseName =
        data && typeof data.courses === "object" && data.courses && "name" in data.courses
          ? String((data.courses as { name: string }).name)
          : "קורס";
      return data?.session_date ? `מפגש ${data.session_date} — ${courseName}` : "מפגש";
    }
    default:
      return entityId;
  }
}

export async function getAdminDeletePreview(
  admin: AdminDeleteSupabaseClient,
  entityType: AdminDeleteEntityType,
  entityId: string,
): Promise<AdminDeletePreview> {
  const entityLabel = await resolveEntityLabel(admin, entityType, entityId);
  const items: AdminDeleteDependencyItem[] = [];

  switch (entityType) {
    case "instructor": {
      const coursesCount = await countExact(admin, "courses", [
        { column: "lead_instructor_id", value: entityId },
      ]);
      const sessionsCount = await countInstructorLinkedSessions(admin, entityId);
      if (sessionsCount > 0) {
        items.push({ label: "מפגשים", count: sessionsCount });
      }

      if (coursesCount > 0) {
        items.push({ label: "קורסים", count: coursesCount });
      }

      if (sessionsCount > 0) {
        items.push({ label: "נתוני שכר ודוחות", count: sessionsCount });
      }

      return {
        entityType,
        entityId,
        entityLabel,
        canNormalDelete: coursesCount === 0 && sessionsCount === 0,
        items,
      };
    }
    case "course": {
      const sessionsCount = await countExact(admin, "sessions", [
        { column: "course_id", value: entityId },
      ]);
      const seriesCount = await countExact(admin, "session_series", [
        { column: "course_id", value: entityId },
      ]);

      if (sessionsCount > 0) {
        items.push({ label: "מפגשים", count: sessionsCount });
        items.push({ label: "נתוני דוחות ושכר", count: sessionsCount });
      }

      if (seriesCount > 0) {
        items.push({ label: "סדרות מפגשים (יצירה מרובה)", count: seriesCount });
      }

      return {
        entityType,
        entityId,
        entityLabel,
        canNormalDelete: sessionsCount === 0 && seriesCount === 0,
        items,
      };
    }
    case "institution": {
      const courseIds = await getCourseIdsForInstitution(admin, entityId);
      const coursesCount = courseIds.length;
      const sessionsCount = await countSessionsForCourses(admin, courseIds);
      const coordinatorsCount = await countExact(admin, "institution_coordinators", [
        { column: "institution_id", value: entityId },
      ]);

      if (coursesCount > 0) {
        items.push({ label: "קורסים", count: coursesCount });
      }

      if (sessionsCount > 0) {
        items.push({ label: "מפגשים", count: sessionsCount });
      }

      if (sessionsCount > 0) {
        items.push({ label: "נתוני דוחות ושכר", count: sessionsCount });
      }

      if (coordinatorsCount > 0) {
        items.push({ label: "רכזי מוסד", count: coordinatorsCount });
      }

      return {
        entityType,
        entityId,
        entityLabel,
        canNormalDelete: coursesCount === 0 && sessionsCount === 0 && coordinatorsCount === 0,
        items,
      };
    }
    case "supplier": {
      const institutionsCount = await countExact(admin, "institutions", [
        { column: "primary_supplier_id", value: entityId },
      ]);

      const { data: institutionRows, error: institutionRowsError } = await admin
        .from("institutions")
        .select("id")
        .eq("primary_supplier_id", entityId);

      if (institutionRowsError) {
        throw new Error(institutionRowsError.message);
      }

      const institutionIds = (institutionRows ?? []).map((row) => row.id);
      const courseIdSet = new Set<string>();

      if (institutionIds.length > 0) {
        const { data: institutionCourses, error: institutionCoursesError } = await admin
          .from("courses")
          .select("id")
          .in("institution_id", institutionIds);

        if (institutionCoursesError) {
          throw new Error(institutionCoursesError.message);
        }

        for (const row of institutionCourses ?? []) {
          courseIdSet.add(row.id);
        }
      }

      const supplierCourseIds = await getCourseIdsForSupplier(admin, entityId);

      for (const courseId of supplierCourseIds) {
        courseIdSet.add(courseId);
      }

      const courseIds = Array.from(courseIdSet);
      const coursesCount = courseIds.length;
      const sessionsCount = await countSessionsForCourses(admin, courseIds);

      if (institutionsCount > 0) {
        items.push({ label: "מוסדות", count: institutionsCount });
      }

      if (coursesCount > 0) {
        items.push({ label: "קורסים", count: coursesCount });
      }

      if (sessionsCount > 0) {
        items.push({ label: "מפגשים", count: sessionsCount });
      }

      if (sessionsCount > 0) {
        items.push({ label: "נתוני דוחות ושכר", count: sessionsCount });
      }

      return {
        entityType,
        entityId,
        entityLabel,
        canNormalDelete:
          institutionsCount === 0 && coursesCount === 0 && sessionsCount === 0,
        items,
      };
    }
    case "session": {
      const notificationCount = await countExact(admin, "notification_log", [
        { column: "session_id", value: entityId },
      ]);

      if (notificationCount > 0) {
        items.push({ label: "התראות שנשלחו", count: notificationCount });
      }

      items.push({ label: "נתוני דוחות ושכר", count: 1 });

      return {
        entityType,
        entityId,
        entityLabel,
        canNormalDelete: true,
        items,
      };
    }
    default:
      throw new Error("סוג ישות לא נתמך למחיקה.");
  }
}
