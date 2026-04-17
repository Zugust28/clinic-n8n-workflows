// Node: Extract Event
const body = items[0].json.body || items[0].json;
const ev = body.events?.[0];
if (!ev) return [];
return [{ json: { uid: ev.source?.userId  '', text: (ev.message?.text  '').trim() } }];
