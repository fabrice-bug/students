const PRELOADED_STUDENTS = [
  { id: 'STU-1001', name: 'Alex Johnson', email: 'alex.j@university.edu', course: 'Computer Science', grade: 92, status: 'Active' },
  { id: 'STU-1002', name: 'Samantha Miller', email: 's.miller@university.edu', course: 'Business Admin', grade: 85, status: 'Active' },
  { id: 'STU-1003', name: 'David Kim', email: 'david.k@university.edu', course: 'Data Science', grade: 78, status: 'Inactive' },
  { id: 'STU-1004', name: 'Emily Davis', email: 'e.davis@university.edu', course: 'Computer Science', grade: 96, status: 'Graduated' },
  { id: 'STU-1005', name: 'Michael Brown', email: 'm.brown@university.edu', course: 'Cybersecurity', grade: 88, status: 'Active' }
];

let users = JSON.parse(localStorage.getItem('sms_users')) || [];
let students = JSON.parse(localStorage.getItem('sms_students')) || PRELOADED_STUDENTS;
let currentUser = JSON.parse(localStorage.getItem('sms_session')) || null;
let targetDeleteId = null;

if (!localStorage.getItem('sms_students')) {
  localStorage.setItem('sms_students', JSON.stringify(students));
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  routeScreen();
});

function initTheme() {
  const savedTheme = localStorage.getItem('sms_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('sms_theme', newTheme);
  updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
  const iconAuth = document.getElementById('themeIconAuth');
  const iconNav = document.getElementById('themeIconNav');
  const iconClass = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  
  if (iconAuth) iconAuth.className = iconClass;
  if (iconNav) iconNav.className = iconClass;
}

function routeScreen() {
  const regView = document.getElementById('registerView');
  const loginView = document.getElementById('loginView');
  const dashView = document.getElementById('dashboardView');
  const authThemeBtn = document.getElementById('authThemeBtn');

  regView.classList.add('hidden');
  loginView.classList.add('hidden');
  dashView.classList.add('hidden');

  if (!currentUser) {
    if (authThemeBtn) authThemeBtn.classList.remove('hidden');
    if (users.length === 0) {
      regView.classList.remove('hidden');
    } else {
      loginView.classList.remove('hidden');
    }
  } else {
    if (authThemeBtn) authThemeBtn.classList.add('hidden');
    dashView.classList.remove('hidden');
    initDashboard();
  }
}

function switchAuthView(view) {
  const regView = document.getElementById('registerView');
  const loginView = document.getElementById('loginView');
  
  if (view === 'register') {
    loginView.classList.add('hidden');
    regView.classList.remove('hidden');
  } else {
    regView.classList.add('hidden');
    loginView.classList.remove('hidden');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const role = document.getElementById('regRole').value;
  const password = document.getElementById('regPassword').value;

  if (users.some(u => u.email === email)) {
    showToast('An account with this email already exists.', 'error');
    return;
  }

  const newUser = { username, email, role, password };
  users.push(newUser);
  localStorage.setItem('sms_users', JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem('sms_session', JSON.stringify(currentUser));
  
  showToast(`Welcome, ${username}! Account created successfully.`, 'success');
  routeScreen();
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    showToast('Invalid email or password. Please check your credentials.', 'error');
    return;
  }

  currentUser = user;
  localStorage.setItem('sms_session', JSON.stringify(currentUser));
  showToast(`Welcome back, ${user.username}!`, 'success');
  routeScreen();
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('sms_session');
  showToast('Logged out successfully.', 'info');
  routeScreen();
}

function initDashboard() {
  if (!currentUser) return;
  
  document.getElementById('userNameDisplay').textContent = currentUser.username;
  document.getElementById('userRoleDisplay').textContent = currentUser.role;
  document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();

  populateCourseDropdowns();
  renderTable();
  updateStats();
}

function populateCourseDropdowns() {
  const filterCourse = document.getElementById('filterCourse');
  const currentSelected = filterCourse.value;

  const courses = [...new Set(students.map(s => s.course))].sort();

  let html = '<option value="ALL">All Courses</option>';
  courses.forEach(c => {
    html += `<option value="${c}">${c}</option>`;
  });

  filterCourse.innerHTML = html;
  filterCourse.value = courses.includes(currentSelected) ? currentSelected : 'ALL';
}

function renderTable() {
  const tbody = document.getElementById('studentTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
  const filterCourse = document.getElementById('filterCourse').value;
  const filterStatus = document.getElementById('filterStatus').value;

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery) || 
                          s.id.toLowerCase().includes(searchQuery) || 
                          s.email.toLowerCase().includes(searchQuery);
    const matchesCourse = filterCourse === 'ALL' || s.course === filterCourse;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  
  let html = '';
  filtered.forEach(s => {
    let badgeClass = 'badge-active';
    if (s.status === 'Inactive') badgeClass = 'badge-inactive';
    if (s.status === 'Graduated') badgeClass = 'badge-graduated';

    const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    html += `
      <tr>
        <td>
          <div class="student-meta">
            <div class="student-avatar">${initials}</div>
            <div>
              <div class="student-name">${s.name}</div>
              <div class="student-email">${s.email}</div>
            </div>
          </div>
        </td>
        <td><strong style="font-family: monospace; color: var(--primary);">${s.id}</strong></td>
        <td>${s.course}</td>
        <td>${s.email}</td>
        <td><span class="badge ${badgeClass}"><i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> ${s.status}</span></td>
        <td><strong>${s.grade}%</strong></td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 8px;">
            <button class="btn-icon" onclick="openStudentModal('${s.id}')" title="Edit Student">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="btn-icon" onclick="openDeleteModal('${s.id}')" title="Delete Record" style="color: var(--danger);">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  updateStats();
}

function updateStats() {
  const total = students.length;
  const active = students.filter(s => s.status === 'Active').length;
  const courses = [...new Set(students.map(s => s.course))].length;
  
  let avgGrade = 0;
  if (total > 0) {
    const sum = students.reduce((acc, curr) => acc + Number(curr.grade), 0);
    avgGrade = Math.round(sum / total);
  }

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statCourses').textContent = courses;
  document.getElementById('statAvgGrade').textContent = `${avgGrade}%`;
}

function openStudentModal(studentId = null) {
  const modal = document.getElementById('studentModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('studentForm');
  
  form.reset();
  document.getElementById('editStudentId').value = '';

  if (studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
      title.textContent = 'Edit Student Record';
      document.getElementById('editStudentId').value = student.id;
      document.getElementById('mStudentId').value = student.id;
      document.getElementById('mStudentId').disabled = true;
      document.getElementById('mName').value = student.name;
      document.getElementById('mEmail').value = student.email;
      document.getElementById('mCourse').value = student.course;
      document.getElementById('mGrade').value = student.grade;
      document.getElementById('mStatus').value = student.status;
    }
  } else {
    title.textContent = 'Add New Student';
    document.getElementById('mStudentId').disabled = false;
    document.getElementById('mStudentId').value = `STU-${1000 + students.length + 1}`;
  }

  modal.classList.remove('hidden');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.add('hidden');
}

function handleSaveStudent(e) {
  e.preventDefault();
  const editId = document.getElementById('editStudentId').value;
  const studentId = document.getElementById('mStudentId').value.trim();
  const name = document.getElementById('mName').value.trim();
  const email = document.getElementById('mEmail').value.trim();
  const course = document.getElementById('mCourse').value.trim();
  const grade = parseInt(document.getElementById('mGrade').value, 10);
  const status = document.getElementById('mStatus').value;

  if (editId) {
    const index = students.findIndex(s => s.id === editId);
    if (index !== -1) {
      students[index] = { ...students[index], name, email, course, grade, status };
      showToast(`Student record ${name} updated successfully.`, 'success');
    }
  } else {
    if (students.some(s => s.id === studentId)) {
      showToast(`Student ID ${studentId} already exists.`, 'error');
      return;
    }
    const newStudent = { id: studentId, name, email, course, grade, status };
    students.push(newStudent);
    showToast(`Student ${name} added successfully.`, 'success');
  }

  localStorage.setItem('sms_students', JSON.stringify(students));
  closeStudentModal();
  populateCourseDropdowns();
  renderTable();
}

function openDeleteModal(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  targetDeleteId = studentId;
  document.getElementById('deleteTargetName').textContent = `${student.name} (${student.id})`;
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
  targetDeleteId = null;
  document.getElementById('deleteModal').classList.add('hidden');
}

function confirmDeleteStudent() {
  if (!targetDeleteId) return;

  const student = students.find(s => s.id === targetDeleteId);
  students = students.filter(s => s.id !== targetDeleteId);
  
  localStorage.setItem('sms_students', JSON.stringify(students));
  showToast(`Student ${student ? student.name : targetDeleteId} deleted permanently.`, 'info');
  
  closeDeleteModal();
  populateCourseDropdowns();
  renderTable();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  let iconClass = 'fa-solid fa-circle-check';
  let typeClass = 'toast-success';
  
  if (type === 'error') {
    iconClass = 'fa-solid fa-triangle-exclamation';
    typeClass = 'toast-error';
  } else if (type === 'info') {
    iconClass = 'fa-solid fa-circle-info';
    typeClass = 'toast-info';
  }

  toast.className = `toast ${typeClass}`;
  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse';
    setTimeout(() => toast.remove(), 280);
  }, 3200);
}