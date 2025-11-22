

export type TUser = {
  fullName: string;
  email: string;
  password: string;
  comfirmPassword: string;
  role: "patient" | "solo_nurse" | " clinic" | "admin";
};
