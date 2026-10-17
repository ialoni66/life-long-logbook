import { StyleSheet } from "react-native";

export const colors = {
  bg: "#1b2130", card: "#455278", fg: "#f4f6fb", mut: "#c6cee0", acc: "#6ea6ff", line: "#4d5a78",
  onAcc: "#0e1420", // text on top of the accent color
  inputBg: "#f4ecc2", inputFg: "#1b1f2a", inputLine: "#d8cd96", placeholder: "#858585",
};

export const INDENT = 14; // how far boxes (and the Skip links above them) are inset from the title

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingTop: 24, paddingBottom: 56, maxWidth: 640, width: "100%", alignSelf: "center" },
  title: { fontSize: 20, fontWeight: "700", color: colors.fg, marginBottom: 18 },
  label: { color: colors.mut, fontSize: 13, marginBottom: 4 },
  // Boxes sit inset from the title and labels, which stay on the page's left edge.
  input: { backgroundColor: colors.inputBg, color: colors.inputFg, borderWidth: 1, borderColor: colors.inputLine, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, marginBottom: 18, marginHorizontal: INDENT },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  modalBack: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
  gear: { fontSize: 26, color: colors.fg, paddingHorizontal: 6 },
  option: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 18, marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  optionOn: { borderColor: colors.acc },
  // The Search box keeps its original full-width size (the entry form's boxes are smaller and inset).
  searchBox: { marginHorizontal: 0, paddingVertical: 14, paddingHorizontal: 14, fontSize: 16, borderRadius: 12, marginBottom: 22 },
  // "Where we met" and the date share one row, lined up with the other boxes.
  rowWithDate: { flexDirection: "row", gap: 10, marginHorizontal: INDENT, marginBottom: 18 },
  inputOff: { opacity: 0.45 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4, marginHorizontal: INDENT, minHeight: 18 },
  skip: { color: colors.acc, fontSize: 14, fontWeight: "600" },
  multi: { minHeight: 96, textAlignVertical: "top" },
  btn: { backgroundColor: colors.acc, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 6, marginBottom: 14 },
  btnText: { color: colors.onAcc, fontWeight: "600", fontSize: 16 },
  btn2: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 14 },
  btn2Text: { color: colors.fg, fontSize: 16 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 18, marginBottom: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  cardName: { fontWeight: "600", fontSize: 17, color: colors.fg },
  cardDate: { color: colors.mut, fontSize: 13 },
  cardText: { color: colors.fg, marginTop: 10, lineHeight: 21 },
  cardSub: { color: colors.mut, marginTop: 8 },
  tabs: { flexDirection: "row", backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.line },
  tab: { flex: 1, paddingVertical: 18, paddingHorizontal: 14, alignItems: "center" },
  tabText: { color: colors.mut, fontWeight: "600" },
  tabOn: { color: colors.acc },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.acc, borderColor: colors.acc },
  chipText: { color: colors.fg },
  chipTextOn: { color: colors.onAcc },
  link: { color: colors.acc, marginBottom: 12 },
  empty: { color: colors.mut, textAlign: "center", marginTop: 30 },
});
