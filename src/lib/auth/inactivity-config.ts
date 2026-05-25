/** זמן חוסר פעילות לפני התנתקות אוטומטית */
export const INACTIVITY_LOGOUT_MS = 60 * 60 * 1000;

/** התראה לפני ההתנתקות */
export const INACTIVITY_WARNING_BEFORE_MS = 60 * 1000;

/** מתי להציג את מודל האזהרה (דקה לפני סיום) */
export const INACTIVITY_WARN_AT_MS = INACTIVITY_LOGOUT_MS - INACTIVITY_WARNING_BEFORE_MS;

/** מרווח מינימלי בין איפוסי טיימר בגלל אירועי פעילות */
export const INACTIVITY_ACTIVITY_THROTTLE_MS = 1000;
