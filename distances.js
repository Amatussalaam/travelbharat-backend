const states = [
    "Telangana", "Delhi", "Maharashtra", "Goa", "Kerala",
    "Tamil nadu", "Assam", "Sikkim", "Punjab",
    "Rajasthan", "Uttarakhand", "Himachal pradesh"
];

// 🔥 NORMALIZED DISTANCE MAP (ALL KEYS SAFE + CONSISTENT)
const distances = {

    // ================= TELANGANA =================
    "telangana-himachal pradesh": 1926,
    "telangana-sikkim": 1840,
    "telangana-assam": 2050,
    "telangana-tamil nadu": 625,
    "telangana-maharashtra": 710,
    "telangana-delhi": 1560,
    "telangana-punjab": 1810,
    "telangana-uttarakhand": 1720,
    "telangana-rajasthan": 1380,
    "telangana-goa": 650,
    "telangana-kerala": 880,

    // ================= TAMIL NADU =================
    "tamil nadu-himachal pradesh": 2560,
    "tamil nadu-sikkim": 1914,
    "tamil nadu-assam": 1938,
    "tamil nadu-maharashtra": 1334,
    "tamil nadu-delhi": 1755,
    "tamil nadu-punjab": 1978,
    "tamil nadu-uttarakhand": 1915,
    "tamil nadu-rajasthan": 1593,
    "tamil nadu-goa": 699,
    "tamil nadu-kerala": 546,
    "tamil nadu-telangana": 625,

    // ================= ASSAM =================
    "assam-himachal pradesh": 2130,
    "assam-sikkim": 274,
    "assam-tamil nadu": 1938,
    "assam-maharashtra": 2811,
    "assam-delhi": 1457,
    "assam-punjab": 1581,
    "assam-uttarakhand": 1359,
    "assam-rajasthan": 1684,
    "assam-goa": 2262,
    "assam-kerala": 2206,
    "assam-telangana": 2050,

    // ================= SIKKIM =================
    "sikkim-himachal pradesh": 1744,
    "sikkim-assam": 274,
    "sikkim-tamil nadu": 1941,
    "sikkim-maharashtra": 2350,
    "sikkim-delhi": 1196,
    "sikkim-punjab": 1246,
    "sikkim-uttarakhand": 1059,
    "sikkim-rajasthan": 1408,
    "sikkim-goa": 2110,
    "sikkim-kerala": 2184,
    "sikkim-telangana": 1840,

    // ================= DELHI =================
    "delhi-himachal pradesh": 345,
    "delhi-sikkim": 1196,
    "delhi-assam": 1457,
    "delhi-tamil nadu": 1755,
    "delhi-maharashtra": 1415,
    "delhi-punjab": 379,
    "delhi-uttarakhand": 226,
    "delhi-rajasthan": 249,
    "delhi-goa": 1422,
    "delhi-kerala": 2154,
    "delhi-telangana": 1560,

    // ================= MAHARASHTRA =================
    "maharashtra-himachal pradesh": 1764,
    "maharashtra-sikkim": 2350,
    "maharashtra-assam": 2811,
    "maharashtra-tamil nadu": 1334,
    "maharashtra-delhi": 1415,
    "maharashtra-punjab": 1650,
    "maharashtra-uttarakhand": 1590,
    "maharashtra-rajasthan": 1150,
    "maharashtra-goa": 590,
    "maharashtra-kerala": 1250,
    "maharashtra-telangana": 710,

    // ================= RAJASTHAN =================
    "rajasthan-himachal pradesh": 780,
    "rajasthan-sikkim": 1408,
    "rajasthan-assam": 1684,
    "rajasthan-tamil nadu": 1593,
    "rajasthan-maharashtra": 1150,
    "rajasthan-delhi": 249,
    "rajasthan-punjab": 479,
    "rajasthan-uttarakhand": 565,
    "rajasthan-goa": 1216,
    "rajasthan-kerala": 1712,
    "rajasthan-telangana": 1380,

    // ================= PUNJAB =================
    "punjab-himachal pradesh": 215,
    "punjab-sikkim": 1246,
    "punjab-assam": 1581,
    "punjab-tamil nadu": 1978,
    "punjab-maharashtra": 1650,
    "punjab-delhi": 379,
    "punjab-uttarakhand": 318,
    "punjab-rajasthan": 479,
    "punjab-goa": 1648,
    "punjab-kerala": 2332,
    "punjab-telangana": 1810,

    // ================= UTTARAKHAND =================
    "uttarakhand-himachal pradesh": 260,
    "uttarakhand-sikkim": 1059,
    "uttarakhand-assam": 1359,
    "uttarakhand-tamil nadu": 1915,
    "uttarakhand-maharashtra": 1590,
    "uttarakhand-delhi": 226,
    "uttarakhand-punjab": 318,
    "uttarakhand-rajasthan": 565,
    "uttarakhand-goa": 1533,
    "uttarakhand-kerala": 2194,
    "uttarakhand-telangana": 1720,

    // ================= GOA =================
    "goa-himachal pradesh": 2210,
    "goa-sikkim": 2110,
    "goa-assam": 2262,
    "goa-tamil nadu": 699,
    "goa-maharashtra": 590,
    "goa-delhi": 1422,
    "goa-punjab": 1648,
    "goa-uttarakhand": 1533,
    "goa-rajasthan": 1216,
    "goa-kerala": 647,
    "goa-telangana": 650,

    // ================= KERALA =================
    "kerala-himachal pradesh": 2930,
    "kerala-sikkim": 2184,
    "kerala-assam": 2206,
    "kerala-tamil nadu": 546,
    "kerala-maharashtra": 1250,
    "kerala-delhi": 2154,
    "kerala-punjab": 2332,
    "kerala-uttarakhand": 2194,
    "kerala-rajasthan": 1712,
    "kerala-goa": 647,
    "kerala-telangana": 880,

    // ================= HIMACHAL PRADESH =================
    "himachal pradesh-sikkim": 1744,
    "himachal pradesh-assam": 2130,
    "himachal pradesh-tamil nadu": 2560,
    "himachal pradesh-maharashtra": 1764,
    "himachal pradesh-delhi": 345,
    "himachal pradesh-punjab": 215,
    "himachal pradesh-uttarakhand": 260,
    "himachal pradesh-rajasthan": 780,
    "himachal pradesh-goa": 2210,
    "himachal pradesh-kerala": 2930,
    "himachal pradesh-telangana": 1926
};

module.exports = distances;