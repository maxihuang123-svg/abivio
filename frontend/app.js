// abivio frontend logic
(function () {
  const API_BASE = window.location.origin.includes('localhost') ? '' : '';

  // Quiz configuration
  const quizQuestions = [
    {
      key: 'interests',
      title: 'Welche Themen interessieren dich am meisten?',
      subtitle: 'Wähle 1–3 Bereiche aus.',
      type: 'multi',
      min: 1,
      max: 3,
      options: [
        { value: 'technik', label: 'Technik & Digital' },
        { value: 'wirtschaft', label: 'Wirtschaft & Management' },
        { value: 'medizin', label: 'Medizin & Gesundheit' },
        { value: 'natur', label: 'Natur & Umwelt' },
        { value: 'gesellschaft', label: 'Gesellschaft & Politik' },
        { value: 'kreativ', label: 'Kreativität & Design' },
        { value: 'sprachen', label: 'Sprachen & Kultur' },
        { value: 'mensch', label: 'Menschen & Beratung' },
      ],
    },
    {
      key: 'strengths',
      title: 'In welchen Fächern bist du besonders gut?',
      subtitle: 'Wähle deine 2–4 stärksten Schulfächer.',
      type: 'multi',
      min: 2,
      max: 4,
      options: [
        { value: 'mathematik', label: 'Mathematik' },
        { value: 'informatik', label: 'Informatik' },
        { value: 'physik', label: 'Physik' },
        { value: 'chemie', label: 'Chemie' },
        { value: 'biologie', label: 'Biologie' },
        { value: 'deutsch', label: 'Deutsch' },
        { value: 'englisch', label: 'Englisch' },
        { value: 'geschichte', label: 'Geschichte' },
        { value: 'kunst', label: 'Kunst / Musik' },
        { value: 'sport', label: 'Sport' },
        { value: 'sozialkunde', label: 'Sozialkunde' },
        { value: 'geografie', label: 'Geografie' },
      ],
    },
    {
      key: 'work_style',
      title: 'Wie möchtest du am liebsten arbeiten?',
      subtitle: 'Wähle 1–3 Eigenschaften, die auf dich zutreffen.',
      type: 'multi',
      min: 1,
      max: 3,
      options: [
        { value: 'analytisch', label: 'Analytisch & logisch' },
        { value: 'kreativ', label: 'Kreativ & ideenreich' },
        { value: 'praktisch', label: 'Praktisch & handwerklich' },
        { value: 'kommunikativ', label: 'Kommunikativ & sozial' },
        { value: 'forschung', label: 'Forschend & wissenschaftlich' },
        { value: 'unternehmerisch', label: 'Unternehmerisch & strategisch' },
        { value: 'empathisch', label: 'Empathisch & pflegend' },
      ],
    },
    {
      key: 'nc_grade',
      title: 'Wie sieht dein aktueller Abiturschnitt aus?',
      subtitle: 'Optional — hilft uns, dir realistische NCs zu zeigen.',
      type: 'single',
      options: [
        { value: '1.0', label: '1,0 – 1,4' },
        { value: '1.5', label: '1,5 – 1,9' },
        { value: '2.0', label: '2,0 – 2,4' },
        { value: '2.5', label: '2,5 – 2,9' },
        { value: '3.0', label: '3,0 – 3,4' },
        { value: '', label: 'Weiß ich noch nicht / möchte ich nicht sagen' },
      ],
    },
    {
      key: 'language',
      title: 'In welcher Sprache möchtest du studieren?',
      subtitle: 'Einige Studiengänge sind auf Englisch.',
      type: 'single',
      options: [
        { value: 'de', label: 'Deutsch' },
        { value: 'en', label: 'Englisch' },
        { value: 'egal', label: 'Ist mir egal' },
      ],
    },
    {
      key: 'duration',
      title: 'Wie lange möchtest du studieren?',
      subtitle: 'Standard-Bachelor dauert 6 Semester.',
      type: 'single',
      options: [
        { value: 'kurz', label: 'Eher kürzer (bis 6 Semester)' },
        { value: 'lang', label: 'Eher länger (ab 8 Semester, z. B. Medizin)' },
        { value: 'egal', label: 'Ist mir egal' },
      ],
    },
    {
      key: 'region',
      title: 'Hast du eine bevorzugte Region in Deutschland?',
      subtitle: 'Für spätere Erweiterungen — aktuell noch nicht in der Empfehlung enthalten.',
      type: 'single',
      options: [
        { value: 'nord', label: 'Norddeutschland' },
        { value: 'west', label: 'Westdeutschland' },
        { value: 'sued', label: 'Süddeutschland' },
        { value: 'ost', label: 'Ostdeutschland' },
        { value: 'egal', label: 'Keine Präferenz' },
      ],
    },
    {
      key: 'preferred_university',
      title: 'Gibt es eine Universität, die du besonders bevorzugst?',
      subtitle: 'Wir priorisieren dann Studiengänge an dieser Uni.',
      type: 'single',
      options: [
        { value: 'München', label: 'München (TUM / LMU)' },
        { value: 'Berlin', label: 'Berlin (FU / HU / TU)' },
        { value: 'Heidelberg', label: 'Uni Heidelberg' },
        { value: 'Köln', label: 'Uni Köln' },
        { value: 'Hamburg', label: 'Uni Hamburg' },
        { value: 'Aachen', label: 'RWTH Aachen' },
        { value: 'Karlsruhe', label: 'KIT Karlsruhe' },
        { value: 'Frankfurt', label: 'Goethe-Universität Frankfurt' },
        { value: 'Mannheim', label: 'Uni Mannheim' },
        { value: 'Tübingen', label: 'Uni Tübingen' },
        { value: 'Freiburg', label: 'Uni Freiburg' },
        { value: 'Göttingen', label: 'Uni Göttingen' },
        { value: '', label: 'Keine Präferenz' },
      ],
    },
  ];

  let currentQuestion = 0;
  const answers = {};
  let sessionId = generateSessionId();

  // DOM refs
  const waitlistForm = document.getElementById('waitlist-form');
  const waitlistMessage = document.getElementById('waitlist-message');
  const quizForm = document.getElementById('quiz-form');
  const quizProgress = document.getElementById('quiz-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const quizLoading = document.getElementById('quiz-loading');
  const resultsSection = document.getElementById('results');
  const resultsList = document.getElementById('results-list');
  const retakeBtn = document.getElementById('retake-quiz');
  const feedbackArea = document.getElementById('feedback-area');
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackSessionId = document.getElementById('feedback-session-id');
  const feedbackMessage = document.getElementById('feedback-message');
  const helpfulnessStars = document.getElementById('helpfulness-stars');
  const helpfulnessHint = document.getElementById('helpfulness-hint');

  // Initialize
  renderQuestion(currentQuestion);

  // Waitlist handler
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(waitlistForm);
      const email = formData.get('email');
      const graduationYear = formData.get('graduationYear');

      try {
        const res = await fetch(`${API_BASE}/api/waitlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, graduationYear: graduationYear ? Number(graduationYear) : null }),
        });
        const data = await res.json();
        if (res.ok) {
          showWaitlistMessage(data.message, 'success');
          waitlistForm.reset();
        } else {
          showWaitlistMessage(data.error || 'Fehler beim Eintragen.', 'error');
        }
      } catch (err) {
        showWaitlistMessage('Netzwerkfehler. Bitte später erneut versuchen.', 'error');
      }
    });
  }

  function showWaitlistMessage(text, type) {
    waitlistMessage.textContent = text;
    waitlistMessage.className = `form-message ${type}`;
  }

  // Quiz rendering
  function renderQuestion(index) {
    const q = quizQuestions[index];
    quizForm.innerHTML = '';

    const questionEl = document.createElement('div');
    questionEl.className = 'question';

    const title = document.createElement('h3');
    title.className = 'question-title';
    title.textContent = q.title;
    questionEl.appendChild(title);

    if (q.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'question-subtitle';
      subtitle.textContent = q.subtitle;
      questionEl.appendChild(subtitle);
    }

    const optionsEl = document.createElement('div');
    optionsEl.className = 'options';

    q.options.forEach((opt) => {
      const option = document.createElement('label');
      option.className = 'option';
      const inputType = q.type === 'multi' ? 'checkbox' : 'radio';
      const name = q.key;
      const checked =
        q.type === 'multi'
          ? (answers[q.key] || []).includes(opt.value)
          : answers[q.key] === opt.value;

      option.innerHTML = `
        <input type="${inputType}" name="${name}" value="${opt.value}" ${checked ? 'checked' : ''}>
        <span class="option-label">${opt.label}</span>
      `;
      optionsEl.appendChild(option);
    });

    questionEl.appendChild(optionsEl);
    quizForm.appendChild(questionEl);

    // Navigation
    const nav = document.createElement('div');
    nav.className = 'quiz-nav';

    if (index > 0) {
      const backBtn = document.createElement('button');
      backBtn.type = 'button';
      backBtn.className = 'btn btn-secondary';
      backBtn.textContent = 'Zurück';
      backBtn.addEventListener('click', () => {
        saveCurrentAnswers();
        currentQuestion--;
        renderQuestion(currentQuestion);
      });
      nav.appendChild(backBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn-primary';
    nextBtn.textContent = index === quizQuestions.length - 1 ? 'Empfehlungen anzeigen' : 'Weiter';
    nextBtn.addEventListener('click', () => {
      if (!saveCurrentAnswers()) return;
      if (index < quizQuestions.length - 1) {
        currentQuestion++;
        renderQuestion(currentQuestion);
      } else {
        submitQuiz();
      }
    });
    nav.appendChild(nextBtn);

    quizForm.appendChild(nav);
    updateProgress(index);
    quizProgress.hidden = false;
  }

  function saveCurrentAnswers() {
    const q = quizQuestions[currentQuestion];
    const inputs = quizForm.querySelectorAll(`input[name="${q.key}"]:checked`);
    const values = Array.from(inputs).map((i) => i.value);

    if (q.type === 'multi') {
      if (values.length < q.min) {
        alert(`Bitte wähle mindestens ${q.min} Option aus.`);
        return false;
      }
      if (values.length > q.max) {
        alert(`Bitte wähle höchstens ${q.max} Optionen aus.`);
        return false;
      }
      answers[q.key] = values;
    } else {
      if (values.length === 0) {
        alert('Bitte wähle eine Option aus.');
        return false;
      }
      answers[q.key] = values[0];
    }
    return true;
  }

  function updateProgress(index) {
    const pct = ((index + 1) / quizQuestions.length) * 100;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `Frage ${index + 1} von ${quizQuestions.length}`;
  }

  async function submitQuiz() {
    quizForm.hidden = true;
    quizProgress.hidden = true;
    quizLoading.hidden = false;

    const payload = {
      session_id: sessionId,
      answers: {
        ...answers,
        nc_grade: answers.nc_grade ? Number(answers.nc_grade) : null,
      },
    };

    try {
      const res = await fetch(`${API_BASE}/api/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        renderResults(data.recommendations);
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert(data.error || 'Fehler beim Berechnen der Empfehlungen.');
        quizForm.hidden = false;
        quizProgress.hidden = false;
      }
    } catch (err) {
      alert('Netzwerkfehler. Bitte später erneut versuchen.');
      quizForm.hidden = false;
      quizProgress.hidden = false;
    } finally {
      quizLoading.hidden = true;
    }
  }

  function renderResults(recommendations) {
    resultsList.innerHTML = '';

    if (!recommendations || recommendations.length === 0) {
      resultsList.innerHTML = '<p>Leider konnten wir keine passenden Empfehlungen finden. Versuche es mit anderen Antworten.</p>';
      feedbackArea.hidden = true;
      return;
    }

    recommendations.forEach((rec, idx) => {
      const card = document.createElement('article');
      card.className = 'result-card';

      const ncText = rec.nc_required
        ? `NC: ca. ${rec.nc_grade?.toFixed(1).replace('.', ',') || 'k.A.'}`
        : 'Ohne NC';

      const uniText = rec.university_name ? `${escapeHtml(rec.university_name)}` : '';
      const deadlineText = rec.application_deadline_winter
        ? `Bewerbung bis ${formatDate(rec.application_deadline_winter)}`
        : '';

      card.innerHTML = `
        <div class="result-header">
          <span class="result-rank">${idx + 1}</span>
          <h3 class="result-title">${escapeHtml(rec.name)}</h3>
        </div>
        <div class="result-meta">
          <span class="tag">${escapeHtml(rec.field)}</span>
          <span class="tag">${escapeHtml(rec.degree)}</span>
          <span class="tag">${rec.duration_semesters} Semester</span>
          <span class="tag">${rec.language === 'en' ? 'Englisch' : rec.language === 'de/en' ? 'Deutsch/Englisch' : 'Deutsch'}</span>
          <span class="tag">${ncText}</span>
        </div>
        ${uniText ? `<p class="result-university"><strong>Universität:</strong> ${uniText}</p>` : ''}
        ${deadlineText ? `<p class="result-deadline">${deadlineText}</p>` : ''}
        <p class="result-description">${escapeHtml(rec.description)}</p>
        <p class="result-reasoning">${escapeHtml(rec.reasoning)}</p>
        <p class="result-career"><strong>Berufsperspektiven:</strong> ${escapeHtml(rec.career)}</p>
      `;
      resultsList.appendChild(card);
    });

    // Reset and show feedback form
    resetFeedbackForm();
    feedbackSessionId.value = sessionId;
    feedbackArea.hidden = false;
  }

  // Feedback star rating
  let selectedHelpfulness = null;
  if (helpfulnessStars) {
    const starButtons = helpfulnessStars.querySelectorAll('button');
    const labels = ['Nicht hilfreich', 'Eher wenig hilfreich', 'Mittelmäßig', 'Hilfreich', 'Sehr hilfreich'];

    starButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = Number(btn.dataset.value);
        selectedHelpfulness = value;
        starButtons.forEach((b) => {
          b.classList.toggle('selected', Number(b.dataset.value) <= value);
        });
        helpfulnessHint.textContent = labels[value - 1];
      });
    });
  }

  function resetFeedbackForm() {
    if (feedbackForm) {
      feedbackForm.reset();
      feedbackForm.querySelectorAll('input, textarea, button').forEach((el) => {
        el.disabled = false;
      });
    }
    selectedHelpfulness = null;
    if (helpfulnessStars) {
      helpfulnessStars.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
    }
    if (helpfulnessHint) {
      helpfulnessHint.textContent = 'Tippe auf einen Stern';
    }
    if (feedbackMessage) {
      feedbackMessage.textContent = '';
      feedbackMessage.className = 'form-message';
    }
  }

  function showFeedbackMessage(text, type) {
    feedbackMessage.textContent = text;
    feedbackMessage.className = `form-message ${type}`;
  }

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(feedbackForm);
      const payload = {
        session_id: formData.get('session_id'),
        helpfulness: selectedHelpfulness,
        found_match: formData.get('found_match') || undefined,
        nps: formData.get('nps') ? Number(formData.get('nps')) : undefined,
        missing: formData.get('missing') || undefined,
      };

      // Remove undefined values to keep it minimal
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      try {
        const res = await fetch(`${API_BASE}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok) {
          showFeedbackMessage(data.message, 'success');
          feedbackArea.querySelectorAll('input, textarea, button').forEach((el) => {
            el.disabled = true;
          });
        } else {
          showFeedbackMessage(data.error || 'Fehler beim Senden.', 'error');
        }
      } catch (err) {
        showFeedbackMessage('Netzwerkfehler. Bitte später erneut versuchen.', 'error');
      }
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  function generateSessionId() {
    return 'av_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Retake quiz
  if (retakeBtn) {
    retakeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentQuestion = 0;
      Object.keys(answers).forEach((k) => delete answers[k]);
      sessionId = generateSessionId();
      resultsSection.hidden = true;
      feedbackArea.hidden = true;
      quizForm.hidden = false;
      quizProgress.hidden = false;
      renderQuestion(0);
      document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
    });
  }
})();
