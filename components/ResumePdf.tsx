import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Polygon,
  Line as SvgLine,
  Circle as SvgCircle,
} from "@react-pdf/renderer";

/* ─── Brand colors ───────────────────────────────────────────────── */
const OXBLOOD = "#6b1620";
const INK = "#1a1a1a";
const MUTED = "#6b6b6b";
const RULE = "#d0d0d0";
const PARCHMENT = "#f5f0e8";

/* ─── Types ──────────────────────────────────────────────────────── */

export type ResumePdfData = {
  studentName: string;
  studentSchool: string | null;
  studentGradYear: number | null;
  resumeCode: string;
  generatedAt: string; // ISO
  cohortSize: number;
  overallPercentile: number | null;
  overallAggregate: number | null;
  isProvisional: boolean;
  taskCount: number;
  dimensions: Array<{
    key: "strategy" | "execution" | "communication" | "technical" | "creativity";
    label: string;
    aggregate: number | null;
    percentile: number | null;
  }>;
  /** Most recent completed tasks (with feedback). Cap at 8. */
  completedTasks: Array<{
    title: string;
    companyName: string;
    category: string;
    totalScore: number;
    completedAt: string;
  }>;
  /** Tasks beyond the 8-row cap, for the "+ N more" footer. */
  extraTaskCount: number;
};

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 36,
    fontFamily: "Helvetica",
    color: INK,
    fontSize: 10,
    lineHeight: 1.4,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  wordmark: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 2.5,
    color: OXBLOOD,
  },
  verifySmall: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 0.4,
    textAlign: "right",
  },
  rule: {
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
    marginTop: 6,
    marginBottom: 18,
  },
  ruleFooter: {
    borderTopWidth: 0.5,
    borderTopColor: RULE,
    marginTop: 16,
    marginBottom: 10,
  },
  name: {
    fontFamily: "Times-Roman",
    fontSize: 30,
    color: OXBLOOD,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  meta: {
    fontSize: 10,
    color: MUTED,
    marginBottom: 24,
  },

  /* Hero */
  heroBlock: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  heroLine: {
    fontFamily: "Times-Roman",
    fontSize: 22,
    color: INK,
    textAlign: "center",
    marginBottom: 4,
  },
  heroMeta: {
    fontSize: 9,
    color: MUTED,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  /* Body two-column */
  body: {
    flexDirection: "row",
    gap: 28,
    marginTop: 8,
    flexGrow: 1,
  },
  col: {
    flex: 1,
  },
  sectionHeader: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 2,
    color: OXBLOOD,
    marginBottom: 14,
  },

  /* Dimension rows */
  dimRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },
  dimLabel: {
    fontSize: 10,
    color: INK,
  },
  dimPercentile: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    color: OXBLOOD,
  },
  dimScore: {
    fontSize: 9,
    color: MUTED,
    marginLeft: 6,
  },
  dimEmpty: {
    fontSize: 9,
    color: MUTED,
    fontStyle: "italic",
  },

  /* Task entries */
  taskItem: {
    paddingTop: 7,
    paddingBottom: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },
  taskTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: INK,
    marginBottom: 2,
  },
  taskSub: {
    fontSize: 9,
    color: MUTED,
  },
  taskScoreInline: {
    color: OXBLOOD,
    fontFamily: "Helvetica-Bold",
  },
  extraTaskNote: {
    marginTop: 8,
    fontSize: 9,
    color: MUTED,
    fontStyle: "italic",
  },
  emptyState: {
    fontSize: 10,
    color: MUTED,
    fontStyle: "italic",
  },

  /* Footer */
  footer: {
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
});

/* ─── Document ───────────────────────────────────────────────────── */

export function ResumePdf({ data }: { data: ResumePdfData }) {
  const verifyUrl = `runeships.com/v/${data.resumeCode}`;
  const generatedDate = new Date(data.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document
      title={`RuneShips resume — ${data.studentName}`}
      author="RuneShips"
    >
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.wordmark}>RUNESHIPS</Text>
          <View>
            <Text style={styles.verifySmall}>Verify at</Text>
            <Text style={[styles.verifySmall, { color: OXBLOOD }]}>
              {verifyUrl}
            </Text>
          </View>
        </View>
        <View style={styles.rule} />
        <Text style={styles.name}>{data.studentName}</Text>
        <Text style={styles.meta}>
          {[
            data.studentSchool,
            data.studentGradYear ? `Class of ${data.studentGradYear}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Unaffiliated"}
        </Text>

        {/* HERO */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroLine}>{heroLine(data)}</Text>
          <Text style={styles.heroMeta}>{heroMeta(data, generatedDate)}</Text>
        </View>

        {/* BODY: two columns */}
        <View style={styles.body}>
          {/* LEFT — skill dimensions */}
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>SKILL DIMENSIONS</Text>
            <Radar data={data} />
            <View style={{ marginTop: 12 }}>
              {data.dimensions.map((d) => (
                <View key={d.key} style={styles.dimRow}>
                  <Text style={styles.dimLabel}>{d.label}</Text>
                  {d.percentile !== null && d.aggregate !== null ? (
                    <Text>
                      <Text style={styles.dimPercentile}>
                        Top {Math.max(1, 100 - d.percentile)}%
                      </Text>
                      <Text style={styles.dimScore}>
                        {" "}
                        · {Math.round(d.aggregate)}/100
                      </Text>
                    </Text>
                  ) : (
                    <Text style={styles.dimEmpty}>No data yet</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* RIGHT — completed tasks */}
          <View style={styles.col}>
            <Text style={styles.sectionHeader}>COMPLETED TASKS</Text>
            {data.completedTasks.length === 0 ? (
              <Text style={styles.emptyState}>No tasks completed yet</Text>
            ) : (
              <>
                {data.completedTasks.map((t, i) => (
                  <View key={`${t.title}-${i}`} style={styles.taskItem}>
                    <Text style={styles.taskTitle}>{t.title}</Text>
                    <Text style={styles.taskSub}>
                      {t.companyName} · {t.category} ·{" "}
                      <Text style={styles.taskScoreInline}>
                        Score {Math.round(t.totalScore)}/100
                      </Text>
                    </Text>
                  </View>
                ))}
                {data.extraTaskCount > 0 && (
                  <Text style={styles.extraTaskNote}>
                    + {data.extraTaskCount} more completed task
                    {data.extraTaskCount === 1 ? "" : "s"}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* FOOTER */}
        <View>
          <View style={styles.ruleFooter} />
          <Text style={styles.footer}>
            RuneShips is a skill assessment platform that evaluates student
            work across five dimensions: strategy, execution, communication,
            technical, and creativity. Scores reflect AI-generated feedback on
            real submitted work. Generated {generatedDate}.
          </Text>
          <View style={styles.footerRow}>
            <Text style={[styles.footer, { color: MUTED }]}>
              Verification code: {data.resumeCode}
            </Text>
            <Text style={[styles.footer, { color: OXBLOOD }]}>
              {verifyUrl}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function heroLine(data: ResumePdfData): string {
  if (data.overallPercentile === null || data.taskCount === 0) {
    return `Skill profile in progress — ${data.taskCount} task${data.taskCount === 1 ? "" : "s"} completed`;
  }
  const topPct = Math.max(1, 100 - data.overallPercentile);
  return `Top ${topPct}% on RuneShips`;
}

function heroMeta(data: ResumePdfData, generatedDate: string): string {
  if (data.overallPercentile === null) {
    return `Updated ${generatedDate}`;
  }
  const cohortLine = `Across ${data.cohortSize.toLocaleString()} student${data.cohortSize === 1 ? "" : "s"}`;
  const provisional = data.isProvisional ? " · Provisional rank" : "";
  return `${cohortLine}${provisional} · Updated ${generatedDate}`;
}

/* ─── Pentagon radar (raw SVG inside react-pdf) ──────────────────── */

function Radar({ data }: { data: ResumePdfData }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 14;
  const axes = data.dimensions.length || 5;

  // 5 pentagon rings
  const rings = [0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => {
    const r = maxR * scale;
    const pts = polygonPoints(axes, cx, cy, r);
    return (
      <Polygon
        key={i}
        points={pts}
        fill="none"
        stroke={RULE}
        strokeWidth={0.5}
      />
    );
  });

  // axes (5 spokes)
  const spokes = Array.from({ length: axes }).map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
    return (
      <SvgLine
        key={i}
        x1={cx}
        y1={cy}
        x2={cx + maxR * Math.cos(angle)}
        y2={cy + maxR * Math.sin(angle)}
        stroke={RULE}
        strokeWidth={0.5}
      />
    );
  });

  // user polygon — pull aggregate / 100 for each dimension
  const userPts = data.dimensions
    .map((d, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
      const v = d.aggregate !== null ? Math.max(0, Math.min(1, d.aggregate / 100)) : 0;
      const r = maxR * v;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(" ");

  return (
    <View style={{ alignItems: "center", marginBottom: 4 }}>
      <Svg width={size} height={size}>
        {rings}
        {spokes}
        <Polygon
          points={userPts}
          fill={OXBLOOD}
          fillOpacity={0.18}
          stroke={OXBLOOD}
          strokeWidth={1}
        />
        {/* center dot */}
        <SvgCircle cx={cx} cy={cy} r={1.5} fill={OXBLOOD} />
      </Svg>
    </View>
  );
}

function polygonPoints(
  sides: number,
  cx: number,
  cy: number,
  r: number,
): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

/* PARCHMENT exported in case caller wants to tint anything */
export { PARCHMENT };
