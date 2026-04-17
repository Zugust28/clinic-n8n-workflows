const events = $items('Filter Z Events', 0, 0).map(i => i.json);
const appts  = $items('Read Appointment', 0, 0).map(i => i.json);

function norm(v=''){ return String(v||'').trim().toLowerCase(); }
function isSent(v=''){ return ['ส่งแล้ว','sent','true','1','yes','y'].includes(norm(v)); }
function parseDate(v){ if(!v) return null; const d=new Date(v); if(isNaN(d)) return null; d.setHours(0,0,0,0); return d; }
function formatDateThai(v){ const d=new Date(v); return isNaN(d)?String(v||'-'):d.toLocaleDateString('th-TH'); }
function extractYear(v){ const s=String(v||'').trim(); const m=s.match(/(19\d{2}|20\d{2}|25\d{2})/); return m?Number(m[1]):0; }
function pronounByAge(age,birthYear){
  let y = Number(String(birthYear||'').trim());
  if (y){ if (y>2400) y-=543; if (y===1995) return 'คุณ'; if (y>1995) return 'พี่'; if (y<1995) return 'น้อง'; return 'คุณ';}
  const a=Number(age||0); if(!a) return 'คุณ'; if(a<=25) return 'น้อง'; if(a>=35) return 'พี่'; return 'คุณ';
}

const today = new Date(); today.setHours(0,0,0,0);
const tmr = new Date(today); tmr.setDate(today.getDate()+1);

const out = [];
for (const a of appts){
  if (!a['UID'] || isSent(a['Status'])) continue;
  const fd = parseDate(a['Follow Date']);
  if (!fd || fd.getTime() !== tmr.getTime()) continue;

  const hn = norm(a['HN']);
  const name = norm(a['Name']);

  const hit = events.find(e => {
    const txt = norm(${e.summary||''} ${e.description||''});
    return (hn && txt.includes(hn)) || (name && txt.includes(name));
  });
  if (!hit) continue;

  const age = a['Age'] ?? a['อายุ'] ?? '';
  const birthYear = extractYear(a['Birthday'] ?? a['วันเกิด'] ?? '');
  const p = pronounByAge(age, birthYear);
  const n = a['Name'] || '';

  out.push({
    json: {
      ...a,
      __message: สวัสดีครับ${p}${n} 💖\nหนูขออนุญาตทักมาแจ้งเตือนคิวนัดหมายนะครับ\n🗓 วันที่: ${formatDateThai(a['Follow Date'])} | ⏰ เวลา: ${a['Follow Time'] || '-'} น.\n💉 รายการ: ${a['Procedure'] || '-'}\nหาก${p}${n}ติดธุระ หรือต้องการเลื่อนคิว แจ้งหนูได้เลยนะครับ 🥰,
      __newStatus: 'ส่งแล้ว'
    }
  });
}
return out;
