export const FUEL_UOM_OPTIONS = [
  { value: "Ltr", label: "Liter" },
  { value: "Ml", label: "Milliliter" }
];

export const GENERAL_UOM_OPTIONS = [
  { value: "Ltr", label: "Liter" },
  { value: "Ml", label: "Milliliter" },
  { value: "Pcs", label: "Pcs" },
  { value: "Kg", label: "Kilogram" },
  { value: "G", label: "Gram" },
  { value: "M", label: "Meter" },
  { value: "Cm", label: "Centimeter" },
  { value: "Box", label: "Box" },
  { value: "Set", label: "Set" },
  { value: "Pair", label: "Pair" },
  { value: "Unit", label: "Unit" },
  { value: "Dozen", label: "Dozen" },
  { value: "Pack", label: "Pack" },
  { value: "Roll", label: "Roll" },
  { value: "Sheet", label: "Sheet" }
];
// This will be used as a helper to get UOM options based on category
export const getUOMOptionsByCategory = (category) => {
  return category === "Fuel" ? FUEL_UOM_OPTIONS : GENERAL_UOM_OPTIONS;
};

export const CATEGORY_OPTIONS = [
  { value: "Fuel", label: "Fuel" },
  { value: "Others", label: "Others" }
]; 