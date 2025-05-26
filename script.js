document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');

    // ADD REAL-TIME VALIDATION LISTENERS
    const fieldsToValidate = ['fullName', 'email', 'age', 'jobRole'];
    fieldsToValidate.forEach(id => {
        const field = document.getElementById(id);
        field.addEventListener('blur', () => { // 'blur' fires when the user leaves the field
            validateField(field);
        });
    });

// Make the submit handler ASYNC
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (validateForm()) {
            const fullName = document.getElementById('fullName').value;

            // Create the data object here, so we can use it for both functions
            const registrationData = {
                fullName: fullName,
                email: document.getElementById('email').value,
                age: document.getElementById('age').value,
                gender: document.querySelector('input[name="gender"]:checked').value,
                jobRole: document.getElementById('jobRole').value,
                company: document.getElementById('company').value,
                comments: document.getElementById('comments').value,
                registrationDate: new Date().toISOString()
            };

            // Call the localStorage function (we can keep it)
            // localStorage.setItem('summitRegistrations', JSON.stringify([...JSON.parse(localStorage.getItem('summitRegistrations') || '[]'), registrationData]));

            // AWAIT the new server function
            await sendDataToServer(registrationData);

            form.style.display = 'none';
            successMessage.innerHTML = `<p>Thank you for registering, ${fullName}! A confirmation has been sent to your email.</p>`;
            successMessage.classList.remove('hidden');
        }
    });
    // NEW FUNCTION - Phase 3: Sending data to a server
async function sendDataToServer(registrationData) {
    console.log("Sending data to server:", registrationData);

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST', // We are creating a new resource
            headers: {
                'Content-Type': 'application/json', // Telling the server we're sending JSON data
            },
            body: JSON.stringify(registrationData), // The actual data, converted to a JSON string
        });

        if (!response.ok) {
            // Handle server errors (e.g., response.status is 404 or 500)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Success! Server responded with:", responseData);
        return responseData;

    } catch (error) {
        console.error("Error sending data to server:", error);
    }
}
// NEW FUNCTION for storing data
    function storeRegistrationData() {
        // 1. Create an object with the form data
        const registrationData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            age: document.getElementById('age').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            jobRole: document.getElementById('jobRole').value,
            company: document.getElementById('company').value,
            comments: document.getElementById('comments').value,
            registrationDate: new Date().toISOString()
        };

        // 2. Get existing registrations from localStorage, or create an empty array
        let registrations = JSON.parse(localStorage.getItem('summitRegistrations')) || [];

        // 3. Add the new registration
        registrations.push(registrationData);

        // 4. Save the updated array back to localStorage
        localStorage.setItem('summitRegistrations', JSON.stringify(registrations));
    }
    // NEW FUNCTION for validating a single field
    function validateField(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        let isValid = true;
        const errorElement = document.getElementById(fieldId + 'Error');

        if (!errorElement) return true; // Exit if no error element exists

        // Clear previous error for this field
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        field.style.borderColor = '#ccc';

        if (fieldId === 'fullName' && value === '') {
            showError(fieldId + 'Error', 'Full Name is required.');
            isValid = false;
        }

        if (fieldId === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value === '') {
                showError('emailError', 'Email is required.');
                isValid = false;
            } else if (!emailPattern.test(value)) {
                showError('emailError', 'Please enter a valid email address.');
                isValid = false;
            }
        }

        if (fieldId === 'age') {
            if (value === '') {
                showError('ageError', 'Age is required.');
                isValid = false;
            } else if (parseInt(value) <= 0 || !Number.isInteger(Number(value))) {
                showError('ageError', 'Age must be a positive whole number.');
                isValid = false;
            }
        }
        
        if (fieldId === 'jobRole' && value === '') {
            showError('jobRoleError', 'Please select your job role.');
            isValid = false;
        }
        
        return isValid;
    }

    // UPDATED validateForm function
    function validateForm() {
        let isFormValid = true;
        
        fieldsToValidate.forEach(id => {
            const field = document.getElementById(id);
            if (!validateField(field)) {
                isFormValid = false;
            }
        });

        // Still validate radio and checkbox on final submit
        const genderSelected = document.querySelector('input[name="gender"]:checked');
        if (!genderSelected) {
            showError('genderError', 'Please select your gender.');
            isFormValid = false;
        } else {
            // Clear error if selected
            document.getElementById('genderError').style.display = 'none';
        }

        const terms = document.getElementById('terms');
        if (!terms.checked) {
            showError('termsError', 'You must agree to the terms and conditions.');
            isFormValid = false;
        } else {
            // Clear error if selected
            document.getElementById('termsError').style.display = 'none';
        }

        return isFormValid;
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        const inputElement = document.getElementById(elementId.replace('Error', ''));
        if (inputElement) {
             inputElement.style.borderColor = '#d9534f';
        } else if (elementId === 'genderError' || elementId === 'termsError') {
            // Special handling for fieldsets or groups if needed
            const parentGroup = errorElement.previousElementSibling;
            if(parentGroup) {
                parentGroup.style.border = '1px solid #d9534f';
                parentGroup.style.borderRadius = '4px';
                parentGroup.style.padding = '0.5rem';
            }
        }
    }
});