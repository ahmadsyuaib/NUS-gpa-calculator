// Global variables
let boxes = [];
let entryCounter = 0;

// Initialize the calculator
function init() {
  for (let i = 0; i < 8; i++) {
    boxes.push([]);
  }
  renderBoxes();
  updateGPA();
}

// Render all boxes
function renderBoxes() {
  const grid = document.getElementById('boxGrid');
  grid.innerHTML = '';

  // Define the titles for each box
  const boxTitles = [
    'Year 1 Sem 1',
    'Year 1 Sem 2',
    'Year 2 Sem 1',
    'Year 2 Sem 2',
    'Year 3 Sem 1',
    'Year 3 Sem 2',
    'Year 4 Sem 1',
    'Year 4 Sem 2',
  ];

  for (let i = 0; i < 8; i++) {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `
            <div class="box-title">${boxTitles[i]}</div>
            <div id="entries-${i}"></div>
            <button class="add-btn" onclick="addEntry(${i})">+</button>
        `;
    grid.appendChild(box);
    renderEntries(i);
  }
}

function isEntryFilled(entry) {
  // Only check if module name is filled
  return entry.name.trim() !== '';
}

function renderEntries(boxIndex) {
  const container = document.getElementById(`entries-${boxIndex}`);
  container.innerHTML = '';

  boxes[boxIndex].forEach((entry, entryIndex) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';

    // If module name is empty, grey out the entry
    if (!isEntryFilled(entry)) {
      entryDiv.classList.add('entry-empty');
    } else {
      entryDiv.classList.remove('entry-empty');
    }

    entryDiv.innerHTML = `
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
    container.appendChild(entryDiv);
  });
}

/** Clears all entries and resets displayed values. */
function resetCalculator() {
  boxes = [[], [], [], [], [], [], [], []];
  entryCounter = 0;
  renderBoxes();
  updateGPA();
}

// Generate GPA dropdown options
function generateGPAOptions(selectedGPA) {
  let options = '';
  for (let i = 0; i <= 5; i += 0.5) {
    const selected = i === selectedGPA ? 'selected' : '';
    options += `<option value="${i}" ${selected}>${i.toFixed(1)}</option>`;
  }
  return options;
}

// Generate credit dropdown options
function generateCreditOptions(selectedCredits) {
  let options = '';
  for (let i = 2; i <= 8; i++) {
    const selected = i === selectedCredits ? 'selected' : '';
    options += `<option value="${i}" ${selected}>${i}</option>`;
  }
  return options;
}

// Add new entry to a box
function addEntry(boxIndex) {
  const newEntry = {
    id: entryCounter++,
    name: '',
    gpa: 0.0,
    credits: 2,
    su: false,
  };

  boxes[boxIndex].push(newEntry);
  renderEntries(boxIndex);
  updateGPA();
}

// Update entry data
function updateEntry(boxIndex, entryIndex, field, value) {
  // Update the entry data in boxes
  boxes[boxIndex][entryIndex][field] = value;

  // Re-render so the style changes from greyed-out to normal
  renderEntries(boxIndex);

  // Update GPA stats
  updateGPA();
}

// Toggle S/U status
function toggleSU(boxIndex, entryIndex) {
  const currentSUCount = getCurrentSUCount();
  const entry = boxes[boxIndex][entryIndex];

  if (!entry.su && currentSUCount >= 8) {
    alert('Maximum of 8 S/U modules allowed!');
    return;
  }

  entry.su = !entry.su;
  renderEntries(boxIndex);
  updateGPA();
}

// Delete entry
function deleteEntry(boxIndex, entryIndex) {
  boxes[boxIndex].splice(entryIndex, 1);
  renderEntries(boxIndex);
  updateGPA();
}

// Get current S/U count
function getCurrentSUCount() {
  let count = 0;
  boxes.forEach((box) => {
    box.forEach((entry) => {
      if (entry.su) count++;
    });
  });
  return count;
}

// Calculate and update GPA
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

  // Update display
  document.getElementById('gpaDisplay').textContent = gpa.toFixed(2);
  document.getElementById('totalCredits').textContent = totalCredits;
  document.getElementById('gradedCredits').textContent = totalGradedCredits;
  document.getElementById('suCount').textContent = suCount;

  // Show/hide S/U warning
  const warning = document.getElementById('suWarning');
  if (suCount >= 8) {
    warning.style.display = 'block';
  } else {
    warning.style.display = 'none';
  }
}

function addEntry(boxIndex) {
  const newEntry = {
    id: entryCounter++,
    name: '',
    gpa: 0.0,
    credits: 4, // Changed from 2 to 4
    su: false,
  };

  boxes[boxIndex].push(newEntry);
  renderEntries(boxIndex);
  updateGPA();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
