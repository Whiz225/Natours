import axios from 'axios';
import { showAlert } from './alert';

export const addReview = (user) => {
  const html = `<div class="reviews__card">
          <div class="reviews__avatar">
            <img
              src="img/users/${user.photo}"
              alt=${user.name}
              class="reviews__avatar-img"
            />
            <h6 class="reviews__user">${user.name}</h6>
          </div>
          <input class="reviews__text" type="text" placeholder="Your review" required>
          <div class="reviews__rating">
            <svg class="reviews__star reviews__star--active">
              <use xlink:href="img/icons.svg#icon-star"></use>
            </svg>
            <svg class="reviews__star reviews__star--active">
              <use xlink:href="img/icons.svg#icon-star"></use>
            </svg>
            <svg class="reviews__star reviews__star--active">
              <use xlink:href="img/icons.svg#icon-star"></use>
            </svg>
            <svg class="reviews__star reviews__star--active">
              <use xlink:href="img/icons.svg#icon-star"></use>
            </svg>
            <svg class="reviews__star reviews__star--active">
              <use xlink:href="img/icons.svg#icon-star"></use>
            </svg>
          </div>
          <div class='btn button'>
          <button class='btn--green btn--small btn--add'>&#10148;</button>
          <button class='btn--green btn--small btn--close'>&times;</button>
          </div>
          </div>
        </div>`;

  return html;
};

export const addNewReview = async (tour, review) => {
  try {
    const newReview = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/reviews`,
      data: {
        tour,
        review,
      },
    });

    showAlert('success', 'Successfully updated');
    location.reload(true);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
