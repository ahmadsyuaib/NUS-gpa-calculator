/**
 * NUS GPA Calculator Script
 * Handles logic for calculating GPA based on module entries
 */

// Global state
let boxes = [];
let entryCounter = 0;

// Constants
const MAX_SU_MODULES = 8;
const DEFAULT_CREDITS = 4;
const BOX_TITLES = [
  'Year 1 Sem 1',
  'Year 1 Sem 2',
  'Year 2 Sem 1',
  'Year 2 Sem 2',
  'Year 3 Sem 1',
  'Year 3 Sem 2',
  'Year 4 Sem 1',
  'Year 4 Sem 2',
];

/**
 * Initialize the calculator
 */
function init() {
  // Create 8 semesters
  for (let i = 0; i < 8; i++) {
    boxes.push([]);
  }
  renderBoxes();
  updateGPA();
}

/**
 * Reset a specific semester box
 * @param {number} semIndex - Index of the semester to reset
 */
function resetBox(semIndex) {
  boxes[semIndex] = [];
  renderEntries(semIndex);
  updateGPA();
}

/**
 * Render all semester boxes
 */
function renderBoxes() {
  const grid = document.getElementById('boxGrid');
  grid.innerHTML = '';

  for (let i = 0; i < 8; i++) {
    const box = document.createElement('div');
    box.className = 'box';

    box.innerHTML = `
      <div class="box-title">${BOX_TITLES[i]}</div>
      <div id="entries-${i}"></div>
      <div class="box-actions">
        <button class="add-btn" onclick="addEntry(${i})">+</button>
        <button class="sem-reset-btn" onclick="resetBox(${i})">Reset Sem</button>
      </div>
    `;

    grid.appendChild(box);
    renderEntries(i);
  }
}

/**
 * Check if an entry has a module name filled
 * @param {Object} entry - Module entry to check
 * @returns {boolean} - True if module name is not empty
 */
function isEntryFilled(entry) {
  return entry.name.trim() !== '';
}

/**
 * Render all entries within a semester box
 * @param {number} boxIndex - Index of the semester box
 */
function renderEntries(boxIndex) {
  const container = document.getElementById(`entries-${boxIndex}`);
  container.innerHTML = '';

  boxes[boxIndex].forEach((entry, entryIndex) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';

    if (!isEntryFilled(entry)) {
      entryDiv.classList.add('entry-empty');
    } else {
      entryDiv.classList.remove('entry-empty');
    }

    entryDiv.innerHTML = createEntryHTML(entry, boxIndex, entryIndex);
    container.appendChild(entryDiv);
  });
}

/**
 * Generate HTML for a module entry
 * @param {Object} entry - Module entry data
 * @param {number} boxIndex - Index of the semester box
 * @param {number} entryIndex - Index of the entry
 * @returns {string} - HTML for the entry
 */
function createEntryHTML(entry, boxIndex, entryIndex) {
  return `
    <div class="form-group">
      <label>Module Name</label>
      <input type="text" value="${entry.name}"
             onchange="updateEntry(${boxIndex}, ${entryIndex}, 'name', this.value)">
    </div>
    <div class="form-group">
      <label>GPA</label>
      <select onchange="updateEntry(${boxIndex}, ${entryIndex}, 'gpa', parseFloat(this.value))">
        ${generateGPAOptions(entry.gpa)}
      </select>
    </div>
    <div class="form-group">
      <label>Credits</label>
      <select onchange="updateEntry(${boxIndex}, ${entryIndex}, 'credits', parseInt(this.value))">
        ${generateCreditOptions(entry.credits)}
      </select>
    </div>
    <div class="form-group">
      <div class="toggle-container">
        <label>S/U</label>
        <div class="toggle ${entry.su ? 'active' : ''}" 
             onclick="toggleSU(${boxIndex}, ${entryIndex})">
          <div class="toggle-switch"></div>
        </div>
      </div>
    </div>
    <button class="delete-btn" onclick="deleteEntry(${boxIndex}, ${entryIndex})">Delete</button>
  `;
}

/**
 * Save current data to JSON file
 */
function saveDataAsJSON() {
  const dataStr = JSON.stringify(boxes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'gpa_data.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Clear all entries and reset calculator
 */
function resetCalculator() {
  boxes = Array(8)
    .fill()
    .map(() => []);
  entryCounter = 0;
  renderBoxes();
  updateGPA();
}

/**
 * Generate GPA dropdown options
 * @param {number} selectedGPA - Currently selected GPA value
 * @returns {string} - HTML for GPA dropdown options
 */
function generateGPAOptions(selectedGPA) {
  let options = '';
  for (let i = 0; i <= 5; i += 0.5) {
    const selected = i === selectedGPA ? 'selected' : '';
    options += `<option value="${i}" ${selected}>${i.toFixed(1)}</option>`;
  }
  return options;
}

/**
 * Generate credit dropdown options
 * @param {number} selectedCredits - Currently selected credits value
 * @returns {string} - HTML for credit dropdown options
 */
function generateCreditOptions(selectedCredits) {
  let options = '';
  for (let i = 2; i <= 8; i++) {
    const selected = i === selectedCredits ? 'selected' : '';
    options += `<option value="${i}" ${selected}>${i}</option>`;
  }
  return options;
}

/**
 * Add new entry to a semester box
 * @param {number} boxIndex - Index of the semester box
 */
function addEntry(boxIndex) {
  const newEntry = {
    id: entryCounter++,
    name: '',
    gpa: 0.0,
    credits: DEFAULT_CREDITS,
    su: false,
  };

  boxes[boxIndex].push(newEntry);
  renderEntries(boxIndex);
  updateGPA();
}

/**
 * Update entry data
 * @param {number} boxIndex - Index of the semester box
 * @param {number} entryIndex - Index of the entry
 * @param {string} field - Field to update
 * @param {any} value - New value
 */
function updateEntry(boxIndex, entryIndex, field, value) {
  boxes[boxIndex][entryIndex][field] = value;
  renderEntries(boxIndex);
  updateGPA();
}

/**
 * Toggle S/U status of an entry
 * @param {number} boxIndex - Index of the semester box
 * @param {number} entryIndex - Index of the entry
 */
function toggleSU(boxIndex, entryIndex) {
  const currentSUCount = getCurrentSUCount();
  const entry = boxes[boxIndex][entryIndex];

  if (!entry.su && currentSUCount >= MAX_SU_MODULES) {
    alert(`Maximum of ${MAX_SU_MODULES} S/U modules allowed!`);
    return;
  }

  entry.su = !entry.su;
  renderEntries(boxIndex);
  updateGPA();
}

/**
 * Delete an entry
 * @param {number} boxIndex - Index of the semester box
 * @param {number} entryIndex - Index of the entry
 */
function deleteEntry(boxIndex, entryIndex) {
  boxes[boxIndex].splice(entryIndex, 1);
  renderEntries(boxIndex);
  updateGPA();
}

/**
 * Get current count of S/U modules
 * @returns {number} - Count of S/U modules
 */
function getCurrentSUCount() {
  return boxes.flat().reduce((count, entry) => count + (entry.su ? 1 : 0), 0);
}

/**
 * Calculate and update GPA display
 */
function updateGPA() {
  let totalGradePoints = 0;
  let totalGradedCredits = 0;
  let totalCredits = 0;
  let suCount = 0;

  boxes.forEach((box) => {
    box.forEach((entry) => {
      if (entry.name.trim() !== '') {
        totalCredits += entry.credits;

        if (entry.su) {
          suCount++;
        } else {
          totalGradePoints += entry.gpa * entry.credits;
          totalGradedCredits += entry.credits;
        }
      }
    });
  });

  const gpa =
    totalGradedCredits > 0 ? totalGradePoints / totalGradedCredits : 0;

  updateGPADisplay(gpa);
  updateStats(totalCredits, totalGradedCredits, suCount);
}

/**
 * Update the GPA display and styling
 * @param {number} gpa - Calculated GPA
 */
function updateGPADisplay(gpa) {
  const gpaDisplay = document.getElementById('gpaDisplay');
  gpaDisplay.textContent = gpa.toFixed(2);

  // Update color based on GPA value
  gpaDisplay.classList.remove('gpa-low', 'gpa-normal', 'gpa-high');
  if (gpa <= 2.5) {
    gpaDisplay.classList.add('gpa-low');
  } else if (gpa >= 4.5) {
    gpaDisplay.classList.add('gpa-high');
  } else {
    gpaDisplay.classList.add('gpa-normal');
  }
}

/**
 * Update statistics display
 * @param {number} totalCredits - Total credits
 * @param {number} totalGradedCredits - Total graded credits
 * @param {number} suCount - Count of S/U modules
 */
function updateStats(totalCredits, totalGradedCredits, suCount) {
  document.getElementById('totalCredits').textContent = totalCredits;
  document.getElementById('gradedCredits').textContent = totalGradedCredits;
  document.getElementById('suCount').textContent = suCount;

  // Show/hide S/U warning
  const warning = document.getElementById('suWarning');
  warning.style.display = suCount >= MAX_SU_MODULES ? 'block' : 'none';
}

// Set up file upload handler
document
  .getElementById('jsonFileInput')
  .addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          boxes = data;
          renderBoxes();
          updateGPA();
        } else {
          alert('Invalid data format in JSON!');
        }
      } catch (err) {
        alert('Invalid JSON file!');
      }
    };

    reader.readAsText(file);
  });

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
