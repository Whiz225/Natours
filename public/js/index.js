// /* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapBox';
import { upadateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { addNewReview, addReview } from './reviews';

const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav_el--logout');
const mapBox = document.getElementById('map');
const bookbtn = document.getElementById('book-tour');
const addReviewBtn = document.querySelector('.btn--add-review');

const updateUserSettingsForm = document.querySelector('.form-user-settings');
const updateUserDataForm = document.querySelector('.form-user-data');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  // displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });

if (logoutBtn)
  logoutBtn.addEventListener('click', () => {
    logout();
  });

if (updateUserSettingsForm)
  updateUserSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;

    await upadateSettings(
      { newPassword, newPasswordConfirm, password },
      'password',
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--save--password').textContent =
      'Save password';
  });

if (updateUserDataForm)
  updateUserDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    upadateSettings(form, 'data');
  });

if (bookbtn)
  bookbtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (addReviewBtn)
  addReviewBtn.addEventListener('click', (e) => {
    const reviews = document
      .querySelector('.reviews')
      .querySelector('.reviews__card');

    const userObj = e.target.dataset;
    const user = JSON.parse(userObj.user);
    const { tourId } = userObj;

    const html = addReview(user);
    reviews.insertAdjacentHTML('beforebegin', html);

    const addBtn = document.querySelector('.btn--add');
    const closeBtn = document.querySelector('.btn--close');

    if (addBtn)
      addBtn.addEventListener('click', async (e) => {
        const myReview = document.querySelector('.reviews__text').value;
        await addNewReview(tourId, myReview);
      });
  });
