export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const markUp = `<div class="alert alert--${type}">${msg}</div>`;
  const el = document.querySelector('body');
  el.insertAdjacentHTML('afterbegin', markUp);

  setTimeout(hideAlert, 1500);
};
