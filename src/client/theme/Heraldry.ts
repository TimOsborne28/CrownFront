const FIELDS = ["#852f28", "#294e70", "#315945", "#624363", "#6b482e"];
const METALS = ["#f2d38a", "#eadfc7"];
const CHARGES = [
  '<path d="M32 8L37 23L53 23L40 33L45 49L32 39L19 49L24 33L11 23H27Z"/>',
  '<path d="M10 21L21 31L32 12L43 31L54 21L49 46H15ZM16 50H48V55H16Z"/>',
  '<path d="M17 53V25H12V12H22V20H28V12H37V20H43V12H53V25H48V53H38V38H27V53Z"/>',
  '<path d="M32 6L39 13L36 34L48 39L44 45L34 41L28 55L20 58L17 52L25 38L14 34L18 28L29 32Z"/>',
  '<path d="M32 7C46 18 41 26 35 31C48 20 58 30 48 38L38 38L43 45H35V56H29V45H21L26 38H16C6 30 16 20 29 31C23 26 18 18 32 7Z"/>',
  '<path d="M29 8H35V45Q47 45 53 35L48 35L55 27L60 39L55 37Q50 53 32 58Q14 53 9 37L4 39L9 27L16 35H11Q17 45 29 45ZM18 21H46V27H18Z"/>',
];

/** Render-only heraldry: the original URL is an identity key, never fetched. */
export function heraldicDesign(key: string) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash ^ key.charCodeAt(i), 16777619) >>> 0;
  }
  return {
    field: FIELDS[hash % FIELDS.length],
    metal: METALS[(hash >>> 5) % METALS.length],
    division: (hash >>> 9) % 4,
    charge: (hash >>> 13) % CHARGES.length,
  };
}

export function heraldicSvg(key: string, crown = false): string {
  const { field, metal, division, charge } = heraldicDesign(key);
  const width = crown ? 85 : 128;
  const opening = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="85" viewBox="0 0 ${width} 85">`;
  if (crown) {
    return (
      opening +
      `<g transform="translate(1 1) scale(1.3)" fill="${metal}" stroke="#332414" stroke-width="2" stroke-linejoin="round">` +
      '<path d="M7 20L20 32L32 8L44 32L57 20L51 49H13Z"/>' +
      `<path d="M14 53H50V60H14Z" fill="${field}"/>` +
      `<circle cx="32" cy="39" r="5" fill="${field}"/>` +
      "</g></svg>"
    );
  }
  const shield = "M22 7H106V37Q105 62 64 79Q23 62 22 37Z";
  const divisions = [
    '<path d="M56 7H72V79H56Z"/>',
    '<path d="M18 5L33 3L112 70L101 83Z"/>',
    '<path d="M22 7H64V42H106V79H64V42H22Z"/>',
    '<path d="M22 31H106V43H22ZM22 51H106V59H22Z"/>',
  ];
  return (
    opening +
    `<defs><clipPath id="shield"><path d="${shield}"/></clipPath></defs>` +
    `<path d="${shield}" fill="${field}" stroke="#332414" stroke-width="5"/>` +
    `<g clip-path="url(#shield)" fill="${metal}" opacity=".24">${divisions[division]}</g>` +
    `<path d="${shield}" fill="none" stroke="${metal}" stroke-width="2"/>` +
    `<g transform="translate(32 10)" fill="${metal}" stroke="${field}" stroke-width="1.2" stroke-linejoin="round">${CHARGES[charge]}</g>` +
    "</svg>"
  );
}
