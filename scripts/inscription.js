document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
  
    // Password strength indicator
    const passwordStrength = document.createElement('div');
    passwordStrength.classList.add('password-strength');
    passwordInput.parentNode.appendChild(passwordStrength);

    // Real-time password strength check
    passwordInput.addEventListener('input', function() {
      const password = this.value;
      const strength = checkPasswordStrength(password);
      updatePasswordStrengthIndicator(strength);
    });

    // Real-time password match check
    confirmPasswordInput.addEventListener('input', function() {
      const password = passwordInput.value;
      const confirmPassword = this.value;
      if (password !== confirmPassword) {
        showError(this, "Les mots de passe ne correspondent pas.");
      } else {
        removeError(this);
      }
    });

    function checkPasswordStrength(password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      return strength;
    }

    function updatePasswordStrengthIndicator(strength) {
      const strengthText = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
      const strengthColors = ['#dc3545', '#ffc107', '#ffa500', '#28a745', '#20c997'];
      
      passwordStrength.textContent = `Force du mot de passe: ${strengthText[strength - 1] || 'Très faible'}`;
      passwordStrength.style.color = strengthColors[strength - 1] || '#dc3545';
    }
  
    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      let isValid = true;
  
      //Clear any existing error messages
      document.querySelectorAll('.error-message').forEach(el => el.remove());
  
      //Validation functions
      function showError(field, message){
        const error = document.createElement('div');
        error.classList.add('error-message');
        error.textContent = message;
        field.parentNode.appendChild(error);
        isValid = false;
      }

      function removeError(field) {
        const error = field.parentNode.querySelector('.error-message');
        if (error) {
          error.remove();
        }
      }
  
      //Validate Nom
      const nom = document.getElementById('nom');
      if(!nom.value.trim()){
        showError(nom, "Le nom est requis.");
      }
  
      //Validate Prenom
      const prenom = document.getElementById('prenom');
      if(!prenom.value.trim()){
        showError(prenom, "Le prénom est requis.");
      }
  
      //Validate email
      const email = document.getElementById('email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
          showError(email, "Veuillez entrer une adresse email valide.");
      }
  
      //Validate Password
      if(checkPasswordStrength(passwordInput.value) < 4){
        showError(passwordInput, "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.");
      }
  
      //Validate Confirm Password
      if(passwordInput.value !== confirmPasswordInput.value){
        showError(confirmPasswordInput, "Les mots de passe ne correspondent pas.");
      }
  
      if (!isValid) {
        return;
      }

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Inscription en cours...';

      try {
        const response = await fetch('/.netlify/functions/handleSignup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom: nom.value.trim(),
            prenom: prenom.value.trim(),
            email: email.value.trim(),
            password: passwordInput.value
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Une erreur est survenue');
        }

        // Show success message with animation
        const successMessage = document.createElement('div');
        successMessage.classList.add('success-message');
        successMessage.textContent = 'Inscription réussie ! Vous allez être redirigé...';
        form.appendChild(successMessage);

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = '/test.html';
        }, 2000);

      } catch (error) {
        // Show error message with animation
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = error.message;
        form.appendChild(errorMessage);
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  });