import styles from "@/app/contact/contact.module.css";

type Coordinate = [longitude: number, latitude: number];

const landforms: Coordinate[][] = [
  [
    [-168, 69], [-151, 71], [-139, 61], [-129, 56], [-126, 49], [-123, 42], [-117, 33],
    [-110, 28], [-105, 23], [-97, 18], [-88, 16], [-83, 9], [-77, 8], [-80, 18],
    [-84, 24], [-79, 29], [-74, 35], [-67, 44], [-60, 48], [-55, 54], [-60, 61],
    [-74, 66], [-92, 72], [-112, 75], [-131, 73], [-149, 76], [-168, 69],
  ],
  [
    [-73, 59], [-55, 59], [-42, 66], [-25, 75], [-34, 83], [-52, 84], [-66, 78],
    [-73, 59],
  ],
  [
    [-81, 12], [-69, 11], [-51, 4], [-44, -3], [-36, -8], [-39, -18], [-46, -27],
    [-53, -39], [-66, -55], [-72, -47], [-76, -26], [-80, -5], [-81, 12],
  ],
  [
    [-11, 36], [-9, 44], [2, 49], [9, 55], [7, 61], [18, 70], [32, 70], [38, 61],
    [29, 54], [42, 47], [34, 39], [26, 36], [15, 40], [6, 36], [-1, 43], [-11, 36],
  ],
  [
    [-17, 36], [8, 37], [25, 32], [34, 27], [43, 12], [50, 10], [43, -12],
    [34, -26], [23, -35], [15, -34], [11, -22], [7, -5], [-4, 5], [-15, 17], [-17, 36],
  ],
  [
    [31, 31], [43, 35], [55, 29], [62, 26], [57, 16], [50, 12], [44, 12], [40, 20], [31, 31],
  ],
  [
    [-10, 36], [3, 43], [12, 46], [21, 42], [32, 45], [40, 53], [35, 61], [43, 67],
    [57, 70], [62, 78], [86, 77], [107, 77], [126, 72], [147, 67], [166, 61],
    [155, 54], [143, 51], [135, 47], [127, 43], [120, 39], [122, 32], [132, 31],
    [127, 24], [119, 19], [111, 20], [108, 10], [102, 5], [96, 12], [89, 20],
    [82, 8], [76, 8], [72, 20], [68, 25], [58, 25], [51, 29], [43, 37], [34, 35],
    [27, 39], [18, 37], [12, 41], [6, 36], [-1, 43], [-10, 36],
  ],
  [
    [95, 21], [108, 19], [119, 15], [123, 8], [117, 1], [110, -2], [105, 5], [99, 7], [95, 21],
  ],
  [
    [96, 6], [108, 7], [117, 1], [121, -5], [115, -9], [108, -8], [104, -5], [96, -6], [96, 6],
  ],
  [
    [109, 7], [114, 7], [117, 4], [118, 1], [117, -3], [114, -4], [110, -2], [108, 1], [109, 7],
  ],
  [
    [112, -11], [129, -10], [145, -14], [154, -20], [149, -27], [137, -27], [126, -23], [116, -19], [112, -11],
  ],
  [
    [130, 33], [137, 35], [142, 42], [146, 45], [144, 38], [140, 35], [138, 33], [130, 33],
  ],
  [
    [113, -22], [130, -12], [145, -14], [153, -22], [151, -32], [143, -39], [130, -36], [116, -31], [113, -22],
  ],
];

function project([longitude, latitude]: Coordinate) {
  const x = ((longitude + 180) / 360) * 1200;
  const y = ((90 - latitude) / 180) * 560;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function outline(points: Coordinate[]) {
  return `M${points.map(project).join("L")}Z`;
}

export default function ContactMap() {
  const kuching = project([110.3593, 1.5533]).split(",");

  return (
    <div className={styles.map} role="group" aria-label="Map locating KenyalangKu in Kuching, Sarawak">
      <svg className={styles.mapArt} viewBox="0 0 1200 560" aria-hidden="true">
        <defs>
          <pattern id="contact-map-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2.2" cy="2.2" r="1.45" fill="#a8b7c5" fillOpacity=".68" />
          </pattern>
          <clipPath id="contact-map-land">
            {landforms.map((points, index) => <path key={index} d={outline(points)} />)}
          </clipPath>
        </defs>
        <g className={styles.mapGrid}>
          <path d="M0 140H1200M0 280H1200M0 420H1200" />
          <path d="M300 0V560M600 0V560M900 0V560" />
        </g>
        <rect x="0" y="0" width="1200" height="560" fill="url(#contact-map-dots)" clipPath="url(#contact-map-land)" />
      </svg>
      <details className={styles.mapMarker} style={{ left: `${(Number(kuching[0]) / 1200) * 100}%`, top: `${(Number(kuching[1]) / 560) * 100}%` }}>
        <summary className={styles.mapPin} aria-label="Show KenyalangKu contact details for Kuching, Sarawak">
          <span />
        </summary>
        <div className={styles.mapTooltip}>
          <span className={styles.tooltipKicker}>KENYALANGKU / MALAYSIA</span>
          <strong>Kuching, Sarawak</strong>
          <span>1.5533° N · 110.3593° E</span>
          <a href="mailto:kenyalangku@gmail.com">kenyalangku@gmail.com</a>
          <span>Phone unavailable</span>
        </div>
      </details>
      <span className={styles.mapCoordinates} aria-hidden="true">01°33′ N &nbsp; 110°21′ E</span>
    </div>
  );
}
