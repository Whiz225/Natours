import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51QoTfMIvMUQMPCwoO03G8sbOdY68YNsUkzeNOGurtyLupLnO8dO3hiz4ciJWg5ai8eVBEG6K6MoFhov2mhoc0OjE00xbmVyBE8',
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `/api/v1/booking/checkout-session/${tourId}`,
      // `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`,
    );

    // console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', err.message);
  }
};
