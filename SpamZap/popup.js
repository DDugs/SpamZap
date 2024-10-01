document.getElementById('save').addEventListener('click', () => {
  let sensitivity = document.getElementById('sensitivity').value;
  chrome.storage.sync.set({ sensitivity }, () => {
    console.log('Sensitivity set to', sensitivity);
  });
});
