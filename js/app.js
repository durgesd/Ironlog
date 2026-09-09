/* ==========================================================================
   IRONLOG — App logic
   Depends on: exercise-library.js, storage.js
   ========================================================================== */
(function(){
  "use strict";

  const $ = (sel, el=document) => el.querySelector(sel);
  const $all = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const { uid, todayStr, getLog, save } = IronStore;

  let currentDate = todayStr();
  let activeRoutineId = null;
  let pickerMuscle = null;
  let currentRange = 7;

  function escapeHtml(s){ const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }

  // ---------- Toast ----------
  let toastTimer;
  function showToast(msg){
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove("show"), 1800);
  }

  // ---------- Date helpers ----------
  function fmtDateDisplay(dstr){
    const d = new Date(dstr+"T00:00:00");
    return d.toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' });
  }
  function relativeLabel(dstr){
    if(dstr === todayStr()) return "TODAY";
    const y = new Date(); y.setDate(y.getDate()-1);
    if(dstr === todayStr(y)) return "YESTERDAY";
    const t = new Date(); t.setDate(t.getDate()+1);
    if(dstr === todayStr(t)) return "TOMORROW";
    return new Date(dstr+"T00:00:00").getFullYear() + "";
  }

  // ---------- Tabs ----------
  $all(".tabbar .tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $all(".tabbar .tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      $all("main section").forEach(s=>s.classList.remove("active"));
      $("#"+btn.dataset.tab).classList.add("active");
      if(btn.dataset.tab === "sec-progress") renderProgress();
      if(btn.dataset.tab === "sec-settings") renderRoutineEditor();
      if(btn.dataset.tab === "sec-photos") renderPhotos();
    });
  });

  // ---------- Date nav ----------
  function setDate(dstr){
    currentDate = dstr;
    $("#dateDisplay").innerHTML = fmtDateDisplay(dstr) + "<small>"+relativeLabel(dstr)+"</small>";
    const log = getLog(dstr);
    activeRoutineId = log.routineId;
    $("#sessionNotes").value = log.notes || "";
    renderRoutineBar();
    renderExercises();
  }
  $("#prevDay").addEventListener("click", ()=>{
    const d = new Date(currentDate+"T00:00:00"); d.setDate(d.getDate()-1);
    setDate(todayStr(d));
  });
  $("#nextDay").addEventListener("click", ()=>{
    const d = new Date(currentDate+"T00:00:00"); d.setDate(d.getDate()+1);
    setDate(todayStr(d));
  });
  $("#todayBtn").addEventListener("click", ()=> setDate(todayStr()));

  // ---------- Routine bar ----------
  function renderRoutineBar(){
    const bar = $("#routineBar");
    bar.innerHTML = "";
    IronStore.db.routines.forEach(r=>{
      const chip = document.createElement("button");
      chip.className = "routine-chip" + (activeRoutineId===r.id ? " active":"");
      chip.textContent = r.name;
      chip.addEventListener("click", ()=>{
        const log = getLog(currentDate);
        activeRoutineId = (activeRoutineId===r.id) ? null : r.id;
        log.routineId = activeRoutineId;
        save();
        renderRoutineBar();
      });
      bar.appendChild(chip);
    });
  }

  // ---------- Exercises ----------
  function renderExercises(){
    const log = getLog(currentDate);
    const list = $("#exerciseList");
    list.innerHTML = "";
    $("#exerciseCount").textContent = log.exercises.length + (log.exercises.length===1 ? " exercise":" exercises");
    $("#emptyWorkout").style.display = log.exercises.length ? "none":"block";

    log.exercises.forEach(ex=>{
      const color = getMuscleColor(ex.muscle);
      const card = document.createElement("div");
      card.className = "exercise-card";
      card.style.setProperty("--muscle-color", color);

      const head = document.createElement("div");
      head.className = "exercise-head";
      head.innerHTML = `
        <div>
          <div class="name">${escapeHtml(ex.name)}</div>
          ${ex.muscle ? `<div class="muscle-tag"><span class="dot"></span>${escapeHtml(ex.muscle)}${ex.equipment ? " • "+escapeHtml(ex.equipment):""}</div>`:""}
        </div>
        <button class="del" title="Remove exercise">✕</button>
      `;
      head.querySelector(".del").addEventListener("click", ()=>{
        log.exercises = log.exercises.filter(e=>e.id!==ex.id);
        save(); renderExercises();
      });
      card.appendChild(head);

      const table = document.createElement("div");
      table.className = "set-table";
      table.innerHTML = `<div class="set-row head-row"><div>SET</div><div>WEIGHT (kg)</div><div>REPS</div><div></div></div>`;

      ex.sets.forEach((set, idx)=>{
        const row = document.createElement("div");
        row.className = "set-row";
        row.innerHTML = `
          <div class="set-num">${idx+1}</div>
          <input type="number" inputmode="decimal" placeholder="0" value="${set.weight ?? ''}">
          <input type="number" inputmode="numeric" placeholder="0" value="${set.reps ?? ''}">
          <button class="chk ${set.done?'done':''}">${set.done?'✓':''}</button>
        `;
        const [wIn, rIn] = row.querySelectorAll("input");
        wIn.addEventListener("input", ()=>{ set.weight = wIn.value; save(); });
        rIn.addEventListener("input", ()=>{ set.reps = rIn.value; save(); });
        row.querySelector(".chk").addEventListener("click", (e)=>{
          set.done = !set.done;
          e.target.classList.toggle("done", set.done);
          e.target.textContent = set.done ? "✓":"";
          save();
        });
        table.appendChild(row);
      });
      card.appendChild(table);

      const addSetBtn = document.createElement("button");
      addSetBtn.className = "add-set-btn";
      addSetBtn.textContent = "+ ADD SET";
      addSetBtn.addEventListener("click", ()=>{
        ex.sets.push({weight:"", reps:"", done:false});
        save(); renderExercises();
      });
      card.appendChild(addSetBtn);

      list.appendChild(card);
    });
  }

  $("#sessionNotes").addEventListener("input", (e)=>{
    getLog(currentDate).notes = e.target.value;
    save();
  });

  // ---------- Exercise picker (2-step: muscle -> exercise) ----------
  const pickerModal = $("#pickerModal");
  const step1 = $("#pickerStep1");
  const step2 = $("#pickerStep2");

  $("#addExerciseBtn").addEventListener("click", ()=>{
    openPicker();
  });

  function openPicker(){
    renderMuscleGrid();
    step1.style.display = "block";
    step2.style.display = "none";
    pickerModal.classList.add("show");
  }
  $("#cancelPicker1").addEventListener("click", ()=> pickerModal.classList.remove("show"));
  pickerModal.addEventListener("click", (e)=>{ if(e.target===pickerModal) pickerModal.classList.remove("show"); });

  function renderMuscleGrid(){
    const grid = $("#muscleGrid");
    grid.innerHTML = "";
    MUSCLE_GROUPS.forEach(m=>{
      const tile = document.createElement("button");
      tile.className = "muscle-tile";
      tile.innerHTML = `<span class="dot" style="background:${m.color}"></span>${m.key}<span class="cnt">${EXERCISE_LIBRARY[m.key].length}</span>`;
      tile.addEventListener("click", ()=> openMuscleExercises(m.key));
      grid.appendChild(tile);
    });
  }

  function openMuscleExercises(muscleKey){
    pickerMuscle = muscleKey;
    $("#pickerMuscleTitle").textContent = muscleKey;
    $("#exerciseSearch").value = "";
    $("#customExerciseInput").value = "";
    renderExercisePickList("");
    step1.style.display = "none";
    step2.style.display = "block";
  }
  $("#backToMuscles").addEventListener("click", ()=>{
    step1.style.display = "block";
    step2.style.display = "none";
  });

  function renderExercisePickList(filter){
    const wrap = $("#exercisePickerList");
    wrap.innerHTML = "";
    const items = EXERCISE_LIBRARY[pickerMuscle].filter(ex =>
      ex.name.toLowerCase().includes(filter.toLowerCase())
    );
    if(!items.length){
      wrap.innerHTML = `<div class="no-results">No matches. Add it as a custom exercise below.</div>`;
      return;
    }
    items.forEach(ex=>{
      const row = document.createElement("div");
      row.className = "exercise-pick-item";
      row.innerHTML = `
        <div>
          <div class="epn">${escapeHtml(ex.name)}</div>
          <div class="epe">${escapeHtml(ex.equipment)}</div>
        </div>
        <div class="epa">+</div>
      `;
      row.addEventListener("click", ()=> addExerciseToLog(ex.name, pickerMuscle, ex.equipment));
      wrap.appendChild(row);
    });
  }
  $("#exerciseSearch").addEventListener("input", (e)=> renderExercisePickList(e.target.value));
  $("#addCustomExercise").addEventListener("click", ()=>{
    const name = $("#customExerciseInput").value.trim();
    if(!name){ showToast("Enter an exercise name"); return; }
    addExerciseToLog(name, pickerMuscle, "");
  });
  $("#customExerciseInput").addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){ $("#addCustomExercise").click(); }
  });

  function addExerciseToLog(name, muscle, equipment){
    const log = getLog(currentDate);
    const sets = [
      {weight:"", reps:"", done:false},
      {weight:"", reps:"", done:false},
      {weight:"", reps:"", done:false}
    ];
    log.exercises.push({ id: uid(), name, muscle, equipment, sets });
    save();
    pickerModal.classList.remove("show");
    renderExercises();
    showToast(name + " added");
  }

  // ---------- Routine day modal (settings) ----------
  const routineModal = $("#routineModal");
  $("#addRoutineBtn").addEventListener("click", ()=>{
    $("#routineNameInput").value = "";
    routineModal.classList.add("show");
    setTimeout(()=>$("#routineNameInput").focus(),100);
  });
  $("#cancelRoutine").addEventListener("click", ()=> routineModal.classList.remove("show"));
  routineModal.addEventListener("click", (e)=>{ if(e.target===routineModal) routineModal.classList.remove("show"); });
  $("#confirmRoutine").addEventListener("click", ()=>{
    const name = $("#routineNameInput").value.trim();
    if(!name){ showToast("Enter a routine name"); return; }
    IronStore.db.routines.push({id: uid(), name});
    save();
    routineModal.classList.remove("show");
    renderRoutineBar();
    renderRoutineEditor();
    showToast("Routine day added");
  });

  function renderRoutineEditor(){
    const wrap = $("#routineEditor");
    wrap.innerHTML = "";
    IronStore.db.routines.forEach(r=>{
      const row = document.createElement("div");
      row.className = "settings-row";
      row.innerHTML = `<div class="st-lbl">${escapeHtml(r.name)}</div>`;
      const del = document.createElement("button");
      del.className = "danger";
      del.textContent = "REMOVE";
      del.addEventListener("click", ()=>{
        IronStore.db.routines = IronStore.db.routines.filter(x=>x.id!==r.id);
        save(); renderRoutineEditor(); renderRoutineBar();
      });
      row.appendChild(del);
      wrap.appendChild(row);
    });
    const total = Object.values(EXERCISE_LIBRARY).reduce((a,l)=>a+l.length,0);
    $("#libraryCount").textContent = `${total} exercises across ${MUSCLE_GROUPS.length} muscle groups`;
  }

  // ---------- Photos ----------
  $("#photoInput").addEventListener("change", (e)=>{
    const files = Array.from(e.target.files || []);
    if(!files.length) return;
    let remaining = files.length;
    files.forEach(file=>{
      const reader = new FileReader();
      reader.onload = (ev)=>{
        compressImage(ev.target.result, (dataUrl)=>{
          IronStore.db.photos.unshift({ id: uid(), date: currentDate, dataUrl });
          save();
          remaining--;
          if(remaining===0){ renderPhotos(); showToast("Photo saved to this device"); }
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  });

  function compressImage(dataUrl, cb){
    const img = new Image();
    img.onload = ()=>{
      const maxDim = 1200;
      let {width, height} = img;
      if(width > maxDim || height > maxDim){
        const ratio = Math.min(maxDim/width, maxDim/height);
        width = Math.round(width*ratio); height = Math.round(height*ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      cb(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = ()=> cb(dataUrl);
    img.src = dataUrl;
  }

  function renderPhotos(){
    const grid = $("#photoGrid");
    grid.innerHTML = "";
    $("#photoCount").textContent = IronStore.db.photos.length;
    IronStore.db.photos.forEach(p=>{
      const item = document.createElement("div");
      item.className = "photo-item";
      item.innerHTML = `
        <img src="${p.dataUrl}" alt="Progress photo ${p.date}">
        <button class="pdel">✕</button>
        <div class="pdate">${p.date}</div>
      `;
      item.querySelector(".pdel").addEventListener("click", ()=>{
        IronStore.db.photos = IronStore.db.photos.filter(x=>x.id!==p.id);
        save(); renderPhotos();
      });
      grid.appendChild(item);
    });
  }

  // ---------- Progress ----------
  $all("#rangeToggle button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $all("#rangeToggle button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      currentRange = parseInt(btn.dataset.range);
      renderMuscleVolume();
    });
  });

  function withinRange(dateStr, days){
    if(days === 0) return true; // ALL
    const d = new Date(dateStr+"T00:00:00");
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
    return d >= cutoff;
  }

  function renderProgress(){
    const db = IronStore.db;
    const loggedDates = Object.keys(db.logs).filter(d => db.logs[d].exercises.length>0).sort();
    $("#statTotal").textContent = loggedDates.length;
    let totalSets = 0;
    loggedDates.forEach(d => db.logs[d].exercises.forEach(ex => totalSets += ex.sets.filter(s=>s.done).length));
    $("#statVolume").textContent = totalSets;

    // streak
    let streak = 0;
    let cursor = new Date();
    while(true){
      const ds = todayStr(cursor);
      if(db.logs[ds] && db.logs[ds].exercises.length>0){
        streak++;
        cursor.setDate(cursor.getDate()-1);
      } else if(ds === todayStr()){
        cursor.setDate(cursor.getDate()-1);
        continue;
      } else break;
    }
    $("#statStreak").textContent = streak;

    renderMuscleVolume();
    renderPersonalRecords();
    renderHistory();
  }

  function renderMuscleVolume(){
    const db = IronStore.db;
    const counts = {}; // muscle -> completed set count
    MUSCLE_GROUPS.forEach(m => counts[m.key] = 0);

    Object.entries(db.logs).forEach(([dateStr, log])=>{
      if(!withinRange(dateStr, currentRange)) return;
      log.exercises.forEach(ex=>{
        const muscle = ex.muscle && counts.hasOwnProperty(ex.muscle) ? ex.muscle : null;
        if(!muscle) return;
        counts[muscle] += ex.sets.filter(s=>s.done).length;
      });
    });

    const entries = MUSCLE_GROUPS.map(m => ({ key: m.key, color: m.color, val: counts[m.key] }))
      .sort((a,b)=> b.val - a.val);
    const max = Math.max(1, ...entries.map(e=>e.val));

    const wrap = $("#muscleVolumeList");
    wrap.innerHTML = "";
    const active = entries.filter(e=>e.val>0);
    if(!active.length){
      wrap.innerHTML = `<div class="empty-state" style="padding:24px 10px;"><p>No completed sets in this range yet. Check off sets as you finish them to see your muscle balance here.</p></div>`;
      $("#muscleVolumeHint").textContent = "";
      return;
    }
    active.forEach(e=>{
      const row = document.createElement("div");
      row.className = "mv-row";
      row.innerHTML = `
        <div class="mv-row-top">
          <div class="mv-name"><span class="dot" style="background:${e.color}"></span>${e.key}</div>
          <div class="mv-val">${e.val} sets</div>
        </div>
        <div class="mv-bar-track"><div class="mv-bar-fill" style="width:${(e.val/max*100).toFixed(0)}%; background:${e.color}"></div></div>
      `;
      wrap.appendChild(row);
    });
    const under = MUSCLE_GROUPS.filter(m => counts[m.key] === 0).map(m=>m.key);
    $("#muscleVolumeHint").textContent = under.length
      ? `Not trained in this range: ${under.join(", ")}.`
      : "Every muscle group has logged sets in this range — solid balance.";
  }

  function renderPersonalRecords(){
    const db = IronStore.db;
    const best = {}; // name -> {weight, reps, date, muscle}
    Object.entries(db.logs).sort(([a],[b])=> a<b?-1:1).forEach(([dateStr, log])=>{
      log.exercises.forEach(ex=>{
        ex.sets.forEach(s=>{
          if(!s.done) return;
          const w = parseFloat(s.weight);
          if(isNaN(w) || w<=0) return;
          if(!best[ex.name] || w > best[ex.name].weight){
            best[ex.name] = { weight: w, reps: s.reps || "-", date: dateStr, muscle: ex.muscle };
          }
        });
      });
    });
    const list = Object.entries(best)
      .sort((a,b)=> new Date(b[1].date) - new Date(a[1].date))
      .slice(0, 8);

    const wrap = $("#prList");
    wrap.innerHTML = "";
    if(!list.length){
      wrap.innerHTML = `<div class="empty-state" style="padding:24px 10px;"><p>Log weight on a completed set to start tracking personal records.</p></div>`;
      return;
    }
    list.forEach(([name, rec])=>{
      const color = getMuscleColor(rec.muscle);
      const item = document.createElement("div");
      item.className = "pr-item";
      item.style.setProperty("--muscle-color", color);
      item.innerHTML = `
        <div>
          <div class="pn">${escapeHtml(name)}</div>
          <div class="pm">${escapeHtml(rec.muscle || "")}</div>
        </div>
        <div>
          <div class="pv">${rec.weight}kg × ${escapeHtml(String(rec.reps))}</div>
          <div class="pd">${rec.date}</div>
        </div>
      `;
      wrap.appendChild(item);
    });
  }

  function renderHistory(){
    const db = IronStore.db;
    const histList = $("#historyList");
    histList.innerHTML = "";
    const sortedDates = Object.keys(db.logs).sort().reverse().slice(0,60);
    const withContent = sortedDates.filter(d => db.logs[d].exercises.length || db.logs[d].notes);
    if(!withContent.length){
      histList.innerHTML = `<div class="empty-state"><div class="big">📈</div><p>Your logged sessions will show up here once you start tracking.</p></div>`;
      return;
    }
    withContent.forEach(d=>{
      const log = db.logs[d];
      const routine = db.routines.find(r=>r.id===log.routineId);
      const doneSets = log.exercises.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
      const item = document.createElement("div");
      item.className = "history-item" + (log.exercises.length ? " has-log":"");
      item.innerHTML = `
        <div>
          <div class="hd">${fmtDateDisplay(d)}</div>
          <div class="hs">${routine? routine.name+" • ":""}${log.exercises.length} exercises • ${doneSets} sets completed</div>
        </div>
        <div class="harrow">›</div>
      `;
      item.addEventListener("click", ()=>{
        setDate(d);
        $all(".tabbar .tab").forEach(b=>b.classList.remove("active"));
        $('.tabbar .tab[data-tab="sec-workout"]').classList.add("active");
        $all("main section").forEach(s=>s.classList.remove("active"));
        $("#sec-workout").classList.add("active");
      });
      histList.appendChild(item);
    });
  }

  // ---------- Export / Import / Erase ----------
  $("#exportBtn").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(IronStore.db, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ironlog-backup-${todayStr()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  });
  $("#importBtn").addEventListener("click", ()=> $("#importInput").click());
  $("#importInput").addEventListener("change", (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const parsed = JSON.parse(ev.target.result);
        IronStore.replaceDB(parsed);
        setDate(currentDate);
        renderRoutineEditor();
        showToast("Backup imported");
      }catch(err){
        showToast("Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });
  $("#eraseBtn").addEventListener("click", ()=>{
    if(confirm("This will permanently delete all workouts, routines, and photos from this device. Continue?")){
      IronStore.eraseAll();
      setDate(todayStr());
      renderRoutineEditor();
      renderPhotos();
      showToast("All data erased");
    }
  });

  // ---------- Init ----------
  setDate(todayStr());
  renderRoutineEditor();
  renderPhotos();

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
})();
