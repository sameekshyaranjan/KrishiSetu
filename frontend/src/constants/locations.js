/**
 * Centralized Canonical Location Constants for KrishiSetu
 * Authoritative source of truth for Karnataka Districts and APMC Market Yards.
 */

export const KARNATAKA_DISTRICTS = [
  'Bagalkote',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayapura',
  'Yadgir'
]

export const DISTRICT_APMC_MAP = {
  'Hassan': ['Hassan APMC Main Yard', 'Belur APMC Yard', 'Channarayapatna APMC Yard', 'Arsikere APMC Yard', 'Sakleshpur APMC Yard'],
  'Mandya': ['Mandya APMC Yard', 'Maddur APMC Yard', 'Pandavapura APMC Yard', 'Malavalli APMC Yard'],
  'Kolar': ['Kolar APMC Market Yard', 'Mulbagal APMC Yard', 'Srinivaspur APMC Yard', 'Bangarapet APMC Yard'],
  'Belagavi': ['Belagavi APMC Yard', 'Bailhongal APMC Yard', 'Gokak APMC Yard', 'Chikkodi APMC Yard', 'Athani APMC Yard'],
  'Mysuru': ['Mysuru Bandipalya APMC Yard', 'Nanjangud APMC Yard', 'Hunsur APMC Yard', 'T. Narasipura APMC Yard'],
  'Dharwad': ['Hubballi Amaragol APMC Yard', 'Dharwad APMC Yard', 'Kundgol APMC Yard'],
  'Davanagere': ['Davanagere APMC Yard', 'Harihar APMC Yard', 'Channagiri APMC Yard', 'Honnali APMC Yard'],
  'Ballari': ['Ballari APMC Yard', 'Hospet APMC Yard', 'Siruguppa APMC Yard', 'Kudligi APMC Yard'],
  'Kalaburagi': ['Kalaburagi APMC Yard', 'Sedam APMC Yard', 'Chittapur APMC Yard', 'Afzalpur APMC Yard'],
  'Raichur': ['Raichur APMC Yard', 'Sindhanur APMC Yard', 'Manvi APMC Yard', 'Lingasugur APMC Yard'],
  'Tumakuru': ['Tumakuru APMC Yard', 'Tiptur APMC Copra Yard', 'Sira APMC Yard', 'Madhugiri APMC Yard'],
  'Bengaluru Urban': ['Yeshwanthpur APMC Yard', 'Binny Mill Wholesale Market', 'Singena Agrahara Fruit Market'],
  'Bengaluru Rural': ['Doddaballapur APMC Yard', 'Hosakote APMC Yard', 'Nelamangala APMC Yard', 'Devanahalli APMC Yard'],
  'Shivamogga': ['Shivamogga APMC Yard', 'Bhadravathi APMC Yard', 'Sagar APMC Yard', 'Shikaripura APMC Yard'],
  'Bagalkote': ['Bagalkote APMC Yard', 'Jamkhandi APMC Yard', 'Mudhol APMC Yard', 'Badami APMC Yard'],
  'Vijayapura': ['Vijayapura APMC Yard', 'Indi APMC Yard', 'Basavana Bagewadi APMC Yard', 'Sindagi APMC Yard'],
  'Haveri': ['Ranebennur APMC Yard', 'Haveri APMC Yard', 'Byadagi Chilli APMC Yard'],
  'Gadag': ['Gadag APMC Yard', 'Nargund APMC Yard', 'Ron APMC Yard'],
  'Chikkamagaluru': ['Chikkamagaluru APMC Yard', 'Tarikere APMC Yard', 'Kadur APMC Yard', 'Mudigere APMC Yard'],
  'Chikkaballapura': ['Chikkaballapura APMC Yard', 'Chintamani APMC Yard', 'Gowribidanur APMC Yard', 'Sidlaghatta APMC Yard'],
  'Ramanagara': ['Ramanagara Silk Cocoon Market', 'Channapatna APMC Yard', 'Kanakapura APMC Yard', 'Magadi APMC Yard'],
  'Udupi': ['Udupi APMC Yard', 'Kundapura APMC Yard', 'Karkala APMC Yard'],
  'Dakshina Kannada': ['Mangaluru APMC Yard', 'Bantwal APMC Yard', 'Puttur APMC Yard', 'Belthangady APMC Yard'],
  'Uttara Kannada': ['Sirsi APMC Arecanut Yard', 'Kumta APMC Yard', 'Karwar APMC Yard', 'Yellapur APMC Yard'],
  'Chitradurga': ['Chitradurga APMC Yard', 'Challakere APMC Oilseeds Yard', 'Hiriyur APMC Yard', 'Hosadurga APMC Yard'],
  'Koppal': ['Koppal APMC Yard', 'Gangavathi Paddy APMC Yard', 'Kushtagi APMC Yard'],
  'Yadgir': ['Yadgir APMC Yard', 'Shorapur APMC Yard', 'Shahapur APMC Yard']
}

export const getApmcsForDistrict = (district) => {
  return DISTRICT_APMC_MAP[district] || [`${district} APMC Yard`]
}
