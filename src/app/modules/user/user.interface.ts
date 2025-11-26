

export type TUser = {
  fullName: string;
  email: string;
  password: string;
  comfirmPassword: string;
  role: "patient" | "doctor" | "solo_nurse" | " clinic" | "admin";
};
