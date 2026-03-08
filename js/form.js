(function() {
  'use strict';

  var form = document.querySelector('.contact-form');
  if (!form) return;

  var submitBtn = form.querySelector('.form-submit');
  var statusEl = form.querySelector('.form-status');
  var fields = {
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    message: form.querySelector('#message')
  };

  // Validation
  function validateField(field) {
    var errorEl = field.parentElement.querySelector('.form-error');
    var value = field.value.trim();
    var isValid = true;
    var message = '';

    if (field.required && !value) {
      isValid = false;
      message = 'This field is required.';
    } else if (field.type === 'email' && value) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid email.';
      }
    }

    if (!isValid) {
      field.classList.add('error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }
    } else {
      field.classList.remove('error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }
    }

    return isValid;
  }

  // Live validation on blur
  Object.values(fields).forEach(function(field) {
    if (field) {
      field.addEventListener('blur', function() {
        validateField(field);
      });
      field.addEventListener('input', function() {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
    }
  });

  // Submit handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate all
    var allValid = true;
    Object.values(fields).forEach(function(field) {
      if (field && !validateField(field)) {
        allValid = false;
      }
    });

    if (!allValid) return;

    // Disable submit
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'SENDING...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    // Submit via fetch
    var formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        statusEl.textContent = 'Message sent. I\'ll be in touch.';
        statusEl.className = 'form-status success';
        form.reset();
        // Reset error states
        Object.values(fields).forEach(function(field) {
          if (field) {
            field.classList.remove('error');
            var errorEl = field.parentElement.querySelector('.form-error');
            if (errorEl) {
              errorEl.textContent = '';
              errorEl.classList.remove('visible');
            }
          }
        });
      } else {
        throw new Error(data.message || 'Form submission failed');
      }
    })
    .catch(function(err) {
      statusEl.textContent = 'Something went wrong. Try again or email directly.';
      statusEl.className = 'form-status error';
      console.error('web3forms_error:', err);
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'SEND';
    });
  });
})();
