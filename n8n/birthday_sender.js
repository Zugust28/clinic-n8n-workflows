function extractMD(v){
  const s = String(v||'').trim();
  const d = new Date(s);
  if (!isNaN(d)) return ${d.getMonth()+1}-${d.getDate()};
  const m = s.match(/(\d{1,2})\/\-/);
  if (m) return ${Number(m[2])}-${Number(m[1])};
  return '';
}
const now = new Date();
const md = ${now.getMonth()+1}-${now.getDate()};
const out = [];

for (const item of items){
  const r = item.json;
  if (!r['UID']) continue;
  if (extractMD(r['Birthday']) !== md) continue;

  const nick = r['Nickname']  r['HN']  '';
  out.push({ json: { ...r, __message: สุขสันต์วันเกิดนะครับคุณ${nick} 🎉\nขอให้มีความสุข สุขภาพแข็งแรง และสวยปังตลอดปีครับ 💖, Send_Timestamp: new Date().toISOString() } });
}
return out;
