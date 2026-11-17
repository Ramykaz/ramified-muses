// English site database: your Supabase project. Both values are public by design.
// The games are protected by the locked table and the cg_sync function in supabase/schema.sql.
window.ENGLISH_CONFIG = {
  supabaseUrl: 'https://wavcixvghfgszowfbinf.supabase.co',
  supabaseKey: 'sb_publishable_ueIAIOyaiLjg885CfD5x2Q_vr800LFc',
};
// Sends this device's games and gets the shared library back: { games: [...] }
window.classSync = async function (library, games) {
  const C = window.ENGLISH_CONFIG || {};
  if (!C.supabaseUrl) throw new Error("Not connected to a database (config.js).");
  const headers = { apikey: C.supabaseKey, "Content-Type": "application/json" };
  if (/^eyJ/.test(C.supabaseKey || "")) headers.Authorization = "Bearer " + C.supabaseKey;
  const r = await fetch(C.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/rpc/cg_sync", { method: "POST", headers, body: JSON.stringify({ library, games }) });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j || j.error) throw Object.assign(new Error((j && j.error) || "save failed"), { told: j && j.error });
  return j;
};
