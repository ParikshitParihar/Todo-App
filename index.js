window.addEventListener('load', function() {
    const userData = localStorage.getItem('taskFlowUser');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.name && user.dateOfBirth && user.age > 10) {
            window.location.href = 'app.html';
        }
    }
});

document.getElementById('verificationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (!fullName || !dateOfBirth) {
        showError('Please fill in all fields.');
        return;
    }
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age <= 10) {
        showError('You must be over 10 years old to access TaskFlow.');
        return;
    }
    
    const userData = {
        name: fullName,
        dateOfBirth: dateOfBirth,
        age: age,
        registrationDate: new Date().toISOString()
    };
    
    localStorage.setItem('taskFlowUser', JSON.stringify(userData));
    
    showSuccess('Verification successful! Redirecting to TaskFlow...');
    submitBtn.disabled = true;
    
    setTimeout(function() {
        window.location.href = 'app.html';
    }, 2000);
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}