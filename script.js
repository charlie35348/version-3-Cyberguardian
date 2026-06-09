/* script.js — shared logic for all Cyber Guardian quiz pages */
(function() {
  'use strict';

  const username = localStorage.getItem('username');
  if (!username) { location.href = 'threats.html'; }

  // quiz-engine expects: window.QUIZ_DATA = { title, icon, data[] }
  const { title, icon, data } = window.QUIZ_DATA;

  let i = 0;
  let score = 0;
  const answers = [];
  const PASS_SCORE = 200;

  /* ── DOM refs ── */
  const progressFill  = document.getElementById('progress-fill');
  const playerDisplay = document.getElementById('player-display');
  const scoreBadge    = document.getElementById('score-badge');
  const questionNum   = document.getElementById('question-num');
  const questionText  = document.getElementById('question-text');
  const optionsWrap   = document.getElementById('options-wrap');
  const feedbackEl    = document.getElementById('feedback');
  const resultWrap    = document.getElementById('result-wrap');
  const quizWrap      = document.getElementById('quiz-wrap');
  const prevBtn       = document.getElementById('prev-btn');
  const nextBtn       = document.getElementById('next-btn');

  playerDisplay.textContent = '👤 ' + username;

  function render() {
    const q   = data[i];
    const sel = answers[i];
    const pct = ((i + 1) / data.length) * 100;

    progressFill.style.width = pct + '%';
    scoreBadge.textContent   = score + ' pts';
    questionNum.textContent  = 'Question ' + (i + 1) + ' of ' + data.length;
    questionText.textContent = q.q;

    optionsWrap.innerHTML = q.opts.map((opt, j) => {
      let cls = 'answer-btn';
      if (sel !== null && sel !== undefined) {
        if (j === q.ans)  cls += ' correct';
        else if (j === sel) cls += ' wrong';
      }
      const disabled = (sel !== null && sel !== undefined) ? 'disabled' : '';
      return `<button class="${cls}" ${disabled} onclick="window._quizChoose(${j})">${opt}</button>`;
    }).join('');

    /* feedback */
    if (sel === null || sel === undefined) {
      feedbackEl.textContent = '';
      feedbackEl.className   = 'feedback';
    } else if (sel === q.ans) {
      feedbackEl.textContent = '✅  Correct! Good thinking.';
      feedbackEl.className   = 'feedback correct';
    } else {
      feedbackEl.textContent = '❌  Wrong. ' + q.explanation;
      feedbackEl.className   = 'feedback wrong';
    }

    prevBtn.disabled = i === 0;
    nextBtn.disabled = (answers[i] === null || answers[i] === undefined) || i === data.length - 1;
  }

  function saveResult() {
    try {
      const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
      scores.push({ name: username, score: score });
      localStorage.setItem('quizScores', JSON.stringify(scores));
    } catch(e) {}
  }

  function showResult() {
    const passed = score >= PASS_SCORE;
    quizWrap.classList.add('hidden');

    resultWrap.innerHTML = `
      <div class="result-banner ${passed ? 'pass' : 'fail'}">
        <div class="result-icon">${passed ? '🏆' : '💡'}</div>
        <div class="result-label">${passed ? 'Challenge Passed!' : 'Keep Practising!'}</div>
        <div class="result-sub">${icon} ${title} &nbsp;·&nbsp; Final score: <strong style="color:${passed?'var(--green)':'var(--red)'};">${score} pts</strong></div>
        <div class="result-sub" style="margin-top:6px;">You need 200 pts to pass. Returning to threats…</div>
      </div>`;
    resultWrap.classList.remove('hidden');
    feedbackEl.className = 'feedback';
    feedbackEl.textContent = '';

    setTimeout(() => { location.href = 'threats.html'; }, 3000);
  }

  window._quizChoose = function(j) {
    if (answers[i] !== null && answers[i] !== undefined) return;
    answers[i] = j;
    if (j === data[i].ans) score += 50; else score -= 50;
    render();
    if (i === data.length - 1) {
      saveResult();
      setTimeout(showResult, 800);
    }
  };

  window._quizPrev = function() { if (i > 0) { i--; render(); } };
  window._quizNext = function() { if (i < data.length - 1 && (answers[i] !== null && answers[i] !== undefined)) { i++; render(); } };

  // init
  for (let k = 0; k < data.length; k++) answers.push(null);
  render();
})();
