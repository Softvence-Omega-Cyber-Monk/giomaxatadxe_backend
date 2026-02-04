export const getAppointmentDateTime = (date: Date, time: string) => {
  // time example: "10:00 AM"
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const appointmentDateTime = new Date(date);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  return appointmentDateTime;
};