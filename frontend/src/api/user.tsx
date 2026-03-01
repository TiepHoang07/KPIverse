import api from "./axios";

export const getMe = () => api.get("/users/me").then((res) => res.data.user);

export const changeProfile = (name: string, bio: string) =>
  api.patch("/users/profile", { name, bio }); // Added leading slash

export const changeAvatar = (formData: FormData) => 
  api.patch("/users/avatar", formData, { // Added leading slash and proper FormData
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const changePassword = (oldPassword: string, newPassword: string) => 
  api.patch("/users/password", { oldPassword, newPassword }); // Fixed parameter names