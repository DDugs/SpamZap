document.getElementById('checkButton').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;

  document.getElementById('safeAlert').style.display = 'none';
  document.getElementById('maliciousAlert').style.display = 'none';
  document.getElementById('errorAlert').style.display = 'none';

  if (!url) {
      alert("Please enter a URL.");
      return;
  }

  try {
      const response = await fetch('http://localhost:5000/checkUrl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (data.malicious) {
          document.getElementById('maliciousAlert').style.display = 'block';
      } else {
          document.getElementById('safeAlert').style.display = 'block';
      }
  } catch (error) {
      console.error('Error:', error);
      document.getElementById('errorAlert').style.display = 'block';
  }
});
