var apiBaseUrl = 'https://vq1ptznzf8.execute-api.us-east-1.amazonaws.com/dev';
var button = document.querySelector('button');
var fileValidationMessage = document.querySelector('.file-validation-message');
var form = document.querySelector('form');
var input = document.querySelector('input');
var select = document.querySelector('select');
var termsCheckbox = document.getElementById('terms-checkbox');

input.addEventListener('change', validateFormSelections);
select.addEventListener('change', validateFormSelections);
termsCheckbox.addEventListener('change', validateFormSelections);
form.onsubmit = handleSubmit;

function displayProgressMessage(text, type) {
  return document.getElementById('progress-message').innerHTML = `
        <p class='alert alert-${type}'>${text}</p>
      `;
}

function validateFormSelections() {
  document.getElementById('progress-message').innerHTML = '';
  if (input.files[0] && input.files[0].size > 5000000) {
    return fileValidationMessage.innerHTML = `
          <p class='alert alert-danger'>
            File size of ${input.files[0].size} bytes exceeds 5MB limit
          </p>
        `;
  }

  fileValidationMessage.innerHTML = '';
  input.files[0] && select.value && termsCheckbox.checked
    ? button.removeAttribute('disabled')
    : button.setAttribute('disabled', true);
}

function requestUploadURL(name, type) {
  return fetch(`${apiBaseUrl}/requestUploadURL`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type })
  });
}

function uploadFile(uploadURL, body) {
  return fetch(uploadURL, { method: 'PUT', body });
}

function handleSubmit(e) {
  e.preventDefault();
  var file = input.files[0];

  displayProgressMessage('Uploading...', 'info');

  requestUploadURL(file.name, file.type)
    .then(function (response) {
      if (!response.ok) {
        return displayProgressMessage('Error uploading file', 'danger');
      }

      return response.json();
    })
    .then(function (json) {
      var fileReader = new FileReader();
      fileReader.addEventListener('loadend', function () {
        var body = new Blob([fileReader.result], { type: file.type });
        uploadFile(json.uploadURL, body)
          .then(function (response) {
            if (!response.ok) {
              return displayProgressMessage('Error uploading file', 'danger');
            }
          })
          .catch(function (e) {
            console.log(e);
          });
      });

      fileReader.readAsArrayBuffer(file);
    })
    .then(function () {
      var name = `${file.name.substr(0, file.name.lastIndexOf('.'))}.json`;
      requestUploadURL(name, 'application/json')
        .then(function (response) {
          if (!response.ok) {
            return displayProgressMessage('Error uploading file', 'danger');
          }

          return response.json();
        })
        .then(function (json) {
          var category = select.value;
          var body = new Blob([JSON.stringify({ category })], { type: 'application/json' });
          uploadFile(json.uploadURL, body)
            .then(function (response) {
              if (!response.ok) {
                return displayProgressMessage('Error uploading json file', 'danger');
              }

              displayProgressMessage('File successfully uploaded!', 'success');
            });
        })
        .catch(function (e) {
          console.log(e);
        });
    })
    .catch(function (e) {
      console.log(e);
    });
};
