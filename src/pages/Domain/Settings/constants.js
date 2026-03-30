// Bank constants

/**
 * Comprehensive list of Indian banks with their codes
 * Short Form Code: Used for USSD banking (*99#)
 * IFSC Prefix: First four letters of IFSC code used for fund transfers
 */
export const BANK_CODES = {
  "AIRTEL PAYMENTS BANK (ARL)": { shortCode: "ARL", ifscPrefix: "AIRP" },
  "AU SMALL FINANCE BANK (AUS)": { shortCode: "AUS", ifscPrefix: "AUBL" },
  "AXIS BANK (AXB)": { shortCode: "AXB", ifscPrefix: "UTIB" },
  "BANK OF BARODA (BOB)": { shortCode: "BOB", ifscPrefix: "BARB" },
  "BANK OF INDIA (BOI)": { shortCode: "BOI", ifscPrefix: "BKID" },
  "BANK OF MAHARASHTRA (BOM)": { shortCode: "BOM", ifscPrefix: "MAHB" },
  "CANARA BANK (CNB)": { shortCode: "CNB", ifscPrefix: "CNRB" },
  "CENTRAL BANK OF INDIA (CBI)": { shortCode: "CBI", ifscPrefix: "CBIN" },
  "CITY UNION BANK (CUB)": { shortCode: "CUB", ifscPrefix: "CIUB" },
  "CSB BANK LIMITED (CSB)": { shortCode: "CSB", ifscPrefix: "CSBK" },
  "DCB BANK LIMITED (DCB)": { shortCode: "DCB", ifscPrefix: "DCBL" },
  "DBS BANK INDIA LIMITED (DBS)": { shortCode: "DBS", ifscPrefix: "DBSS" },
  "FEDERAL BANK (FBL)": { shortCode: "FBL", ifscPrefix: "FDRL" },
  "HDFC BANK (HDF)": { shortCode: "HDF", ifscPrefix: "HDFC" },
  "HSBC BANK (HSB)": { shortCode: "HSB", ifscPrefix: "HSBC" },
  "ICICI BANK (ICI)": { shortCode: "ICI", ifscPrefix: "ICIC" },
  "IDBI BANK (IDB)": { shortCode: "IDB", ifscPrefix: "IBKL" },
  "IDFC FIRST BANK LTD (IDC)": { shortCode: "IDC", ifscPrefix: "IDFB" },
  "INDUSIND BANK LIMITED (IIB)": { shortCode: "IIB", ifscPrefix: "INDB" },
  "INDIAN BANK (INB)": { shortCode: "INB", ifscPrefix: "IDIB" },
  "INDIAN OVERSEAS BANK (IOB)": { shortCode: "IOB", ifscPrefix: "IOBA" },
  "KARUR VYSYA BANK (KVB)": { shortCode: "KVB", ifscPrefix: "KVBL" },
  "KOTAK MAHINDRA BANK LTD (KMB)": { shortCode: "KMB", ifscPrefix: "KKBK" },
  "PUNJAB NATIONAL BANK (PNB)": { shortCode: "PNB", ifscPrefix: "PUNB" },
  "STATE BANK OF INDIA (SBI)": { shortCode: "SBI", ifscPrefix: "SBIN" },
  "STANDARD CHARTERED BANK (SCB)": { shortCode: "SCB", ifscPrefix: "SCBL" },
  "THE SOUTH INDIAN BANK LIMITED (SIB)": { shortCode: "SIB", ifscPrefix: "SIBL" },
  "UCO BANK (UCO)": { shortCode: "UCO", ifscPrefix: "UCBA" },
  "UNION BANK OF INDIA (UOB)": { shortCode: "UOB", ifscPrefix: "UBIN" },
  "YES BANK LIMITED (YBS)": { shortCode: "YBS", ifscPrefix: "YESB" },
  // Additional banks
  "ABHYUDAYA CO-OPERATIVE BANK (ACB)": { shortCode: "ACB", ifscPrefix: null },
  "ANDHRA PRADESH GRAMEENA VIKAS BANK (APV)": { shortCode: "APV", ifscPrefix: null },
  "BANDHAN BANK LTD (BDN)": { shortCode: "BDN", ifscPrefix: null },
  "PAYTM PAYMENTS BANK LIMITED (PTI)": { shortCode: "PTI", ifscPrefix: null },
  "RBL BANK LIMITED (RNB)": { shortCode: "RNB", ifscPrefix: null }
};

// Helper function to get list of bank names
export const INDIAN_BANKS = Object.keys(BANK_CODES).sort();

// Helper function to get bank code by name
export const getBankShortCode = (bankName) => BANK_CODES[bankName]?.shortCode;

// Helper function to get bank IFSC prefix by name
export const getBankIfscPrefix = (bankName) => BANK_CODES[bankName]?.ifscPrefix;

// Bank Categories for reference
export const BANK_CATEGORIES = {
  PUBLIC_SECTOR: [
    "STATE BANK OF INDIA (SBI)",
    "BANK OF BARODA (BOB)",
    "BANK OF INDIA (BOI)",
    "CANARA BANK (CNB)",
    "PUNJAB NATIONAL BANK (PNB)",
    "UNION BANK OF INDIA (UOB)",
    "INDIAN BANK (INB)",
    "CENTRAL BANK OF INDIA (CBI)",
    "INDIAN OVERSEAS BANK (IOB)",
    "UCO BANK (UCO)",
    "BANK OF MAHARASHTRA (BOM)"
  ],
  PRIVATE_SECTOR: [
    "HDFC BANK (HDF)",
    "ICICI BANK (ICI)",
    "AXIS BANK (AXB)",
    "KOTAK MAHINDRA BANK LTD (KMB)",
    "INDUSIND BANK LIMITED (IIB)",
    "YES BANK LIMITED (YBS)",
    "IDFC FIRST BANK LTD (IDC)",
    "FEDERAL BANK (FBL)",
    "RBL BANK LIMITED (RNB)",
    "IDBI BANK (IDB)",
    "KARUR VYSYA BANK (KVB)"
  ],
  FOREIGN_BANKS: [
    "STANDARD CHARTERED BANK (SCB)",
    "HSBC BANK (HSB)",
    "DBS BANK INDIA LIMITED (DBS)"
  ],
  PAYMENT_BANKS: [
    "AIRTEL PAYMENTS BANK (ARL)",
    "PAYTM PAYMENTS BANK LIMITED (PTI)"
  ],
  SMALL_FINANCE_BANKS: [
    "AU SMALL FINANCE BANK (AUS)"
  ]
};

// You can add more banking related constants here 