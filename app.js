
(() => {
  const paths = {
    home: "./assets/screens/home.webp",
    goal: "./assets/screens/goal.webp",
    learn: "./assets/screens/learn.webp",
    change: "./assets/screens/change.webp",
    impact: "./assets/screens/impact.webp",
    message: "./assets/screens/message.webp"
  };

  const titles = {
    home: "الواجهة الرئيسية",
    goal: "هدفي",
    learn: "سأتعلم",
    change: "سأغيّر",
    impact: "سأترك أثرًا",
    message: "رسالتي لنفسي"
  };

  const defaultState = {
    name: "",
    goal: { text:"", why:"", step1:"", step2:"", step3:"" },
    learn: { skill:"", reading:true, training:true, teacher:true, week1:"", week2:"", week3:"" },
    change: { habit:"", better:"", before:"", after:"", promise:"" },
    impact: { text:"", school:false, home:false, community:false, initiative:"" },
    message: { letter:"", selfTalk:"", encouragement:"" },
    completed: { goal:false, learn:false, change:false, impact:false, message:false }
  };

  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("newYearKeyState") || "null");
      if (!saved) return structuredClone(defaultState);
      return {
        ...structuredClone(defaultState),
        ...saved,
        goal:{...defaultState.goal,...(saved.goal||{})},
        learn:{...defaultState.learn,...(saved.learn||{})},
        change:{...defaultState.change,...(saved.change||{})},
        impact:{...defaultState.impact,...(saved.impact||{})},
        message:{...defaultState.message,...(saved.message||{})},
        completed:{...defaultState.completed,...(saved.completed||{})}
      };
    } catch { return structuredClone(defaultState); }
  };

  let state = load();
  let page = "home";
  let deferredInstallPrompt = null;

  const artScreen = document.getElementById("artScreen");
  const freeScreen = document.getElementById("freeScreen");
  const stage = document.getElementById("stage");
  const image = document.getElementById("screenImage");
  const root = document.getElementById("overlayRoot");
  const welcome = document.getElementById("welcome");
  const studentName = document.getElementById("studentName");
  const startJourney = document.getElementById("startJourney");
  const toast = document.getElementById("toast");
  const fx = document.getElementById("fxLayer");

  const save = () => localStorage.setItem("newYearKeyState", JSON.stringify(state));

  function toastMsg(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  let audioCtx;
  function chime(kind="tap") {
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const freqs = kind === "complete" ? [523.25, 659.25, 783.99] : [620];
      freqs.forEach((f,i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, now + i*0.07);
        g.gain.exponentialRampToValueAtTime(kind==="complete" ? 0.11 : 0.05, now+i*0.07+0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now+i*0.07+0.23);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(now+i*0.07); o.stop(now+i*0.07+0.25);
      });
    } catch {}
  }

  function sparkBurst(x=50,y=55) {
    for (let i=0;i<12;i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = `calc(${x}% + ${(Math.random()-0.5)*110}px)`;
      s.style.top = `calc(${y}% + ${(Math.random()-0.5)*100}px)`;
      s.style.animationDelay = `${Math.random()*0.2}s`;
      fx.appendChild(s);
      setTimeout(()=>s.remove(), 1100);
    }
  }

  function journeyLight() {
    const r = document.createElement("div");
    r.className = "road-glow";
    fx.appendChild(r);
    sparkBurst(50,58);
    setTimeout(()=>r.remove(), 1900);
  }

  function makeButton(cls, label, style, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.setAttribute("aria-label", label);
    Object.assign(b.style, style);
    b.addEventListener("click", () => { chime(); onClick(); });
    root.appendChild(b);
    return b;
  }

  function makeField(label, key, style, value, rows=2, onInput) {
    const ta = document.createElement("textarea");
    ta.className = "field" + (rows===1 ? " single" : "");
    ta.rows = rows;
    ta.setAttribute("aria-label", label);
    ta.placeholder = label;
    ta.value = value || "";
    Object.assign(ta.style, style);
    ta.addEventListener("input", e => { onInput(e.target.value); save(); });
    root.appendChild(ta);
    return ta;
  }

  function makeCheck(label, style, checked, onChange) {
    const wrap = document.createElement("label");
    wrap.className = "check-layer";
    Object.assign(wrap.style, style);
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    const span = document.createElement("span");
    span.textContent = label;
    input.addEventListener("change", () => { onChange(input.checked); save(); chime(); });
    wrap.append(input, span);
    root.appendChild(wrap);
  }

  function showArt(next) {
    page = next;
    freeScreen.classList.add("is-hidden");
    artScreen.classList.remove("is-hidden");
    image.src = paths[next];
    image.alt = `صفحة ${titles[next]} من تطبيق مفتاح العام الجديد`;
    renderOverlay();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function complete(section, next) {
    state.completed[section] = true;
    save();
    chime("complete");
    sparkBurst(50,58);
    toastMsg("تم حفظ المحطة وإضاءتها ✨");
    setTimeout(() => {
      if (next === "summary") showSummary();
      else showArt(next);
    }, 420);
  }

  function renderHome() {
    const cards = [
      ["goal","هدفي","3.5%","66.3%","18.2%","19.5%"],
      ["learn","سأتعلم","22.1%","66.3%","18.5%","19.5%"],
      ["change","سأغيّر","41.0%","66.3%","18.3%","19.5%"],
      ["impact","سأترك أثرًا","60.2%","66.3%","18.5%","19.5%"],
      ["message","رسالتي لنفسي","79.4%","66.3%","18.0%","19.5%"]
    ];
    cards.forEach(([target,label,left,top,width,height]) => {
      const b = makeButton("hotspot", label, {left,top,width,height}, () => showArt(target));
      if (state.completed[target]) b.classList.add("done");
    });
    // Also make the five key segments tappable.
    [
      ["goal","31.6%","31.8%","36%","8.5%"],
      ["learn","31.6%","40.1%","36%","7.9%"],
      ["change","31.6%","47.5%","36%","8.0%"],
      ["impact","31.6%","55.1%","36%","7.8%"],
      ["message","31.6%","62.0%","36%","5.8%"]
    ].forEach(([target,left,top,width,height]) =>
      makeButton("hotspot", `فتح ${titles[target]}`, {left,top,width,height}, () => showArt(target))
    );
    // Profile/footer hotspot lets the user change the name.
    makeButton("hotspot","تغيير اسم الطالبة",{left:"78%",top:"91%",width:"20%",height:"7%"},()=>{
      studentName.value = state.name;
      welcome.classList.remove("is-hidden");
    });
  }

  function renderGoal() {
    makeField("هدفي هذا العام","goal.text",{left:"14%",top:"50.5%",width:"72%",height:"5.4%"},state.goal.text,2,v=>state.goal.text=v);
    makeField("لماذا هذا الهدف مهم؟","goal.why",{left:"14%",top:"60.8%",width:"72%",height:"5.0%"},state.goal.why,2,v=>state.goal.why=v);
    makeField("الخطوة الأولى","goal.step1",{left:"21%",top:"71.4%",width:"62%",height:"2.6%"},state.goal.step1,1,v=>state.goal.step1=v);
    makeField("الخطوة الثانية","goal.step2",{left:"21%",top:"74.3%",width:"62%",height:"2.6%"},state.goal.step2,1,v=>state.goal.step2=v);
    makeField("الخطوة الثالثة","goal.step3",{left:"21%",top:"77.2%",width:"62%",height:"2.6%"},state.goal.step3,1,v=>state.goal.step3=v);
    makeButton("nav-hit","السابق",{left:"16%",top:"83.7%",width:"28%",height:"5.5%"},()=>showArt("home"));
    makeButton("nav-hit","حفظ ومتابعة",{left:"49%",top:"83.6%",width:"37%",height:"5.7%"},()=>complete("goal","learn"));
    // Top station tabs.
    [["goal","11%"],["learn","29%"],["change","47%"],["impact","64%"],["message","81%"]].forEach(([p,l])=>
      makeButton("hotspot",`الانتقال إلى ${titles[p]}`,{left:l,top:"34.5%",width:"13%",height:"9%"},()=>showArt(p))
    );
  }

  function renderLearn() {
    makeField("المهارة التي سأتعلمها","learn.skill",{left:"29%",top:"45.9%",width:"57%",height:"7.4%"},state.learn.skill,3,v=>state.learn.skill=v);
    // Transparent checkboxes placed next to the rows, preserving the visual design.
    makeCheck("قراءة",{left:"66%",top:"58.0%",width:"18%",height:"2.6%"},state.learn.reading,v=>state.learn.reading=v);
    makeCheck("تدريب",{left:"66%",top:"61.1%",width:"18%",height:"2.6%"},state.learn.training,v=>state.learn.training=v);
    makeCheck("سؤال المعلمة",{left:"61%",top:"64.3%",width:"23%",height:"2.6%"},state.learn.teacher,v=>state.learn.teacher=v);
    makeField("خطة الأسبوع الأول","learn.week1",{left:"68%",top:"72.4%",width:"18%",height:"5.5%"},state.learn.week1,2,v=>state.learn.week1=v);
    makeField("خطة الأسبوع الثاني","learn.week2",{left:"48%",top:"72.4%",width:"18%",height:"5.5%"},state.learn.week2,2,v=>state.learn.week2=v);
    makeField("خطة الأسبوع الثالث","learn.week3",{left:"27%",top:"72.4%",width:"18%",height:"5.5%"},state.learn.week3,2,v=>state.learn.week3=v);
    makeButton("nav-hit","السابق",{left:"61%",top:"80.1%",width:"25%",height:"5.1%"},()=>showArt("goal"));
    makeButton("nav-hit","حفظ ومتابعة",{left:"27%",top:"80.0%",width:"33%",height:"5.2%"},()=>complete("learn","change"));
  }

  function renderChange() {
    makeField("العادة التي أريد تغييرها","change.habit",{left:"34%",top:"47.9%",width:"51%",height:"5.0%"},state.change.habit,2,v=>state.change.habit=v);
    makeField("السلوك الأفضل الذي أطمح إليه","change.better",{left:"34%",top:"56.7%",width:"51%",height:"5.0%"},state.change.better,2,v=>state.change.better=v);
    makeField("قبل","change.before",{left:"62%",top:"66.4%",width:"25%",height:"6.0%"},state.change.before,2,v=>state.change.before=v);
    makeField("بعد","change.after",{left:"28%",top:"66.4%",width:"25%",height:"6.0%"},state.change.after,2,v=>state.change.after=v);
    makeField("عهدي لنفسي","change.promise",{left:"31%",top:"77.0%",width:"54%",height:"4.6%"},state.change.promise,2,v=>state.change.promise=v);
    makeButton("nav-hit","السابق",{left:"22%",top:"85.4%",width:"29%",height:"5.0%"},()=>showArt("learn"));
    makeButton("nav-hit","حفظ ومتابعة",{left:"51%",top:"85.4%",width:"34%",height:"5.0%"},()=>complete("change","impact"));
    // key navigation
    [["goal","3.5%","43.0%"],["learn","3.5%","50.5%"],["change","3.5%","58.0%"],["impact","3.5%","65.5%"],["message","3.5%","73.0%"]].forEach(([p,l,t])=>
      makeButton("hotspot",`الانتقال إلى ${titles[p]}`,{left:l,top:t,width:"18%",height:"7%"},()=>showArt(p))
    );
  }

  function renderImpact() {
    makeField("الأثر الذي أريد أن أتركه","impact.text",{left:"14%",top:"45.4%",width:"72%",height:"8.0%"},state.impact.text,3,v=>state.impact.text=v);
    makeCheck("في المدرسة",{left:"65%",top:"59.3%",width:"23%",height:"4.0%"},state.impact.school,v=>state.impact.school=v);
    makeCheck("في المنزل",{left:"39%",top:"59.3%",width:"20%",height:"4.0%"},state.impact.home,v=>state.impact.home=v);
    makeCheck("في المجتمع",{left:"12%",top:"59.3%",width:"23%",height:"4.0%"},state.impact.community,v=>state.impact.community=v);
    makeField("مبادرتي الصغيرة","impact.initiative",{left:"14%",top:"68.1%",width:"72%",height:"7.5%"},state.impact.initiative,3,v=>state.impact.initiative=v);
    makeButton("nav-hit","حفظ ومتابعة",{left:"13%",top:"82.9%",width:"37%",height:"5.3%"},()=>complete("impact","message"));
    makeButton("nav-hit","السابق",{left:"54%",top:"82.9%",width:"33%",height:"5.3%"},()=>showArt("change"));
  }

  function renderMessage() {
    makeField("رسالتي إلى نفسي","message.letter",{left:"10%",top:"46.1%",width:"78%",height:"17.8%"},state.message.letter,6,v=>state.message.letter=v);
    makeField("ماذا أقول لنفسي؟","message.selfTalk",{left:"9%",top:"67.7%",width:"39%",height:"9.2%"},state.message.selfTalk,3,v=>state.message.selfTalk=v);
    makeField("كيف سأشجّع نفسي؟","message.encouragement",{left:"52%",top:"67.7%",width:"39%",height:"9.2%"},state.message.encouragement,3,v=>state.message.encouragement=v);
    makeButton("nav-hit","السابق",{left:"9%",top:"84.0%",width:"29%",height:"5.2%"},()=>showArt("impact"));
    makeButton("nav-hit","حفظ وإنهاء الرحلة",{left:"40%",top:"84.0%",width:"50%",height:"5.2%"},()=>complete("message","summary"));
  }

  function renderOverlay() {
    root.innerHTML = "";
    fx.innerHTML = "";
    if (page === "home") renderHome();
    else if (page === "goal") renderGoal();
    else if (page === "learn") renderLearn();
    else if (page === "change") renderChange();
    else if (page === "impact") renderImpact();
    else if (page === "message") renderMessage();
  }

  function v(text, fallback="—") {
    const s = (text || "").trim();
    return s || fallback;
  }

  function completionCount() {
    return Object.values(state.completed).filter(Boolean).length;
  }

  function showSummary() {
    save();
    artScreen.classList.add("is-hidden");
    freeScreen.classList.remove("is-hidden");
    const done = completionCount();
    const ways = [
      state.learn.reading && "قراءة",
      state.learn.training && "تدريب",
      state.learn.teacher && "سؤال المعلمة"
    ].filter(Boolean).join("، ") || "—";
    const impactAreas = [
      state.impact.school && "المدرسة",
      state.impact.home && "المنزل",
      state.impact.community && "المجتمع"
    ].filter(Boolean).join("، ") || "—";

    freeScreen.innerHTML = `
      <div class="sheet">
        <div class="sheet-head">
          <div style="font-size:56px">🔑</div>
          <h1>ملخص رحلتي في مفتاح العام الجديد</h1>
          <span class="student-pill">${escapeHtml(state.name || "الطالبة")}</span>
        </div>
        <div class="progress-grid">
          ${[
            ["goal","هدفي"],["learn","سأتعلم"],["change","سأغيّر"],["impact","سأترك أثرًا"],["message","رسالتي"]
          ].map(([k,l])=>`<div class="progress-chip ${state.completed[k]?"done":""}">${state.completed[k]?"✓ ":""}${l}</div>`).join("")}
        </div>

        <div class="summary-grid">
          <article class="summary-card">
            <h3>🎯 هدفي</h3>
            <p><b>الهدف:</b> ${escapeHtml(v(state.goal.text))}</p>
            <p><b>أهميته:</b> ${escapeHtml(v(state.goal.why))}</p>
            <p><b>خطواتي:</b> ${escapeHtml([state.goal.step1,state.goal.step2,state.goal.step3].filter(Boolean).join(" ← ") || "—")}</p>
          </article>
          <article class="summary-card">
            <h3>💡 سأتعلم</h3>
            <p><b>المهارة:</b> ${escapeHtml(v(state.learn.skill))}</p>
            <p><b>طرق التعلم:</b> ${escapeHtml(ways)}</p>
            <p><b>الخطة:</b> ${escapeHtml([state.learn.week1,state.learn.week2,state.learn.week3].filter(Boolean).join(" | ") || "—")}</p>
          </article>
          <article class="summary-card">
            <h3>🔄 سأغيّر</h3>
            <p><b>العادة:</b> ${escapeHtml(v(state.change.habit))}</p>
            <p><b>السلوك الأفضل:</b> ${escapeHtml(v(state.change.better))}</p>
            <p><b>عهدي:</b> ${escapeHtml(v(state.change.promise))}</p>
          </article>
          <article class="summary-card">
            <h3>⭐ سأترك أثرًا</h3>
            <p><b>أثري:</b> ${escapeHtml(v(state.impact.text))}</p>
            <p><b>أساهم في:</b> ${escapeHtml(impactAreas)}</p>
            <p><b>مبادرتي:</b> ${escapeHtml(v(state.impact.initiative))}</p>
          </article>
          <article class="summary-card" style="grid-column:1/-1">
            <h3>💬 رسالتي لنفسي</h3>
            <p>${escapeHtml(v(state.message.letter))}</p>
            <p><b>ما أقوله لنفسي:</b> ${escapeHtml(v(state.message.selfTalk))}</p>
            <p><b>كيف أشجع نفسي:</b> ${escapeHtml(v(state.message.encouragement))}</p>
          </article>
        </div>

        <div class="actions">
          <button type="button" class="secondary" id="backHome">العودة للمفتاح</button>
          <button type="button" class="gold" id="certificateBtn" ${done<5?"disabled title='أكملي المحطات الخمس أولًا'":""}>شهادة الإنجاز 🏆</button>
          <button type="button" class="primary" id="printSummary">طباعة الملخص</button>
          <button type="button" class="secondary" id="installBtn">تثبيت التطبيق</button>
        </div>
      </div>
    `;
    document.getElementById("backHome").addEventListener("click",()=>showArt("home"));
    document.getElementById("certificateBtn").addEventListener("click",()=> { if(done===5) showCertificate(); });
    document.getElementById("printSummary").addEventListener("click",()=>window.print());
    document.getElementById("installBtn").addEventListener("click", installApp);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function showCertificate() {
    const date = new Date().toLocaleDateString("ar-SA-u-ca-islamic", {year:"numeric",month:"long",day:"numeric"});
    freeScreen.innerHTML = `
      <div class="sheet">
        <div class="certificate">
          <div class="key">🔑✨</div>
          <h1>شهادة إنجاز</h1>
          <p>تُمنح هذه الشهادة للطالبة</p>
          <div class="name">${escapeHtml(state.name || "الطالبة")}</div>
          <p>لإكمالها محطات <b>«مفتاح العام الجديد»</b> الخمس، وبناء بداية واعية لعام مليء بالهدف والتعلّم والتغيير والأثر.</p>
          <div class="seal">تم الإنجاز<br>٥ / ٥</div>
          <p>التاريخ: ${date}</p>
          <p style="margin-top:24px"><b>أ/ فاطمة هزازي</b><br>ملتقى التعليم التفاعلي</p>
        </div>
        <div class="actions">
          <button type="button" class="secondary" id="backSummary">العودة للملخص</button>
          <button type="button" class="primary" id="printCert">حفظ / طباعة الشهادة</button>
        </div>
      </div>
    `;
    document.getElementById("backSummary").addEventListener("click",showSummary);
    document.getElementById("printCert").addEventListener("click",()=>window.print());
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  async function installApp() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      alert("على iPhone/iPad: من زر المشاركة اختاري «إضافة إلى الشاشة الرئيسية». وعلى المتصفح المكتبي استخدمي خيار تثبيت التطبيق إن ظهر.");
    }
  }

  startJourney.addEventListener("click", () => {
    const n = studentName.value.trim();
    if (!n) {
      studentName.focus();
      toastMsg("اكتبي اسم الطالبة أولًا");
      return;
    }
    state.name = n;
    save();
    welcome.classList.add("is-hidden");
    journeyLight();
    chime("complete");
    setTimeout(()=>toastMsg(`أهلًا ${n} 🌟`), 300);
  });

  studentName.addEventListener("keydown", e => {
    if (e.key === "Enter") startJourney.click();
  });

  if (state.name) {
    studentName.value = state.name;
    welcome.classList.add("is-hidden");
  }

  renderOverlay();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
  }
})();
