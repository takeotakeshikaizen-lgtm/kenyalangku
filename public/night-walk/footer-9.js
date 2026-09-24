(() => {
  const form = document.querySelector('#studio-updates');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const email = form.elements.email.value.trim();
    const subject = encodeURIComponent('KenyalangKu studio updates request');
    const body = encodeURIComponent(`Please keep ${email} informed about future KenyalangKu studio updates.`);
    document.querySelector('#studio-updates-status').textContent = 'Your email app will open with a request. Send it to complete your request.';
    window.location.href = `mailto:kenyalangku@gmail.com?subject=${subject}&body=${body}`;
  });
})();
