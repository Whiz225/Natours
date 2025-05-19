import axios from 'axios';
import { showAlert } from './alert';

export const upadateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? `/api/v1/user/updatepassword`
        : // ? `http://127.0.0.1:3000/api/v1/user/updatepassword`
          `/api/v1/user/updateMyData`;
    // : `http://127.0.0.1:3000/api/v1/user/updateMyData`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    showAlert('success', `${type.toUpperCase()} updated successfully!`);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// export const upadateUserData = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: `http://127.0.0.1:3000/api/v1/user/updateMyData`,
//       data: {
//         name,
//         email,
//       },
//     });
//     showAlert('success', `${type.toUpperCase()} updated successfully!`);

//     // if (res.data.status === 'success') location.assign('/me');
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//     console.log(err.response.data.message);
//   }
// };
