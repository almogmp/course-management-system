import Link from "next/link";

import {
  formatSessionDate,
  formatSessionHoursDisplay,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import type { SessionListItem } from "@/components/sessions/get-sessions";
import { formatSessionStatusLabel } from "@/lib/admin-reports/filters";
import { MobileCardField } from "@/components/ui/mobile-card";
import { MOBILE_CARD_TEXT_BLOCK_CLASS } from "@/components/ui/mobile-card-classes";

type SessionListFieldsProps = {
  session: SessionListItem;
  showInstitution: boolean;
  linkCourse?: boolean;
  showInstructorHours?: boolean;
  showStatus?: boolean;
};

export function SessionListFields({
  session,
  showInstitution,
  linkCourse = true,
  showInstructorHours = false,
  showStatus = false,
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
      {showInstitution && session.institution_name ? (
        <MobileCardField label="מוסד: " value={session.institution_name} />
      ) : null}
      {showInstructorHours ? (
        <MobileCardField
          label="שעות מדריך: "
          value={formatSessionHoursDisplay(session.instructor_hours)}
        />
      ) : null}
      {showStatus ? (
        <MobileCardField label="סטטוס: " value={formatSessionStatusLabel(session.status)} />
      ) : null}
      <MobileCardField label="מדריך: " value={session.instructor_name} />
    </div>
  );
}
