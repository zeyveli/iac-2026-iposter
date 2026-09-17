const PROFILE_SOURCE = "data/CFD/base_similarity_profiles.csv";
const QUALIFICATION_SOURCE = "data/CFD/base_qualification.csv";
const CASE = "Laminar flat-plate Blasius boundary layer";

function splitCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith("#"));
  const headers = splitCsvLine(lines.shift());

  return lines.map(line => Object.fromEntries(
    splitCsvLine(line).map((value, index) => {
      const numeric = Number(value);
      return [headers[index], value !== "" && Number.isFinite(numeric) ? numeric : value];
    })
  ));
}

export function buildProfileSeries(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.station)) grouped.set(row.station, []);
    grouped.get(row.station).push(row);
  }

  return [...grouped].map(([id, stationRows]) => ({
    id,
    label: `x = ${stationRows[0].x.toFixed(2)}`,
    source: PROFILE_SOURCE,
    case: CASE,
    xStation: stationRows[0].x,
    reynoldsX: stationRows[0].Rex,
    eta: stationRows.map(row => row.eta),
    numerical: stationRows.map(row => row.u_over_Ue),
    analytical: stationRows.map(row => row.blasius_fp)
  }));
}

export function buildIntegralSeries(qualificationRows) {
  const snapshot = [...qualificationRows].sort((a, b) => a.x - b.x);
  const x = snapshot.map(row => row.x);
  const definitions = [
    ["deltaStar", "Displacement thickness", "δ*", "dstar", "dstar_ref", "dstar_rel_err"],
    ["theta", "Momentum thickness", "θ", "theta", "theta_ref", "theta_rel_err"],
    ["H12", "Shape factor", "H₁₂", "H12", "H12_ref", "H12_rel_err"],
    ["Cf", "Skin-friction coefficient", "Cᶠ", "Cf", "Cf_ref", "Cf_rel_err"]
  ];

  const maximumRelativeErrors = Object.fromEntries(definitions.map(([id, , , , , errorColumn]) => [
    id,
    Math.max(...snapshot.map(row => Math.abs(row[errorColumn]))) * 100
  ]));

  return {
    source: QUALIFICATION_SOURCE,
    referenceSource: QUALIFICATION_SOURCE,
    case: CASE,
    x,
    xStation: x,
    maximumRelativeErrors,
    provenanceNote: "The manuscript-generating qualification export carries numerical values, independent ODE-Blasius references, and the relative-error columns used for the reported maxima.",
    metrics: definitions.map(([id, label, symbol, column, referenceColumn]) => ({
      id,
      label,
      symbol,
      source: QUALIFICATION_SOURCE,
      referenceSource: QUALIFICATION_SOURCE,
      case: CASE,
      xStation: x,
      numerical: snapshot.map(row => row[column]),
      analytical: snapshot.map(row => row[referenceColumn])
    }))
  };
}

export const validationSources = Object.freeze({
  profiles: PROFILE_SOURCE,
  qualification: QUALIFICATION_SOURCE,
  case: CASE
});
