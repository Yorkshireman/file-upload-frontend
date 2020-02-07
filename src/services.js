const apiBaseUrl = 'https://vq1ptznzf8.execute-api.us-east-1.amazonaws.com/dev';

const requestUploadURL = (name, type) => {
  return fetch(`${apiBaseUrl}/requestUploadURL`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type })
  });
};

const uploadFile = (uploadURL, body) => fetch(uploadURL, { method: 'PUT', body });

export { requestUploadURL, uploadFile };
