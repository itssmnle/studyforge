const LEGACY_CLASS_PRESETS = new Map([
  ["10a-science", "10A Science"],
  ["10b-science", "10B Science"],
  ["11a-biology", "11A Biology"],
]);

export const isUnusedLegacyClassPreset = (schoolClass) => (
  LEGACY_CLASS_PRESETS.get(schoolClass?.id) === schoolClass?.name
  && (!Array.isArray(schoolClass.studentUsernames) || schoolClass.studentUsernames.length === 0)
);
