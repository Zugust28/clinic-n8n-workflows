const today = new Date();
today.setHours(0, 0, 0, 0);

function normalizeText(v) { return String(v || '').trim().toLowerCase(); }
function isSent(v) { return ['ส่งแล้ว','sent','true','1','yes','y'].includes(normalizeText(v)); }
function parseDate(v) { if (!v) return null; const d = new Date(v); if (isNaN(d)) return null; d.setHours(0,0,0,0); return d; }
function diffDays(a,b) { return Math.floor((b-a)/(10006060*24)); }
function isNormalReply(v) {
  const s = normalizeText(v);
  return ['โอเค','ปกติ','ดี','ไม่มีปัญหา','ok','normal','fine'].some(k => s.includes(k));
}
function extractYear(v){
  const s = String(v||'').trim();
  const m = s.match(/(19\d{2}|20\d{2}|25\d{2})/);
  return m ? Number(m[1]) : 0;
}
function pronounByAge(age, birthYear){
  let y = Number(String(birthYear||'').trim());
  if (y){
    if (y > 2400) y -= 543;
    if (y === 1995) return 'คุณ';
    if (y > 1995) return 'พี่';
    if (y < 1995) return 'น้อง';
    return 'คุณ';
  }
  const a = Number(age||0);
  if (!a) return 'คุณ';
  if (a <= 25) return 'น้อง';
  if (a >= 35) return 'พี่';
  return 'คุณ';
}

const out = [];
for (const item of items) {
  const r = item.json;
  const uid = r['UID'];
  const name = r['Name'] || '';
  const proc = r['Procedure Name/Type'] || 'หัตถการ';
  const pdate = parseDate(r['Procedure Date']);
  if (!uid || !pdate) continue;

  const age = r['Age'] ?? r['อายุ'] ?? '';
  const birthYear = extractYear(r['Birthday'] ?? r['วันเกิด'] ?? '');
  const p = pronounByAge(age, birthYear);
  const dd = diffDays(pdate, today);

  if (dd === 1 && !isSent(r['Day1Sent'])) {
    out.push({ json: { ...r, __type:'DAY1', __setCol:'Day1Sent', __message:สวัสดีครับ${p}${name} 💖\nหนูขออนุญาตสอบถามอาการหลังทำ ${proc} ไปเมื่อวานครับ\nวันนี้มีอาการบวม ช้ำ หรือปวดระบมตรงไหนบ้างไหมครับ 🙏🏻 } });
    continue;
  }
  if (dd === 7 && !isSent(r['Day7Sent']) && !isNormalReply(r['Day1Reply'])) {
    out.push({ json: { ...r, __type:'DAY7', __setCol:'Day7Sent', __message:สวัสดีครับ${p}${name} 💖\nครบ 1 สัปดาห์หลังทำ ${proc} แล้ว\nอาการบวมน่าจะเริ่มดีขึ้นแล้ว ตอนนี้หน้าเริ่มเข้าที่หรือยังครับ มีจุดไหนกังวลเป็นพิเศษไหมครับ } });
    continue;
  }
  if (dd === 14 && !isSent(r['Day14Sent'])) {
    out.push({ json: { ...r, __type:'DAY14', __setCol:'Day14Sent', __message:สวัสดีครับ${p}${name} 💖\nครบ 2 สัปดาห์แล้ว ตอนนี้ ${proc} ผลลัพธ์เป็นยังไงบ้างครับ } });
    continue;
  }

  const isBotox = String(proc).toLowerCase().includes('botox') || String(proc).includes('โบท็อก');
  if (isBotox && dd >= 120 && !isSent(r['Botox4MSent'])) {
    out.push({ json: { ...r, __type:'BOTOX4M', __setCol:'Botox4MSent', __message:สวัสดีครับ${p}${name} 💖\nหนูขออนุญาตทักมาแจ้งเตือนว่า ตอนนี้ครบรอบเติม Botox แล้วนะครับ 💉✨\nเพื่อคงผลลัพธ์ให้เป๊ะอย่างต่อเนื่อง หากสะดวกเข้ามาช่วงวันไหน แจ้งหนูเพื่อเช็กคิวว่างได้เลยนะครับ 🥰 } });
    continue;
  }

  if (dd >= 180 && !isSent(r['Voucher6MSent'])) {
    out.push({ json: { ...r, __type:'VOUCHER6M', __setCol:'Voucher6MSent', __message:สวัสดีครับ${p}${name} 💖\nหนูเช็กประวัติแล้วเห็นว่าเราไม่ได้เจอกันตั้ง 6 เดือน\nหนูเลยไปขออนุมัติ Voucher ส่วนลด 5% เก็บไว้ให้เป็นกรณีพิเศษครับ\nเผื่อช่วงไหนอยากแวะมาเติมสวยทักหาหนูได้ตลอดเลยนะครับ 😊 } });
  }
}
return out;
