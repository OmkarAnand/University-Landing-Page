const el = (sel) => document.querySelector(sel)
const els = (sel) => document.querySelectorAll(sel)

const state = {
  university: document.body.dataset.university || 'amity',
  endpoints: {
    courses: (u) => `api/courses/${u}.json`,
    fees: (u) => `api/fees/${u}.json`,
  },
}

const fetchJSON = async (url) => {
  const r = await fetch(url)
  if (!r.ok) throw new Error('Network error')
  return r.json()
}

const renderCourses = (data) => {
  const wrap = el('#coursesList')
  wrap.innerHTML = ''
  data.courses.forEach((c) => {
    const d = document.createElement('div')
    d.className = 'card'
    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${c.name}</div>
          <div style="color:#95a3b9">${c.duration}</div>
          <div style="margin-top:6px;color:#95a3b9">Specializations: ${c.specializations.join(', ')}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">₹${c.fees.min.toLocaleString()}–₹${c.fees.max.toLocaleString()}</div>
          <div style="color:#95a3b9">Per year</div>
        </div>
      </div>
    `
    wrap.appendChild(d)
  })
  const sel = el('#courseSelect')
  sel.innerHTML = '<option value="">Select</option>' + data.courses.map(c => `<option>${c.name}</option>`).join('')
  const p = el('#placements')
  p.innerHTML = `
    <div class="card">Highest: ₹${data.placements.highest.toLocaleString()}</div>
    <div class="card">Average: ₹${data.placements.average.toLocaleString()}</div>
    <div class="card">Top Recruiters: ${data.placements.top_recruiters.join(', ')}</div>
  `
}

const renderFeesModal = (data) => {
  const wrap = el('#feesContent')
  wrap.innerHTML = ''
  Object.keys(data.fees).forEach((k) => {
    const v = data.fees[k]
    const d = document.createElement('div')
    d.className = 'fee-item'
    d.innerHTML = `<div>${k}</div><div>₹${v.min.toLocaleString()}–₹${v.max.toLocaleString()} / year</div>`
    wrap.appendChild(d)
  })
}

const openModal = () => {
  el('#feesModal').classList.add('show')
  el('#feesModal').setAttribute('aria-hidden', 'false')
}
const closeModal = () => {
  el('#feesModal').classList.remove('show')
  el('#feesModal').setAttribute('aria-hidden', 'true')
}

const submitLead = async (e) => {
  e.preventDefault()
  const form = e.target
  const data = Object.fromEntries(new FormData(form).entries())
  if (!data.consent) {
    el('#formMsg').textContent = 'Please provide consent.'
    el('#formMsg').className = 'form-msg error'
    return
  }
  const payload = {
    university: state.university,
    ...data,
    timestamp: new Date().toISOString(),
  }
  try {
    const r = await fetch(window.APP_CONFIG?.PIPELINE_ENDPOINT || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok) throw new Error('Failed')
    el('#formMsg').textContent = 'Form submitted successfully.'
    el('#formMsg').className = 'form-msg success'
    form.reset()
  } catch (err) {
    el('#formMsg').textContent = 'Submission failed. Please try again.'
    el('#formMsg').className = 'form-msg error'
  }
}

const initPage = async () => {
  els('#feesBtn, #feesBtn2').forEach(b => b.addEventListener('click', async () => {
    try {
      const d = await fetchJSON(state.endpoints.fees(state.university))
      renderFeesModal(d)
      openModal()
    } catch {}
  }))
  el('#closeModal').addEventListener('click', closeModal)
  el('#leadForm').addEventListener('submit', submitLead)
  try {
    const d = await fetchJSON(state.endpoints.courses(state.university))
    renderCourses(d)
  } catch {}
}

document.addEventListener('DOMContentLoaded', initPage)