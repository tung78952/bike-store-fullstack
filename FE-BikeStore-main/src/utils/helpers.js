export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(number);
};

export const getErrorMessage = (error) => {
  return error?.response?.data?.detail || error?.message || "Unexpected error";
};

export const orderStatusOptions = [
  { value: 1, label: "Pending" },
  { value: 2, label: "Processing" },
  { value: 3, label: "Rejected" },
  { value: 4, label: "Completed" },
];

export const orderStatusMap = {
  1: "Pending",
  2: "Processing",
  3: "Rejected",
  4: "Completed",
};
