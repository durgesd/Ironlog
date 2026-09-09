/* ==========================================================================
   IRONLOG — Storage layer
   All data lives in localStorage on-device only. Nothing is transmitted.
   db = {
     routines: [{id, name}],
     logs: {
       'YYYY-MM-DD': {
         routineId, notes,
         exercises: [{id, name, muscle, equipment, sets:[{weight,reps,done}]}]
       }
     },
     photos: [{id, date, dataUrl}]
   }
   ========================================================================== */

const IronStore = (function(){
  const STORE_KEY = "ironlog_data_v2";

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function defaultDB(){
    return {
      routines: [
        { id: uid(), name: "Push Day" },
        { id: uid(), name: "Pull Day" },
        { id: uid(), name: "Leg Day" }
      ],
      logs: {},
      photos: []
    };
  }

  function migrateFromV1(){
    try{
      const raw = localStorage.getItem("ironlog_data_v1");
      if(!raw) return null;
      const old = JSON.parse(raw);
      // v1 already matches v2 shape closely; exercises may lack 'equipment'
      Object.values(old.logs || {}).forEach(log=>{
        (log.exercises || []).forEach(ex=>{ if(ex.equipment === undefined) ex.equipment = ""; });
      });
      return old;
    }catch(e){ return null; }
  }

  function load(){
    try{
      const raw = localStorage.getItem(STORE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){ console.warn("IronStore: could not parse data", e); }
    const migrated = migrateFromV1();
    if(migrated) return migrated;
    return defaultDB();
  }

  let db = load();

  function save(){
    try{
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      return true;
    }catch(e){
      console.warn("IronStore: save failed", e);
      return false;
    }
  }

  function todayStr(d = new Date()){
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,'0') + "-" + String(d.getDate()).padStart(2,'0');
  }

  function getLog(dateStr){
    if(!db.logs[dateStr]){
      db.logs[dateStr] = { routineId: null, notes: "", exercises: [] };
    }
    return db.logs[dateStr];
  }

  function replaceDB(newDB){
    if(!newDB || !newDB.routines || !newDB.logs) throw new Error("Invalid backup format");
    if(!Array.isArray(newDB.photos)) newDB.photos = [];
    db = newDB;
    save();
  }

  function eraseAll(){
    localStorage.removeItem(STORE_KEY);
    db = defaultDB();
    save();
  }

  return {
    get db(){ return db; },
    uid, todayStr, getLog, save, replaceDB, eraseAll
  };
})();
