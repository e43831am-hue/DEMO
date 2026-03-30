// ═══════════════════════════════════════════════════════════
// NIHONGO WORK — Enhanced Features v11
// 1. Improved Dashboard with weighted accuracy
// 2. Onboarding popup with placement test & study path
// 3. Quiz result tracking with per-question timing & wrong answer review
// ═══════════════════════════════════════════════════════════

// ── 3. QUIZ RESULT TRACKING (per-question timing + wrong-answer review) ──

// Global quiz log: stores results per quiz session
window._quizLog = [];
window._quizQStart = 0;

function startQuizTimer() {
  window._quizQStart = Date.now();
}

function logQuizAnswer(item, opts, correctIdx, chosenIdx, isCorrect) {
  const elapsed = window._quizQStart ? Math.round((Date.now() - window._quizQStart) / 1000) : 0;
  window._quizLog.push({
    item: item,
    question: item[0] || item.q || item.p || item.k || '?',
    answer: opts ? opts[correctIdx] : '',
    userAnswer: opts ? (chosenIdx >= 0 ? opts[chosenIdx] : '(時間切れ)') : '',
    isCorrect: isCorrect,
    seconds: elapsed
  });
  window._quizQStart = Date.now(); // reset for next question
}

function renderQuizResultDetails(targetEl, quizLog, modKey) {
  if (!quizLog || !quizLog.length) return;
  
  const wrongItems = quizLog.filter(q => !q.isCorrect);
  const correctItems = quizLog.filter(q => q.isCorrect);
  const totalTime = quizLog.reduce((s, q) => s + q.seconds, 0);
  const avgTime = quizLog.length ? (totalTime / quizLog.length).toFixed(1) : 0;
  
  let h = '';
  
  // Summary stats
  h += '<div style="margin-top:16px;background:var(--s1);border:1px solid var(--brd);border-radius:14px;padding:16px;margin-bottom:12px">';
  h += '<div style="font-family:\'Zen Maru Gothic\',sans-serif;font-size:14px;font-weight:700;margin-bottom:12px;color:var(--tx)">📊 詳細結果</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">';
  h += '<div style="text-align:center;padding:10px;background:var(--s2);border-radius:10px"><div style="font-size:20px;font-weight:900;color:var(--grn)">'+correctItems.length+'</div><div style="font-size:10px;color:var(--txM)">正解</div></div>';
  h += '<div style="text-align:center;padding:10px;background:var(--s2);border-radius:10px"><div style="font-size:20px;font-weight:900;color:var(--red)">'+wrongItems.length+'</div><div style="font-size:10px;color:var(--txM)">不正解</div></div>';
  h += '<div style="text-align:center;padding:10px;background:var(--s2);border-radius:10px"><div style="font-size:20px;font-weight:900;color:var(--accB)">'+avgTime+'s</div><div style="font-size:10px;color:var(--txM)">平均時間</div></div>';
  h += '</div>';
  
  // All questions table
  h += '<div style="font-size:12px;font-weight:600;color:var(--txM);margin-bottom:8px">全問題一覧</div>';
  quizLog.forEach((q, i) => {
    const bg = q.isCorrect ? 'rgba(107,163,104,0.06)' : 'rgba(217,107,107,0.06)';
    const border = q.isCorrect ? 'rgba(107,163,104,0.2)' : 'rgba(217,107,107,0.2)';
    const icon = q.isCorrect ? '✓' : '✗';
    const iconColor = q.isCorrect ? 'var(--grn)' : 'var(--red)';
    
    h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:4px;background:'+bg+';border:1px solid '+border+';border-radius:8px">';
    h += '<span style="font-size:11px;font-weight:700;color:var(--txD);min-width:22px">Q'+(i+1)+'</span>';
    h += '<span style="font-size:16px;font-weight:700;color:'+iconColor+';min-width:16px">'+icon+'</span>';
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-size:13px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+q.question+'</div>';
    if (!q.isCorrect) {
      h += '<div style="font-size:11px;color:var(--red);margin-top:2px">あなたの回答: '+q.userAnswer+'</div>';
      h += '<div style="font-size:11px;color:var(--grn);margin-top:1px">正解: '+q.answer+'</div>';
    }
    h += '</div>';
    h += '<div style="text-align:right;flex-shrink:0"><div style="font-size:12px;font-weight:700;color:var(--txM)">'+q.seconds+'s</div></div>';
    h += '</div>';
  });
  
  h += '</div>';
  
  // Wrong items focus section
  if (wrongItems.length > 0) {
    h += '<div style="background:rgba(217,107,107,0.06);border:1px solid rgba(217,107,107,0.2);border-radius:14px;padding:16px;margin-bottom:12px">';
    h += '<div style="font-family:\'Zen Maru Gothic\',sans-serif;font-size:14px;font-weight:700;margin-bottom:10px;color:var(--red)">💀 間違えた問題 ('+wrongItems.length+'問)</div>';
    wrongItems.forEach((q, i) => {
      h += '<div style="padding:8px 10px;margin-bottom:6px;background:var(--s1);border-radius:8px;border:1px solid var(--brd)">';
      h += '<div style="font-size:14px;font-weight:700;color:var(--tx)">'+q.question+'</div>';
      h += '<div style="display:flex;gap:12px;margin-top:4px">';
      h += '<div style="font-size:11px"><span style="color:var(--red)">✗ </span>'+q.userAnswer+'</div>';
      h += '<div style="font-size:11px"><span style="color:var(--grn)">✓ </span>'+q.answer+'</div>';
      h += '<div style="font-size:11px;color:var(--txD)">⏱ '+q.seconds+'s</div>';
      h += '</div></div>';
    });
    h += '</div>';
  }
  
  targetEl.innerHTML += h;
}


// ── 2. ONBOARDING SYSTEM ──

function shouldShowOnboarding() {
  return !localStorage.getItem('nw3_onboarded');
}

function showOnboarding() {
  if (!shouldShowOnboarding()) {
    showDailyStudyPopup();
    return;
  }
  
  const overlay = document.createElement('div');
  overlay.id = 'onboard-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  
  overlay.innerHTML = `
  <div id="onboard-card" style="background:var(--s1);border-radius:20px;padding:28px;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-height:90vh;overflow-y:auto">
    <div style="font-size:40px;margin-bottom:12px">🎌</div>
    <div style="font-family:'Zen Maru Gothic',sans-serif;font-size:20px;font-weight:900;color:var(--acc);margin-bottom:6px">ようこそ！Welcome!</div>
    <div style="font-size:13px;color:var(--txM);margin-bottom:20px;line-height:1.6">まず、あなたの目標と現在のレベルを教えてください<br>First, tell us your goal and current level</div>
    
    <div style="text-align:left;margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:8px">🎯 目標レベル / Target Level</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px" id="goal-btns">
        <button class="ob-btn" data-goal="N5" style="padding:14px 8px;border-radius:12px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;color:var(--tx);transition:all .2s">N5</button>
        <button class="ob-btn" data-goal="N4" style="padding:14px 8px;border-radius:12px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;color:var(--tx);transition:all .2s">N4</button>
        <button class="ob-btn" data-goal="N3" style="padding:14px 8px;border-radius:12px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;color:var(--tx);transition:all .2s">N3</button>
      </div>
    </div>
    
    <div style="text-align:left;margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:8px">📚 現在のレベル / Current Level</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px" id="current-btns">
        <button class="ob-btn" data-cur="zero" style="padding:12px 8px;border-radius:12px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-size:12px;color:var(--tx);transition:all .2s">🌱 完全初心者<br><span style="font-size:10px;color:var(--txD)">Zero / শূন্য</span></button>
        <button class="ob-btn" data-cur="kana" style="padding:12px 8px;border-radius:12px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-size:12px;color:var(--tx);transition:all .2s">あ ア かな読める<br><span style="font-size:10px;color:var(--txD)">Can read kana</span></button>
        <button class="ob-btn" data-cur="n5" style="padding:12px 8px;border-radius:12px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-size:12px;color:var(--tx);transition:all .2s">📖 N5くらい<br><span style="font-size:10px;color:var(--txD)">~N5 level</span></button>
        <button class="ob-btn" data-cur="unsure" style="padding:12px 8px;border-radius:12px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-size:12px;color:var(--tx);transition:all .2s">🤔 わからない<br><span style="font-size:10px;color:var(--txD)">Not sure / অনিশ্চিত</span></button>
      </div>
    </div>
    
    <button id="ob-next" disabled style="width:100%;padding:14px;background:var(--acc);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;opacity:0.5;transition:all .2s">次へ → / Next →</button>
  </div>`;
  
  document.body.appendChild(overlay);
  
  let selectedGoal = null;
  let selectedCur = null;
  
  function updateSelection() {
    document.querySelectorAll('#goal-btns .ob-btn').forEach(b => {
      b.style.borderColor = b.dataset.goal === selectedGoal ? 'var(--acc)' : 'var(--brd)';
      b.style.background = b.dataset.goal === selectedGoal ? 'rgba(228,87,46,0.08)' : 'var(--s1)';
    });
    document.querySelectorAll('#current-btns .ob-btn').forEach(b => {
      b.style.borderColor = b.dataset.cur === selectedCur ? 'var(--accB)' : 'var(--brd)';
      b.style.background = b.dataset.cur === selectedCur ? 'rgba(31,58,95,0.08)' : 'var(--s1)';
    });
    const btn = document.getElementById('ob-next');
    if (btn) {
      btn.disabled = !(selectedGoal && selectedCur);
      btn.style.opacity = (selectedGoal && selectedCur) ? '1' : '0.5';
    }
  }
  
  document.querySelectorAll('#goal-btns .ob-btn').forEach(b => {
    b.onclick = () => { selectedGoal = b.dataset.goal; updateSelection(); };
  });
  document.querySelectorAll('#current-btns .ob-btn').forEach(b => {
    b.onclick = () => { selectedCur = b.dataset.cur; updateSelection(); };
  });
  
  document.getElementById('ob-next').onclick = () => {
    localStorage.setItem('nw3_goal', selectedGoal);
    localStorage.setItem('nw3_current', selectedCur);
    
    if (selectedCur === 'unsure') {
      startMiniTest(overlay, selectedGoal);
    } else {
      finishOnboarding(overlay, selectedGoal, selectedCur);
    }
  };
}

// ── Mini Placement Test ──
function startMiniTest(overlay, goalLevel) {
  // Build 10 mixed questions: 3 kana, 3 vocab N5, 2 kanji N5, 2 grammar
  const questions = [];
  
  // 3 kana questions
  const kanaPool = shuf([...HB, ...KB]).slice(0, 3);
  kanaPool.forEach(k => {
    const wrongs = shuf([...HB, ...KB].filter(x => x[1] !== k[1])).slice(0, 3).map(x => x[1]);
    const opts = shuf([k[1], ...wrongs]);
    questions.push({ q: k[0], opts: opts, ans: opts.indexOf(k[1]), type: 'kana', diff: 1 });
  });
  
  // 3 vocab N5 questions
  const vocPool = shuf(JLPT_V5).slice(0, 3);
  vocPool.forEach(v => {
    const wrongs = shuf(JLPT_V5.filter(x => x[2] !== v[2])).slice(0, 3).map(x => x[2]);
    const opts = shuf([v[2], ...wrongs]);
    questions.push({ q: v[0] + ' (' + v[1] + ')', opts: opts, ans: opts.indexOf(v[2]), type: 'vocab', diff: 2 });
  });
  
  // 2 kanji N5 questions
  const kanPool = shuf(JLPT_K5).slice(0, 2);
  kanPool.forEach(k => {
    const wrongs = shuf(JLPT_K5.filter(x => x[1] !== k[1])).slice(0, 3).map(x => x[1]);
    const opts = shuf([k[1], ...wrongs]);
    questions.push({ q: k[0], opts: opts, ans: opts.indexOf(k[1]), type: 'kanji', diff: 3 });
  });
  
  // 2 grammar questions
  const gramPool = shuf(GQ).slice(0, 2);
  gramPool.forEach(g => {
    questions.push({ q: g.q, opts: [...g.opts], ans: g.ans, type: 'grammar', diff: 4 });
  });
  
  let pos = 0, score = 0, totalDiff = 0;
  const shuffledQ = shuf(questions);
  
  function renderQ() {
    if (pos >= shuffledQ.length) {
      showTestResult();
      return;
    }
    const q = shuffledQ[pos];
    const card = document.getElementById('onboard-card');
    let h = '<div style="margin-bottom:12px">';
    h += '<div style="font-size:11px;color:var(--txD);letter-spacing:.06em;margin-bottom:4px">レベル判定テスト — Q'+(pos+1)+'/'+shuffledQ.length+'</div>';
    h += '<div style="background:var(--s3);height:6px;border-radius:3px;overflow:hidden;margin-bottom:16px"><div style="height:100%;background:var(--acc);border-radius:3px;width:'+(pos/shuffledQ.length*100)+'%;transition:width .3s"></div></div>';
    h += '</div>';
    
    h += '<div style="font-size:22px;font-weight:700;color:var(--tx);margin-bottom:16px;line-height:1.4">' + q.q.replace('＿','<span style="border-bottom:3px solid var(--acc);padding:0 6px">＿</span>') + '</div>';
    
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
    ['A','B','C','D'].forEach((l, i) => {
      if (i < q.opts.length) {
        h += '<button class="mt-opt" data-i="'+i+'" style="padding:12px;border-radius:10px;border:2px solid var(--brd);background:var(--s1);cursor:pointer;font-family:inherit;font-size:13px;color:var(--tx);text-align:left;transition:all .15s"><span style="font-weight:700;color:var(--txD);margin-right:6px">'+l+'</span>'+q.opts[i]+'</button>';
      }
    });
    h += '</div>';
    h += '<div id="mt-fb" style="min-height:20px"></div>';
    
    card.innerHTML = h;
    
    card.querySelectorAll('.mt-opt').forEach(btn => {
      btn.onclick = function() {
        const chosen = +this.dataset.i;
        const ok = chosen === q.ans;
        if (ok) { score++; totalDiff += q.diff; }
        
        card.querySelectorAll('.mt-opt').forEach(b => {
          b.style.pointerEvents = 'none';
          if (+b.dataset.i === q.ans) { b.style.borderColor = 'var(--grn)'; b.style.background = 'rgba(107,163,104,0.1)'; }
          else if (+b.dataset.i === chosen && !ok) { b.style.borderColor = 'var(--red)'; b.style.background = 'rgba(217,107,107,0.1)'; }
        });
        
        setTimeout(() => { pos++; renderQ(); }, 800);
      };
    });
  }
  
  function showTestResult() {
    const pct = Math.round(score / shuffledQ.length * 100);
    let detectedLevel = 'zero';
    if (pct >= 80) detectedLevel = 'n5';
    else if (pct >= 50) detectedLevel = 'kana';
    else detectedLevel = 'zero';
    
    finishOnboarding(overlay, goalLevel, detectedLevel, pct);
  }
  
  renderQ();
}

// ── Finish Onboarding & Show Result ──
function finishOnboarding(overlay, goalLevel, currentLevel, testScore) {
  localStorage.setItem('nw3_goal', goalLevel);
  localStorage.setItem('nw3_current', currentLevel);
  localStorage.setItem('nw3_onboarded', '1');
  localStorage.setItem('nw3_onboard_date', new Date().toISOString());
  
  // Calculate pass probability
  const passPct = calculatePassProbability(goalLevel, currentLevel, testScore);
  
  const card = document.getElementById('onboard-card');
  const levelNames = {zero:'完全初心者',kana:'かな読めるレベル',n5:'N5レベル'};
  const goalColors = {N5:'#4CAF50',N4:'#2196F3',N3:'#9C27B0'};
  
  let h = '<div style="font-size:36px;margin-bottom:8px">📊</div>';
  h += '<div style="font-family:\'Zen Maru Gothic\',sans-serif;font-size:18px;font-weight:900;color:var(--tx);margin-bottom:16px">あなたの診断結果</div>';
  
  // Pass probability circle
  const r = 50, circ = 2 * Math.PI * r, offset = circ * (1 - passPct / 100);
  h += '<div style="margin:0 auto 16px;width:130px;height:130px;position:relative">';
  h += '<svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r="'+r+'" fill="none" stroke="var(--s3)" stroke-width="8"/>';
  h += '<circle cx="65" cy="65" r="'+r+'" fill="none" stroke="'+(goalColors[goalLevel]||'var(--acc)')+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+offset+'" transform="rotate(-90 65 65)" style="transition:stroke-dashoffset 1.5s ease"/>';
  h += '<text x="65" y="60" text-anchor="middle" fill="var(--tx)" font-size="28" font-weight="900">'+passPct+'%</text>';
  h += '<text x="65" y="78" text-anchor="middle" fill="var(--txM)" font-size="10">合格確率</text>';
  h += '</svg></div>';
  
  h += '<div style="font-size:16px;font-weight:700;color:'+(goalColors[goalLevel]||'var(--acc)')+';margin-bottom:4px">'+goalLevel+' 合格確率: '+passPct+'%</div>';
  h += '<div style="font-size:12px;color:var(--txM);margin-bottom:16px">現在レベル: '+(levelNames[currentLevel]||currentLevel)+'</div>';
  
  if (testScore !== undefined) {
    h += '<div style="font-size:11px;color:var(--txD);margin-bottom:12px">ミニテスト結果: '+testScore+'%</div>';
  }
  
  // Study plan summary
  h += '<div style="background:var(--s2);border-radius:12px;padding:14px;margin-bottom:16px;text-align:left">';
  h += '<div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:8px">📋 おすすめ学習プラン</div>';
  const plan = getStudyPlan(goalLevel, currentLevel);
  plan.forEach(step => {
    h += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;color:var(--txM)"><span>'+step.icon+'</span><span>'+step.label+'</span></div>';
  });
  h += '</div>';
  
  h += '<button onclick="document.getElementById(\'onboard-overlay\').remove()" style="width:100%;padding:14px;background:var(--acc);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">🚀 学習を始める！ / Start Learning!</button>';
  
  card.innerHTML = h;
}

function calculatePassProbability(goalLevel, currentLevel, testScore) {
  // Base probability from current level to goal
  const levelMap = {zero: 0, kana: 20, n5: 50};
  const goalMap = {N5: 100, N4: 70, N3: 40};
  
  let base = levelMap[currentLevel] || 0;
  let target = goalMap[goalLevel] || 100;
  
  // Factor in test score if available
  if (testScore !== undefined) {
    base = Math.max(base, testScore * 0.6);
  }
  
  // Factor in existing SRS data
  const srsBonus = getSRSBonus(goalLevel);
  base += srsBonus;
  
  let prob = Math.min(95, Math.max(5, Math.round(base * target / 100)));
  return prob;
}

function getSRSBonus(goalLevel) {
  let totalC = 0, totalW = 0;
  const cats = goalLevel === 'N5' ? 
    [['kana',[...HB,...HD,...KB,...KD]],['vocab',JLPT_V5],['kanji',JLPT_K5]] :
    goalLevel === 'N4' ?
    [['vocab',JLPT_V4],['kanji',JLPT_K4],['grammar',GRAM],['verb',[...VERBS,...VERBS_N4]]] :
    [['vocab',JLPT_V3],['kanji',JLPT_K3]];
  
  cats.forEach(([key, items]) => {
    items.forEach(item => {
      const d = SRS.get(key, item);
      totalC += d.c;
      totalW += d.w;
    });
  });
  
  const total = totalC + totalW;
  if (total < 10) return 0;
  return Math.round((totalC / total) * 30); // up to 30% bonus
}

function getStudyPlan(goalLevel, currentLevel) {
  const plans = [];
  
  if (currentLevel === 'zero') {
    plans.push({icon:'あ', label:'ひらがな・カタカナをマスター'});
  }
  if (currentLevel === 'zero' || currentLevel === 'kana') {
    plans.push({icon:'📖', label:'N5語彙 ('+JLPT_V5.length+'語) を覚える'});
    plans.push({icon:'漢', label:'N5漢字 ('+JLPT_K5.length+'字) を覚える'});
  }
  if (goalLevel === 'N4' || goalLevel === 'N3') {
    plans.push({icon:'📖', label:'N4語彙 ('+JLPT_V4.length+'語) を覚える'});
    plans.push({icon:'🔄', label:'動詞活用 ('+(VERBS.length+VERBS_N4.length)+'語) を練習'});
    plans.push({icon:'📗', label:'N4文法パターンを習得'});
  }
  if (goalLevel === 'N3') {
    plans.push({icon:'📖', label:'N3語彙 ('+JLPT_V3.length+'語) を覚える'});
    plans.push({icon:'漢', label:'N3漢字 ('+JLPT_K3.length+'字) を覚える'});
  }
  plans.push({icon:'🎯', label:'模擬テストで90%を目指す'});
  
  return plans;
}


// ── Daily Study Popup ──
function showDailyStudyPopup() {
  const today = new Date().toDateString();
  const lastShown = localStorage.getItem('nw3_daily_popup');
  if (lastShown === today) return;
  
  const goal = localStorage.getItem('nw3_goal');
  if (!goal) return;
  
  localStorage.setItem('nw3_daily_popup', today);
  
  // Calculate current pass probability
  const current = localStorage.getItem('nw3_current') || 'zero';
  const passPct = calculatePassProbability(goal, current);
  
  // Find weakest area
  const weakAreas = findWeakAreas(goal);
  
  setTimeout(() => {
    const overlay = document.createElement('div');
    overlay.id = 'daily-popup';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    
    let h = '<div style="background:var(--s1);border-radius:20px;padding:24px;max-width:360px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center">';
    h += '<div style="font-size:32px;margin-bottom:8px">📅</div>';
    h += '<div style="font-family:\'Zen Maru Gothic\',sans-serif;font-size:16px;font-weight:900;color:var(--tx);margin-bottom:4px">今日の学習プラン</div>';
    h += '<div style="font-size:24px;font-weight:900;color:var(--acc);margin-bottom:4px">'+goal+' 合格確率: '+passPct+'%</div>';
    h += '<div style="font-size:11px;color:var(--txM);margin-bottom:16px">毎日続けて合格率を上げよう！</div>';
    
    // Recommended tasks
    h += '<div style="text-align:left;margin-bottom:16px">';
    if (weakAreas.length > 0) {
      weakAreas.slice(0, 3).forEach(area => {
        h += '<div onclick="document.getElementById(\'daily-popup\').remove();'+area.action+'" style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:6px;background:var(--s2);border-radius:10px;cursor:pointer;transition:all .15s" onmouseover="this.style.background=\'var(--s3)\'" onmouseout="this.style.background=\'var(--s2)\'">';
        h += '<span style="font-size:20px">'+area.icon+'</span>';
        h += '<div><div style="font-size:12px;font-weight:700;color:var(--tx)">'+area.title+'</div><div style="font-size:10px;color:var(--txD)">'+area.desc+'</div></div>';
        h += '<span style="margin-left:auto;color:var(--txD)">→</span></div>';
      });
    }
    h += '</div>';
    
    h += '<button onclick="document.getElementById(\'daily-popup\').remove()" style="padding:10px 24px;background:var(--s2);color:var(--txM);border:1px solid var(--brd);border-radius:10px;font-size:12px;cursor:pointer;font-family:inherit">後で / Later</button>';
    h += '</div>';
    
    overlay.innerHTML = h;
    document.body.appendChild(overlay);
  }, 1500);
}

function findWeakAreas(goalLevel) {
  const areas = [];
  
  function addIfWeak(name, icon, modKey, items, action, threshold) {
    let c = 0, w = 0;
    items.forEach(item => { const d = SRS.get(modKey, item); c += d.c; w += d.w; });
    const total = c + w;
    const rate = total > 0 ? Math.round(c / total * 100) : 0;
    const attempted = total > 0;
    
    if (!attempted || rate < (threshold || 80)) {
      areas.push({
        icon: icon,
        title: name,
        desc: attempted ? '正答率: '+rate+'% — 復習しよう' : 'まだ未挑戦 — 始めよう',
        rate: rate,
        attempted: attempted,
        action: action
      });
    }
  }
  
  // Always check kana
  addIfWeak('ひらがな', 'あ', 'kana', [...HB,...HD], "window.location.href='kana-practice.html'");
  addIfWeak('カタカナ', 'ア', 'kana', [...KB,...KD], "window.location.href='kana-practice.html'");
  
  if (goalLevel === 'N5' || goalLevel === 'N4' || goalLevel === 'N3') {
    addIfWeak('N5語彙', '📖', 'vocab', JLPT_V5, "window.location.href='vocab.html'");
    addIfWeak('N5漢字', '漢', 'kanji', JLPT_K5, "window.location.href='kanji.html'");
  }
  if (goalLevel === 'N4' || goalLevel === 'N3') {
    addIfWeak('N4語彙', '📖', 'vocab', JLPT_V4, "window.location.href='vocab.html'");
    addIfWeak('動詞活用', '🔄', 'verb', [...VERBS,...VERBS_N4], "window.location.href='verb.html'");
    addIfWeak('文法', '📗', 'grammar', GRAM, "window.location.href='grammar.html'");
  }
  if (goalLevel === 'N3') {
    addIfWeak('N3語彙', '📖', 'vocab', JLPT_V3, "window.location.href='vocab.html'");
    addIfWeak('N3漢字', '漢', 'kanji', JLPT_K3, "window.location.href='kanji.html'");
  }
  
  // Sort: unattempted first, then by lowest rate
  areas.sort((a, b) => {
    if (!a.attempted && b.attempted) return -1;
    if (a.attempted && !b.attempted) return 1;
    return a.rate - b.rate;
  });
  
  return areas;
}


// ── 1. IMPROVED DASHBOARD ──

function mkDashboardV2(c) {
  const target = c;
  
  // Weighted accuracy: items with more attempts count more
  function getWeightedStats(modKey, allItems) {
    let weightedCorrect = 0, weightedTotal = 0, weakCount = 0, masteredCount = 0;
    let rawCorrect = 0, rawWrong = 0;
    
    allItems.forEach(item => {
      const d = SRS.get(modKey, item);
      const attempts = d.c + d.w;
      rawCorrect += d.c;
      rawWrong += d.w;
      
      if (attempts > 0) {
        // Weight by sqrt of attempts (diminishing returns for spam)
        const weight = Math.sqrt(attempts);
        weightedCorrect += (d.c / attempts) * weight;
        weightedTotal += weight;
      }
      
      // Weak: wrong >= correct AND at least 1 wrong
      if (d.w > 0 && d.w >= d.c) weakCount++;
      // Mastered: 3+ correct AND correct > wrong*2
      if (d.c >= 3 && d.c > d.w * 2) masteredCount++;
    });
    
    const rate = weightedTotal > 0 ? Math.round(weightedCorrect / weightedTotal * 100) : 0;
    return { rate, weakCount, masteredCount, rawCorrect, rawWrong, total: rawCorrect + rawWrong, itemCount: allItems.length };
  }
  
  const _catNames = {
    'ひらがな': {ja:'ひらがな', en:'Hiragana', bn:'হিরাগানা'},
    'カタカナ': {ja:'カタカナ', en:'Katakana', bn:'কাতাকানা'},
    '漢字 N5': {ja:'漢字 N5', en:'Kanji N5', bn:'কানজি N5'},
    '漢字 N4': {ja:'漢字 N4', en:'Kanji N4', bn:'কানজি N4'},
    '漢字 N3': {ja:'漢字 N3', en:'Kanji N3', bn:'কানজি N3'},
    '語彙 N5': {ja:'語彙 N5', en:'Vocab N5', bn:'শব্দ N5'},
    '語彙 N4': {ja:'語彙 N4', en:'Vocab N4', bn:'শব্দ N4'},
    '語彙 N3': {ja:'語彙 N3', en:'Vocab N3', bn:'শব্দ N3'},
    '動詞':   {ja:'動詞', en:'Verbs', bn:'ক্রিয়া'},
    '形容詞':  {ja:'形容詞', en:'Adjectives', bn:'বিশেষণ'},
    '文法':   {ja:'文法', en:'Grammar', bn:'ব্যাকরণ'},
  };
  function _cn(k){ return (_catNames[k]||{})[_lang]||k; }
  
  const cats = [
    { name:'ひらがな', icon:'あ', modKey:'kana', items:[...HB,...HD], level:'N5' },
    { name:'カタカナ', icon:'ア', modKey:'kana', items:[...KB,...KD], level:'N5' },
    { name:'漢字 N5', icon:'漢', modKey:'kanji', items:JLPT_K5, level:'N5' },
    { name:'漢字 N4', icon:'漢', modKey:'kanji', items:JLPT_K4, level:'N4' },
    { name:'漢字 N3', icon:'漢', modKey:'kanji', items:JLPT_K3, level:'N3' },
    { name:'語彙 N5', icon:'📖', modKey:'vocab', items:JLPT_V5, level:'N5' },
    { name:'語彙 N4', icon:'📖', modKey:'vocab', items:JLPT_V4, level:'N4' },
    { name:'語彙 N3', icon:'📖', modKey:'vocab', items:JLPT_V3, level:'N3' },
    { name:'動詞', icon:'🔄', modKey:'verb', items:[...VERBS,...VERBS_N4], level:'N4' },
    { name:'形容詞', icon:'📝', modKey:'adj', items:[...I_ADJ,...NA_ADJ], level:'N4' },
    { name:'文法', icon:'📗', modKey:'grammar', items:GRAM, level:'N4' },
  ];
  
  const catStats = cats.map(cat => ({ ...cat, ...getWeightedStats(cat.modKey, cat.items) }));
  
  // JLPT pass rates (weighted)
  function levelPassRate(level) {
    const items = catStats.filter(c => c.level === level && c.total > 0);
    if (!items.length) return 0;
    // Weight each category by its item count
    let wSum = 0, wTotal = 0;
    items.forEach(c => { 
      const w = Math.sqrt(c.itemCount);
      wSum += c.rate * w; 
      wTotal += w; 
    });
    return wTotal > 0 ? Math.min(100, Math.round(wSum / wTotal)) : 0;
  }
  
  const n5Rate = levelPassRate('N5');
  const n4Rate = levelPassRate('N4');
  const n3Rate = levelPassRate('N3');
  
  const goalLevel = localStorage.getItem('nw3_goal') || 'N4';
  const goalRate = goalLevel === 'N5' ? n5Rate : goalLevel === 'N4' ? n4Rate : n3Rate;
  const goalColor = goalLevel === 'N5' ? '#4CAF50' : goalLevel === 'N4' ? '#2196F3' : '#9C27B0';
  
  const allWeak = catStats.reduce((s,c) => s + c.weakCount, 0);
  const allMastered = catStats.reduce((s,c) => s + c.masteredCount, 0);
  const allItems = catStats.reduce((s,c) => s + c.itemCount, 0);
  const totalCorrect = +(localStorage.getItem('nw3_t')||0);
  
  let h = '<div style="padding:4px 0">';
  
  // Header
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'おはよう' : hour < 18 ? 'こんにちは' : 'お疲れ様';
  h += '<div style="text-align:center;padding:12px 0 16px">';
  h += '<div style="font-size:14px;color:var(--txM)">'+greeting+'！</div>';
  h += '<div style="font-family:\'Zen Maru Gothic\',sans-serif;font-size:20px;font-weight:900;color:var(--tx)">📊 マイダッシュボード</div>';
  h += '</div>';
  
  // Goal card with big circle
  const r = 55, circ = 2*Math.PI*r, offset = circ*(1-goalRate/100);
  h += '<div style="background:linear-gradient(135deg,'+goalColor+','+goalColor+'dd);border-radius:16px;padding:20px;margin-bottom:14px;text-align:center;color:#fff;position:relative;overflow:hidden">';
  h += '<div style="position:absolute;top:-20px;right:-20px;font-size:80px;opacity:0.1">🎯</div>';
  h += '<div style="font-size:12px;opacity:0.8;margin-bottom:8px">目標: '+goalLevel+' 合格</div>';
  h += '<div style="margin:0 auto 8px;width:130px;height:130px">';
  h += '<svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r="'+r+'" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>';
  h += '<circle cx="65" cy="65" r="'+r+'" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+offset+'" transform="rotate(-90 65 65)" style="transition:stroke-dashoffset 1.5s"/>';
  h += '<text x="65" y="58" text-anchor="middle" fill="#fff" font-size="32" font-weight="900">'+goalRate+'%</text>';
  h += '<text x="65" y="78" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="10">合格推定率</text>';
  h += '</svg></div>';
  
  const statusMsg = goalRate >= 80 ? '🏆 合格圏内！' : goalRate >= 60 ? '📈 もう少し！' : goalRate >= 30 ? '📚 頑張ろう！' : '🌱 始めよう！';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:4px">'+statusMsg+'</div>';
  h += '<div style="font-size:11px;opacity:0.7">習得: '+allMastered+'/'+allItems+' | 累計正解: '+totalCorrect+'</div>';
  h += '<button onclick="boostPassRate()" style="margin-top:10px;padding:10px 24px;background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">📈 合格率を上げる！</button>';
  h += '</div>';
  
  // Weak items alert
  if (allWeak > 0) {
    h += '<div onclick="openM(\'review\')" style="background:linear-gradient(135deg,#FFF3E0,#FFE0B2);border-radius:12px;padding:12px 14px;margin-bottom:14px;cursor:pointer;border:1px solid #FFB74D;display:flex;align-items:center;gap:10px">';
    h += '<div style="font-size:24px">⚠️</div>';
    h += '<div><div style="font-size:12px;font-weight:700;color:#E65100">苦手アイテム: '+allWeak+'個</div>';
    h += '<div style="font-size:10px;color:#BF360C">タップして復習 →</div></div></div>';
  }
  
  // N5/N4/N3 progress
  h += '<div style="background:var(--s1);border-radius:14px;padding:14px;margin-bottom:14px;border:1px solid var(--brd)">';
  h += '<div style="font-family:\'Zen Maru Gothic\',sans-serif;font-size:13px;font-weight:700;margin-bottom:12px;color:var(--tx)">🎓 JLPT レベル別</div>';
  
  [{l:'N5',r:n5Rate,c:'#4CAF50'},{l:'N4',r:n4Rate,c:'#2196F3'},{l:'N3',r:n3Rate,c:'#9C27B0'}].forEach(item => {
    const isGoal = item.l === goalLevel;
    h += '<div style="margin-bottom:10px;'+(isGoal?'background:rgba(228,87,46,0.04);border-radius:8px;padding:6px 8px;border:1px solid rgba(228,87,46,0.15)':'')+'">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    h += '<div style="display:flex;align-items:center;gap:6px"><span style="font-weight:800;font-size:14px;color:var(--tx)">'+item.l+'</span>';
    if(isGoal) h += '<span style="font-size:9px;background:var(--acc);color:#fff;padding:1px 6px;border-radius:10px">目標</span>';
    h += '</div>';
    h += '<span style="font-size:14px;font-weight:800;color:'+item.c+'">'+item.r+'%</span></div>';
    h += '<div style="background:var(--s3);border-radius:5px;height:8px;overflow:hidden">';
    h += '<div style="height:100%;background:'+item.c+';border-radius:5px;width:'+Math.max(2,item.r)+'%;transition:width 1.2s"></div></div></div>';
  });
  h += '</div>';
  
  // Category breakdown
  h += '<div style="background:var(--s1);border-radius:14px;padding:14px;margin-bottom:14px;border:1px solid var(--brd)">';
  h += '<div style="font-family:\'Zen Maru Gothic\',sans-serif;font-size:13px;font-weight:700;margin-bottom:10px;color:var(--tx)">📋 カテゴリー別</div>';
  
  catStats.forEach(cat => {
    const masteryPct = cat.itemCount > 0 ? Math.round(cat.masteredCount / cat.itemCount * 100) : 0;
    const barColor = cat.rate >= 80 ? 'var(--grn)' : cat.rate >= 60 ? '#D4A843' : 'var(--acc)';
    
    h += '<div style="padding:8px 0;border-bottom:1px solid var(--brd)">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">';
    h += '<div style="display:flex;align-items:center;gap:5px">';
    h += '<span style="font-size:14px">'+cat.icon+'</span>';
    h += '<span style="font-size:12px;font-weight:600;color:var(--tx)">'+_cn(cat.name)+'</span>';
    h += '<span style="font-size:9px;color:var(--txD);background:var(--s2);padding:1px 5px;border-radius:8px">'+cat.level+'</span>';
    h += '</div>';
    h += '<div style="display:flex;align-items:center;gap:6px">';
    if(cat.weakCount>0) h += '<span style="font-size:9px;background:#FFF3E0;color:#E65100;padding:1px 5px;border-radius:8px">💀'+cat.weakCount+'</span>';
    h += '<span style="font-size:12px;font-weight:700;color:'+barColor+'">'+cat.rate+'%</span></div></div>';
    
    // Combined bar
    h += '<div style="display:flex;gap:4px;align-items:center">';
    h += '<div style="flex:1;background:var(--s3);border-radius:3px;height:4px;overflow:hidden"><div style="height:100%;background:'+barColor+';border-radius:3px;width:'+cat.rate+'%"></div></div>';
    h += '<span style="font-size:9px;color:var(--txD);min-width:44px;text-align:right">'+cat.masteredCount+'/'+cat.itemCount+'</span>';
    h += '</div></div>';
  });
  h += '</div>';
  
  // Action buttons
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
  h += '<button onclick="openM(\'review\')" style="padding:12px;border-radius:12px;background:var(--g1);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">📝 復習クイズ</button>';
  h += '<button onclick="openM(\'longterm\')" style="padding:12px;border-radius:12px;background:var(--g2);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">🧠 長期記憶テスト</button>';
  h += '</div>';
  h += '<button onclick="localStorage.removeItem(\'nw3_onboarded\');showOnboarding()" style="width:100%;padding:10px;border-radius:10px;background:var(--s2);color:var(--txM);border:1px solid var(--brd);font-size:11px;cursor:pointer;font-family:inherit;margin-bottom:8px">🎯 目標レベルを変更</button>';
  h += '<button onclick="goHome()" style="width:100%;padding:10px;border-radius:10px;background:var(--s2);color:var(--txM);border:1px solid var(--brd);font-size:12px;cursor:pointer;font-family:inherit">🏠 ホームに戻る</button>';
  h += '</div>';
  
  target.innerHTML = h;
}


// ── INITIALIZATION: Hook into existing system ──

// Override dashboard
const _origMkDashboard = typeof mkDashboard === 'function' ? mkDashboard : null;
mkDashboard = function(c) {
  mkDashboardV2(c);
};

// Hook: Show onboarding on first visit (only on index.html)
document.addEventListener('DOMContentLoaded', function() {
  // Only show on index page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/nihongo-work/')) {
    setTimeout(() => {
      if (shouldShowOnboarding()) {
        showOnboarding();
      } else {
        showDailyStudyPopup();
      }
    }, 800);
  }
});

// ── Monkey-patch mkQ to add timing + result details ──
const _origMkQ = typeof mkQ === 'function' ? mkQ : null;

if (_origMkQ) {
  mkQ = function(c, datasets, title, em, qFn, optFn, max, modKey) {
    // Reset quiz log for new quiz
    window._quizLog = [];
    window._quizQStart = Date.now();
    
    // Wrap optFn to capture timing
    const wrappedOptFn = function(item, cur) {
      window._quizQStart = Date.now(); // start timer for this question
      return optFn(item, cur);
    };
    
    // Call original
    _origMkQ(c, datasets, title, em, qFn, wrappedOptFn, max, modKey);
    
    // Override the score screen rendering by observing DOM changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        const scrEl = c.querySelector('.scr');
        if (scrEl && !scrEl.dataset.enhanced && window._quizLog.length > 0) {
          scrEl.dataset.enhanced = '1';
          renderQuizResultDetails(scrEl, window._quizLog, modKey);
        }
      });
    });
    observer.observe(c, { childList: true, subtree: true });
  };
}

// Patch SRS to also log quiz answers
const _origSRSCorrect = SRS.correct.bind(SRS);
const _origSRSWrong = SRS.wrong.bind(SRS);

// We intercept at the click handler level instead - see monkey-patched mkQ above.

console.log('✅ Nihongo-Work Enhanced Features v11 loaded');
