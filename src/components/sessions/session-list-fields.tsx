import Link from "next/link";

import {
  formatSessionDate,
  formatSessionHoursDisplay,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import type { SessionListItem } from "@/components/sessions/get-sessions";
import { MobileCardField } from "@/components/ui/mobile-card";
import { MOBILE_CARD_TEXT_BLOCK_CLASS } from "@/components/ui/mobile-card-classes";

type SessionListFieldsProps = {
  session: SessionListItem;
  showInstitution: boolean;
  linkCourse?: boolean;
  showInstructorHours?: boolean;
  showInstructorName?: boolean;
};

export function SessionListFields({
  session,
  showInstitution,
  linkCourse = true,
  showInstructorHours = false,
  showInstructorName = false,
}: SessionListFieldsProps) {
  return (
    <div className={MOBILE_CARD_TEXT_BLOCK_CLASS}>
      <MobileCardField value={formatSessionDate(session.session_date)} emphasize />
      <MobileCardField value={formatSessionTimeRange(session.start_time, session.end_time)} dir="ltr" />
      {linkCourse ? (
        <p className="text-sm">
          <Link
            href={`/courses/${session.course_id}/sessions`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {session.course_name}
          </Link>
        </p>
      ) : (
        <MobileCardField value={session.course_name} />
      )}
      {showInstitution ? (
        <MobileCardField label="מוסד: " value={session.institution_name || "—"} />
      ) : null}
      {showInstructorHours ? (
        <MobileCardField
          label="שעות מדריך: "
          value={formatSessionHoursDisplay(session.instructor_hours)}
        />
      ) : null}
      {showInstructorName ? (
        <MobileCardField label="מדריך: " value={session.instructor_name} />
      ) : null}
    </div>
  );
}
