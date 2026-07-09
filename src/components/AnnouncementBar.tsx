// Site-wide scrolling promo/announcement bar shown above the nav.
// Add more strings to MESSAGES to rotate multiple offers through the ticker.
const MESSAGES = [
  "Buy any 2 sets and get 1 mysterious press-on nail set FREE",
];

export function AnnouncementBar() {
  // Repeat the messages enough times to fill the width, then duplicate the
  // whole strip so the marquee loops seamlessly at -50%.
  const strip = [];
  for (let r = 0; r < 6; r++) {
    for (let m = 0; m < MESSAGES.length; m++) {
      strip.push(
        <span key={`${r}-${m}`} className="mx-8 inline-flex items-center gap-2">
          <span aria-hidden>✨</span>
          {MESSAGES[m]}
        </span>
      );
    }
  }

  return (
    <div className="overflow-hidden bg-navy text-white">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2 text-xs font-medium tracking-wide sm:text-sm">
        <div className="flex">{strip}</div>
        <div className="flex" aria-hidden>
          {strip}
        </div>
      </div>
    </div>
  );
}
