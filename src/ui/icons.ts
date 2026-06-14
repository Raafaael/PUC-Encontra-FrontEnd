const ICONS: Record<string, string[]> = {
  archive: [
    '<path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/>',
    '<path d="M23 4H1v4h22z"/>',
    '<path d="M10 12h4"/>',
  ],
  "badge-check": [
    '<path d="M7.5 4.2 12 2l4.5 2.2 4.7.6-.8 4.7 2 4.3-4.3 2-.8 4.7-4.7-.6L8 22l-2.2-4.2-4.7-.6.8-4.7-2-4.3 4.3-2z"/>',
    '<path d="m8.5 12.5 2.2 2.2 4.8-5"/>',
  ],
  check: ['<path d="m20 6-11 11-5-5"/>'],
  "check-circle-2": ['<circle cx="12" cy="12" r="9"/>', '<path d="m8 12 2.5 2.5L16 9"/>'],
  inbox: ['<path d="M22 12h-6l-2 3h-4l-2-3H2"/>', '<path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>'],
  "key-round": ['<path d="M2 18a6 6 0 1 0 10.5-4H22v-4h-4V6h-4v4h-1.5A6 6 0 0 0 2 18z"/>', '<circle cx="8" cy="18" r="1.5"/>'],
  "list-filter": ['<path d="M3 6h18"/>', '<path d="M7 12h10"/>', '<path d="M10 18h4"/>'],
  lock: ['<rect x="4" y="11" width="16" height="10" rx="2"/>', '<path d="M8 11V7a4 4 0 0 1 8 0v4"/>'],
  "log-in": ['<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>', '<path d="m10 17 5-5-5-5"/>', '<path d="M15 12H3"/>'],
  "log-out": ['<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>', '<path d="m16 17 5-5-5-5"/>', '<path d="M21 12H9"/>'],
  "mail-question": ['<rect x="3" y="5" width="18" height="14" rx="2"/>', '<path d="m3 7 9 6 9-6"/>', '<path d="M12 16h.01"/>', '<path d="M10.5 11a2 2 0 1 1 3 1.7c-.8.4-1.5.8-1.5 1.8"/>'],
  "map-pin": ['<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/>', '<circle cx="12" cy="10" r="3"/>'],
  pencil: ['<path d="M12 20h9"/>', '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'],
  plug: ['<path d="M12 22v-5"/>', '<path d="M9 8V2"/>', '<path d="M15 8V2"/>', '<path d="M6 8h12v3a6 6 0 0 1-12 0z"/>'],
  plus: ['<path d="M12 5v14"/>', '<path d="M5 12h14"/>'],
  "plus-circle": ['<circle cx="12" cy="12" r="9"/>', '<path d="M12 8v8"/>', '<path d="M8 12h8"/>'],
  "refresh-cw": ['<path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>', '<path d="M3 21v-5h5"/>', '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>', '<path d="M21 3v5h-5"/>'],
  "rotate-ccw": ['<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>', '<path d="M3 3v5h5"/>'],
  save: ['<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>', '<path d="M17 21v-8H7v8"/>', '<path d="M7 3v5h8"/>'],
  search: ['<circle cx="11" cy="11" r="7"/>', '<path d="m21 21-4.3-4.3"/>'],
  send: ['<path d="m22 2-7 20-4-9-9-4z"/>', '<path d="M22 2 11 13"/>'],
  "settings-2": ['<path d="M20 7h-9"/>', '<path d="M14 17H4"/>', '<circle cx="7" cy="7" r="3"/>', '<circle cx="17" cy="17" r="3"/>'],
  tags: ['<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/>', '<circle cx="7.5" cy="7.5" r="1.5"/>'],
  "trash-2": ['<path d="M3 6h18"/>', '<path d="M8 6V4h8v2"/>', '<path d="M19 6l-1 15H6L5 6"/>', '<path d="M10 11v6"/>', '<path d="M14 11v6"/>'],
  "user-cog": ['<circle cx="10" cy="8" r="4"/>', '<path d="M2 21a8 8 0 0 1 13-6"/>', '<circle cx="18" cy="17" r="3"/>', '<path d="M18 13v1"/>', '<path d="M18 20v1"/>', '<path d="M14 17h1"/>', '<path d="M21 17h1"/>'],
  "user-plus": ['<circle cx="9" cy="8" r="4"/>', '<path d="M2 21a7 7 0 0 1 14 0"/>', '<path d="M19 8v6"/>', '<path d="M16 11h6"/>'],
  "user-round": ['<circle cx="12" cy="8" r="5"/>', '<path d="M20 21a8 8 0 0 0-16 0"/>'],
  x: ['<path d="M18 6 6 18"/>', '<path d="m6 6 12 12"/>'],
};

export function syncIcons(): void {
  document.querySelectorAll<HTMLElement>("i[data-icon]").forEach((placeholder) => {
    const name = placeholder.dataset.icon ?? "";
    placeholder.outerHTML = renderIcon(name);
  });
}

function renderIcon(name: string): string {
  const paths = ICONS[name] ?? ICONS.search;

  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      ${paths.join("")}
    </svg>
  `;
}
