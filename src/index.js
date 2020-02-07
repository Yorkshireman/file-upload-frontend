import { requestUploadURL, uploadFile } from './services';

const button = document.querySelector('button');
const fileValidationMessage = document.querySelector('.file-validation-message');
const form = document.querySelector('form');
const input = document.querySelector('input');
const select = document.querySelector('select');
const termsCheckbox = document.getElementById('terms-checkbox');

input.addEventListener('change', validateFormSelections);
select.addEventListener('change', validateFormSelections);
termsCheckbox.addEventListener('change', validateFormSelections);
form.onsubmit = handleSubmit;

const displayProgressMessage = (text, type) => {
  return document.getElementById('progress-message').innerHTML = `
    <p class='alert alert-${type}'>${text}</p>
  `;
};

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

function handleSubmit(e) {
  e.preventDefault();
  const file = input.files[0];

  displayProgressMessage('Uploading...', 'info');

  requestUploadURL(file.name, file.type)
    .then(response => {
      if (!response.ok) {
        return displayProgressMessage('Error uploading file', 'danger');
      }

      return response.json();
    })
    .then(({ uploadURL }) => {
      const fileReader = new FileReader();
      fileReader.addEventListener('loadend', () => {
        const body = new Blob([fileReader.result], { type: file.type });
        uploadFile(uploadURL, body)
          .then(response => {
            if (!response.ok) {
              return displayProgressMessage('Error uploading file', 'danger');
            }
          })
          .catch(e => console.log(e));
      });

      fileReader.readAsArrayBuffer(file);
    })
    .then(() => {
      const name = `${file.name.substr(0, file.name.lastIndexOf('.'))}.json`;
      requestUploadURL(name, 'application/json')
        .then(response => {
          if (!response.ok) {
            return displayProgressMessage('Error uploading file', 'danger');
          }

          return response.json();
        })
        .then(({ uploadURL }) => {
          const category = select.value;
          const body = new Blob([JSON.stringify({ category })], { type: 'application/json' });
          uploadFile(uploadURL, body)
            .then(response => {
              if (!response.ok) {
                return displayProgressMessage('Error uploading json file', 'danger');
              }

              displayProgressMessage('File successfully uploaded!', 'success');
            });
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
}
