// Course data structure
let courses = [
    {
        id: 1,
        code: "NSCI 323",
        name: "Foundational Neuroscience",
        professor: "Dr. Jennifer Walsh",
        department: "NSCI",
        level: 300,
        overallDifficulty: 1.0,
        assignmentDifficulty: 1.2,
        examDifficulty: null, // No exams
        gradeDistribution: {
            "A+": 96,
            "A": 2,
            "A-": 0,
            "B+": 1,
            "B": 1,
            "B-": 0,
            "C+": 0,
            "C": 0,
            "C-": 0,
            "D+": 0,
            "D": 0,
            "F": 0
        },
        reviews: [
            {
                id: 1,
                overallDiff: 1.5,
                assignmentDiff: 1,
                examDiff: null,
                text: "Great foundational course! The active learning format really helps you understand cellular neuroscience. Professor Walsh is excellent at explaining complex concepts.",
                date: "2024-01-12"
            },
            {
                id: 2,
                overallDiff: 0.9,
                assignmentDiff: 0.7,
                examDiff: null,
                text: "Challenging but very well structured. The teamwork components are helpful and the course builds a solid foundation for advanced neuroscience courses.",
                date: "2024-01-08"
            }
        ]
    },
    {
        id: 2,
        code: "NSCI 325",
        name: "The Science of Psychedelics",
        professor: "Dr. Michael Thompson",
        department: "NSCI",
        level: 300,
        overallDifficulty: 1.3,
        assignmentDifficulty: 1.2,
        examDifficulty: null, // No exams
        gradeDistribution: {
            "A+": 96,
            "A": 2,
            "A-": 1,
            "B+": 1,
            "B": 1,
            "B-": 0,
            "C+": 0,
            "C": 0,
            "C-": 0,
            "D+": 0,
            "D": 0,
            "F": 0
        },
        reviews: [
            {
                id: 3,
                overallDiff: 1,
                assignmentDiff: 0.8,
                examDiff: null,
                text: "Fascinating course! The scientific approach to psychedelics is really eye-opening. Professor Thompson presents the material in a balanced, evidence-based way.",
                date: "2024-01-14"
            },
            {
                id: 4,
                overallDiff: 1.2,
                assignmentDiff: 1.4,
                examDiff: null,
                text: "Very interesting content about therapeutic applications. The course covers both historical context and current research. Highly recommend for anyone interested in neuroscience and mental health.",
                date: "2024-01-11"
            }
        ]
    }
];

let currentCourseId = null;

// DOM Elements
const courseGrid = document.getElementById('courseGrid');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const levelFilter = document.getElementById('levelFilter');
const uploadBtn = document.getElementById('uploadBtn');
const courseModal = document.getElementById('courseModal');
const uploadModal = document.getElementById('uploadModal');
const reviewModal = document.getElementById('reviewModal');
const uploadForm = document.getElementById('uploadForm');
const reviewForm = document.getElementById('reviewForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderCourses();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', filterCourses);
    departmentFilter.addEventListener('change', filterCourses);
    levelFilter.addEventListener('change', filterCourses);
    
    // Modal functionality
    uploadBtn.addEventListener('click', () => openModal('uploadModal'));
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Form submissions
    uploadForm.addEventListener('submit', handleCourseUpload);
    reviewForm.addEventListener('submit', handleReviewSubmit);
    
    // Add review button
    document.getElementById('addReviewBtn').addEventListener('click', () => {
        if (currentCourseId) {
            const course = courses.find(c => c.id === currentCourseId);
            if (course) {
                // Show/hide exam difficulty slider based on whether course has exams
                const examGroup = document.getElementById('examDifficultyGroup');
                if (course.examDifficulty === null) {
                    examGroup.style.display = 'none';
                } else {
                    examGroup.style.display = 'block';
                }
            }
            openModal('reviewModal');
        }
    });
}

// Render courses
function renderCourses(coursesToRender = courses) {
    if (coursesToRender.length === 0) {
        courseGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No courses found</h3>
                <p>Try adjusting your search criteria or upload a new course.</p>
            </div>
        `;
        return;
    }
    
    courseGrid.innerHTML = coursesToRender.map(course => `
        <div class="course-card" onclick="openCourseModal(${course.id})">
            <div class="course-header">
                <div class="course-code">${course.code}</div>
                <h3 class="course-title">${course.name}</h3>
                <div class="course-prof">${course.professor}</div>
            </div>
            
            <div class="course-stats">
                <div class="stat">
                    <div class="stat-label">Overall</div>
                    <div class="difficulty-bar">
                        <div class="difficulty-fill difficulty-${Math.round(course.overallDifficulty)}"></div>
                    </div>
                    <div class="difficulty-text">${getDifficultyText(course.overallDifficulty)}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Assignments</div>
                    <div class="difficulty-bar">
                        <div class="difficulty-fill difficulty-${Math.round(course.assignmentDifficulty)}"></div>
                    </div>
                    <div class="difficulty-text">${getDifficultyText(course.assignmentDifficulty)}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Exams</div>
                    <div class="difficulty-bar">
                        ${course.examDifficulty ? `<div class="difficulty-fill difficulty-${Math.round(course.examDifficulty)}"></div>` : ''}
                    </div>
                    <div class="difficulty-text">${course.examDifficulty ? getDifficultyText(course.examDifficulty) : 'N/A'}</div>
                </div>
            </div>
            
            
            <div class="review-count">${course.reviews.length} review${course.reviews.length !== 1 ? 's' : ''}</div>
        </div>
    `).join('');
}

// Filter courses
function filterCourses() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDepartment = departmentFilter.value;
    const selectedLevel = levelFilter.value;
    
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm) ||
                            course.code.toLowerCase().includes(searchTerm) ||
                            course.professor.toLowerCase().includes(searchTerm);
        
        const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
        const matchesLevel = !selectedLevel || course.level.toString().startsWith(selectedLevel);
        
        return matchesSearch && matchesDepartment && matchesLevel;
    });
    
    renderCourses(filteredCourses);
}

// Get difficulty text
function getDifficultyText(difficulty) {
    if (difficulty <= 1.5) return 'Very Easy';
    if (difficulty <= 2.5) return 'Easy';
    if (difficulty <= 3.5) return 'Moderate';
    if (difficulty <= 4.5) return 'Hard';
    return 'Very Hard';
}

// Open course modal
function openCourseModal(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    currentCourseId = courseId;
    
    // Update modal content
    document.getElementById('modalCourseTitle').textContent = course.name;
    document.getElementById('modalCourseCode').textContent = course.code;
    document.getElementById('modalCourseProf').textContent = course.professor;
    
    // Update difficulty bars
    updateDifficultyBar('overallDifficulty', course.overallDifficulty);
    updateDifficultyBar('assignmentDifficulty', course.assignmentDifficulty);
    if (course.examDifficulty) {
        updateDifficultyBar('examDifficulty', course.examDifficulty);
    } else {
        document.getElementById('examDifficulty').innerHTML = '';
    }
    
    // Update difficulty text
    document.getElementById('overallDifficultyText').textContent = getDifficultyText(course.overallDifficulty);
    document.getElementById('assignmentDifficultyText').textContent = getDifficultyText(course.assignmentDifficulty);
    document.getElementById('examDifficultyText').textContent = course.examDifficulty ? getDifficultyText(course.examDifficulty) : 'N/A';
    
    // Render grade distribution if available
    renderGradeDistribution(course.gradeDistribution);
    
    // Render reviews
    renderReviews(course.reviews);
    
    openModal('courseModal');
}

// Update difficulty bar
function updateDifficultyBar(elementId, difficulty) {
    const bar = document.getElementById(elementId);
    const roundedDifficulty = Math.round(difficulty);
    bar.className = `difficulty-fill difficulty-${roundedDifficulty}`;
}

// Render grade distribution
function renderGradeDistribution(gradeDistribution) {
    const container = document.getElementById('gradeDistribution');
    if (!container) return;
    
    if (!gradeDistribution) {
        container.innerHTML = '<p>Grade distribution not available</p>';
        return;
    }
    
    const totalStudents = Object.values(gradeDistribution).reduce((sum, count) => sum + count, 0);
    
    // Create grade curve data
    const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
    const curveData = gradeOrder.map(grade => ({
        grade,
        count: gradeDistribution[grade] || 0,
        percentage: totalStudents > 0 ? ((gradeDistribution[grade] || 0) / totalStudents) * 100 : 0
    }));
    
    // Find max count for scaling
    const maxCount = Math.max(...curveData.map(d => d.count));
    
    container.innerHTML = `
        <div class="grade-distribution">
            <h4>Grade Distribution (${totalStudents} students)</h4>
            <div class="grade-curve-container">
                <svg class="grade-curve" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    ${curveData.map((data, index) => {
                        const x = (index / (curveData.length - 1)) * 350 + 25;
                        const y = 180 - (data.count / maxCount) * 150;
                        const height = (data.count / maxCount) * 150;
                        return `
                            <rect x="${x - 12}" y="${y}" width="24" height="${height}" 
                                  fill="url(#gradeGradient)" opacity="0.8" rx="2"/>
                            <text x="${x}" y="195" text-anchor="middle" class="grade-label-svg">${data.grade}</text>
                            <text x="${x}" y="${y - 5}" text-anchor="middle" class="grade-count-svg">${data.count}</text>
                        `;
                    }).join('')}
                    <defs>
                        <linearGradient id="gradeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    `;
}

// Render reviews
function renderReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment"></i>
                <h3>No reviews yet</h3>
                <p>Be the first to share your experience with this course!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-rating">
                    ${'★'.repeat(review.overallDiff)}${'☆'.repeat(5 - review.overallDiff)}
                </div>
                <small>${new Date(review.date).toLocaleDateString()}</small>
            </div>
            <div class="review-text">${review.text}</div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #a0a0a0;">
                Assignments: ${getDifficultyText(review.assignmentDiff)} | 
                Exams: ${review.examDiff ? getDifficultyText(review.examDiff) : 'N/A'}
            </div>
        </div>
    `).join('');
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
    currentCourseId = null;
}

// Handle course upload
function handleCourseUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newCourse = {
        id: courses.length + 1,
        code: document.getElementById('courseCode').value,
        name: document.getElementById('courseName').value,
        professor: document.getElementById('professor').value,
        department: document.getElementById('department').value,
        level: parseInt(document.getElementById('courseCode').value.match(/\d+/)[0].substring(0, 1) + '00'),
        description: document.getElementById('description').value,
        overallDifficulty: 0,
        assignmentDifficulty: 0,
        examDifficulty: 0,
        reviews: []
    };
    
    courses.push(newCourse);
    renderCourses();
    closeModal();
    uploadForm.reset();
    
    showMessage('Course uploaded successfully!', 'success');
}

// Handle review submission
function handleReviewSubmit(e) {
    e.preventDefault();
    
    if (!currentCourseId) return;
    
    const course = courses.find(c => c.id === currentCourseId);
    if (!course) return;
    
    const newReview = {
        id: Date.now(),
        overallDiff: parseInt(document.getElementById('overallDiff').value),
        assignmentDiff: parseInt(document.getElementById('assignmentDiff').value),
        examDiff: course.examDifficulty ? parseInt(document.getElementById('examDiff').value) : null,
        text: document.getElementById('reviewText').value,
        date: new Date().toISOString().split('T')[0]
    };
    
    course.reviews.push(newReview);
    
    // Update course difficulty averages
    updateCourseDifficulty(course);
    
    // Refresh the course display
    renderCourses();
    
    // Update the modal if it's open
    if (courseModal.style.display === 'block') {
        openCourseModal(currentCourseId);
    }
    
    closeModal();
    reviewForm.reset();
    
    showMessage('Review submitted successfully!', 'success');
}

// Update course difficulty averages
function updateCourseDifficulty(course) {
    if (course.reviews.length === 0) return;
    
    const totalOverall = course.reviews.reduce((sum, review) => sum + review.overallDiff, 0);
    const totalAssignment = course.reviews.reduce((sum, review) => sum + review.assignmentDiff, 0);
    
    course.overallDifficulty = totalOverall / course.reviews.length;
    course.assignmentDifficulty = totalAssignment / course.reviews.length;
    
    // Only update exam difficulty if there are exams
    if (course.examDifficulty !== null) {
        const totalExam = course.reviews.reduce((sum, review) => sum + (review.examDiff || 0), 0);
        const examReviews = course.reviews.filter(review => review.examDiff !== null);
        course.examDifficulty = examReviews.length > 0 ? totalExam / examReviews.length : null;
    }
}

// Show message
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.body.insertBefore(message, document.body.firstChild);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Initialize difficulty averages for existing courses
courses.forEach(course => {
    updateCourseDifficulty(course);
});
