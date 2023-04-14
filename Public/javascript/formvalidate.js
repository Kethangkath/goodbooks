(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')
  
    // Loop over them and prevent submission
    Array.from(forms)
    .forEach(function(form) {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
        const formFields = form.querySelectorAll('input, select, textarea')
        formFields.forEach(field => {
            if (!field.validity.valid) {
                field.setCustomValidity('') // reset any custom messages
                if (field.value === '') {
                    field.setCustomValidity('This field is require')
                }
            }
        })
    }, false)
})
})()

