/** Hardcoded configuration for the template-02 (watercolor) invitation design. */
export const template02Config = {
  showCountdown:    true,
  countdownHeading: 'Count Down',
  showSchedule:     true,
  showRsvp:         true,
  rsvpMessage:      'In case of any query, feel free to reach out to us.',
  // media.background_video_url is intentionally unused in this design —
  // the watercolor archway artwork is the hero background.
} as const;

export const T2_ASSETS = '/assets/template-02';

/** Palette shared across template-02 sections. */
export const t2 = {
  paper:     '#FBF7EF',
  ink:       '#3A4A5C',
  accent:    '#5B7A9D',
  heading:   '#2E4964',
  lightText: '#F2ECDF',
} as const;
