// Word pairs for the Imposter game (/imposter). Each round one pair is picked:
// most players get one word, the imposter gets the other, similar one.
// Files in api/ that start with _ are not routes on Vercel.
export const CATS: Record<string, string> = {
  cities: 'Cities',
  places: 'Famous places',
  food: 'Food',
  drinks: 'Drinks and sweets',
  people: 'Famous people',
  football: 'Football',
  tv: 'TV, films and music',
  brands: 'Brands and apps',
  home: 'Things at home',
  school: 'School',
  jobs: 'Jobs',
  animals: 'Animals',
  sports: 'Sports and games',
  travel: 'Travel and transport',
  life: 'Everyday life in Türkiye',
}

export const PAIRS: [string, string, string][] = [
  // cities
  ['cities', 'İstanbul', 'İzmir'], ['cities', 'Ankara', 'Eskişehir'], ['cities', 'Antalya', 'Muğla'], ['cities', 'Trabzon', 'Rize'],
  ['cities', 'Gaziantep', 'Adana'], ['cities', 'Bursa', 'Kocaeli'], ['cities', 'Konya', 'Kayseri'], ['cities', 'Diyarbakır', 'Şanlıurfa'],
  ['cities', 'Nevşehir', 'Afyon'], ['cities', 'Çanakkale', 'Edirne'], ['cities', 'Bodrum', 'Marmaris'], ['cities', 'Mardin', 'Van'],
  ['cities', 'Samsun', 'Sinop'], ['cities', 'Erzurum', 'Kars'], ['cities', 'Paris', 'London'], ['cities', 'Rome', 'Athens'],
  ['cities', 'New York', 'Los Angeles'], ['cities', 'Berlin', 'Amsterdam'], ['cities', 'Dubai', 'Doha'], ['cities', 'Tokyo', 'Seoul'],
  ['cities', 'Mecca', 'Medina'], ['cities', 'Baku', 'Tbilisi'],
  // places
  ['places', 'Galata Tower', 'Maiden\'s Tower'], ['places', 'Hagia Sophia', 'Blue Mosque'], ['places', 'Cappadocia', 'Pamukkale'],
  ['places', 'Anıtkabir', 'Topkapı Palace'], ['places', 'Taksim Square', 'Kızılay'], ['places', 'Grand Bazaar', 'Spice Bazaar'],
  ['places', 'Bosphorus', 'Golden Horn'], ['places', 'Ephesus', 'Troy'], ['places', 'Mount Ararat', 'Uludağ'], ['places', 'Eiffel Tower', 'Big Ben'],
  ['places', 'Prince\'s Islands', 'Bozcaada'], ['places', 'Ölüdeniz', 'Kaputaş Beach'], ['places', 'Sümela Monastery', 'Uzungöl'],
  ['places', 'Kadıköy', 'Beşiktaş'], ['places', 'İstiklal Avenue', 'Bağdat Avenue'], ['places', 'Statue of Liberty', 'Christ the Redeemer'],
  ['places', 'Pyramids', 'Great Wall of China'], ['places', 'Disneyland', 'Vialand'], ['places', 'airport', 'bus station'],
  ['places', 'hospital', 'pharmacy'], ['places', 'shopping mall', 'bazaar'], ['places', 'library', 'bookshop'], ['places', 'cinema', 'theatre'],
  // food
  ['food', 'simit', 'poğaça'], ['food', 'döner', 'iskender'], ['food', 'lahmacun', 'pide'], ['food', 'mantı', 'ravioli'],
  ['food', 'menemen', 'omelette'], ['food', 'köfte', 'hamburger'], ['food', 'kokoreç', 'midye dolma'], ['food', 'kumpir', 'french fries'],
  ['food', 'börek', 'gözleme'], ['food', 'sarma', 'dolma'], ['food', 'mercimek çorbası', 'tarhana çorbası'], ['food', 'pizza', 'pasta'],
  ['food', 'sushi', 'noodles'], ['food', 'kebab', 'shawarma'], ['food', 'çiğ köfte', 'falafel'], ['food', 'kahvaltı', 'brunch'],
  ['food', 'beyaz peynir', 'kaşar'], ['food', 'sucuk', 'pastırma'], ['food', 'zeytin', 'domates'], ['food', 'watermelon', 'melon'],
  ['food', 'banana', 'apple'], ['food', 'rice', 'bulgur'], ['food', 'egg', 'cheese'], ['food', 'tost', 'sandwich'], ['food', 'chicken', 'fish'],
  ['food', 'hamsi', 'çupra'], ['food', 'kısır', 'tabbouleh'], ['food', 'çılbır', 'scrambled eggs'],
  // drinks and sweets
  ['drinks', 'çay', 'Türk kahvesi'], ['drinks', 'ayran', 'şalgam'], ['drinks', 'boza', 'salep'], ['drinks', 'Coca-Cola', 'Pepsi'],
  ['drinks', 'lemonade', 'orange juice'], ['drinks', 'water', 'soda'], ['drinks', 'latte', 'cappuccino'], ['drinks', 'milk', 'yoghurt'],
  ['drinks', 'baklava', 'künefe'], ['drinks', 'lokum', 'helva'], ['drinks', 'sütlaç', 'kazandibi'], ['drinks', 'dondurma', 'cake'],
  ['drinks', 'chocolate', 'biscuits'], ['drinks', 'aşure', 'güllaç'], ['drinks', 'pişmaniye', 'cotton candy'], ['drinks', 'tulumba', 'lokma'],
  ['drinks', 'Ülker Çikolatalı Gofret', 'Albeni'], ['drinks', 'Nutella', 'honey'],
  // people
  ['people', 'Atatürk', 'İnönü'], ['people', 'Tarkan', 'Sezen Aksu'], ['people', 'Barış Manço', 'Cem Karaca'], ['people', 'Kemal Sunal', 'Şener Şen'],
  ['people', 'Cem Yılmaz', 'Ata Demirer'], ['people', 'Arda Güler', 'Kenan Yıldız'], ['people', 'Hakan Çalhanoğlu', 'Arda Turan'],
  ['people', 'Burak Özçivit', 'Kıvanç Tatlıtuğ'], ['people', 'Hande Erçel', 'Demet Özdemir'], ['people', 'Orhan Pamuk', 'Elif Şafak'],
  ['people', 'Nasreddin Hoca', 'Keloğlan'], ['people', 'Mimar Sinan', 'Fatih Sultan Mehmet'], ['people', 'Aziz Sancar', 'Cahit Arf'],
  ['people', 'Cristiano Ronaldo', 'Lionel Messi'], ['people', 'Elon Musk', 'Mark Zuckerberg'], ['people', 'Taylor Swift', 'Beyoncé'],
  ['people', 'Einstein', 'Newton'], ['people', 'Michael Jackson', 'Elvis Presley'], ['people', 'Eda Erdem', 'Ebrar Karakurt'],
  ['people', 'Mete Gazoz', 'Yusuf Dikeç'], ['people', 'Acun Ilıcalı', 'Okan Bayülgen'], ['people', 'Ajda Pekkan', 'Hadise'],
  ['people', 'Mevlana', 'Yunus Emre'], ['people', 'Messi', 'Neymar'], ['people', 'Shakira', 'Rihanna'],
  // football
  ['football', 'Galatasaray', 'Fenerbahçe'], ['football', 'Beşiktaş', 'Trabzonspor'], ['football', 'Real Madrid', 'Barcelona'],
  ['football', 'Manchester United', 'Liverpool'], ['football', 'goalkeeper', 'defender'], ['football', 'red card', 'yellow card'],
  ['football', 'penalty', 'free kick'], ['football', 'World Cup', 'Champions League'], ['football', 'referee', 'coach'],
  ['football', 'stadium', 'training ground'], ['football', 'derby', 'final'], ['football', 'VAR', 'offside'],
  // tv
  ['tv', 'Kurtlar Vadisi', 'Ezel'], ['tv', 'Muhteşem Yüzyıl', 'Diriliş Ertuğrul'], ['tv', 'Kuruluş Osman', 'Payitaht Abdülhamid'],
  ['tv', 'Avrupa Yakası', 'Yalan Dünya'], ['tv', 'Kardeş Payı', 'Leyla ile Mecnun'], ['tv', 'Recep İvedik', 'G.O.R.A.'],
  ['tv', 'Hababam Sınıfı', 'Tosun Paşa'], ['tv', 'Kim Milyoner Olmak İster?', 'Survivor'], ['tv', 'MasterChef', 'O Ses Türkiye'],
  ['tv', 'Harry Potter', 'The Lord of the Rings'], ['tv', 'Titanic', 'Avatar'], ['tv', 'Spider-Man', 'Batman'],
  ['tv', 'Squid Game', 'Money Heist'], ['tv', 'Friends', 'The Big Bang Theory'], ['tv', 'Rafadan Tayfa', 'Pepee'],
  ['tv', 'Kelebeğin Rüyası', 'Babam ve Oğlum'], ['tv', 'Netflix', 'YouTube'], ['tv', 'Eurovision', 'Oscar'],
  // brands
  ['brands', 'Instagram', 'TikTok'], ['brands', 'WhatsApp', 'Telegram'], ['brands', 'Google', 'YouTube'], ['brands', 'Trendyol', 'Hepsiburada'],
  ['brands', 'Getir', 'Yemeksepeti'], ['brands', 'BİM', 'A101'], ['brands', 'Migros', 'CarrefourSA'], ['brands', 'Türk Telekom', 'Turkcell'],
  ['brands', 'Turkish Airlines', 'Pegasus'], ['brands', 'Ülker', 'Eti'], ['brands', 'Arçelik', 'Vestel'], ['brands', 'TOGG', 'Tesla'],
  ['brands', 'Apple', 'Samsung'], ['brands', 'Nike', 'Adidas'], ['brands', 'LC Waikiki', 'DeFacto'], ['brands', 'McDonald\'s', 'Burger King'],
  ['brands', 'Starbucks', 'Kahve Dünyası'], ['brands', 'Simit Sarayı', 'Bakery'], ['brands', 'PlayStation', 'Xbox'], ['brands', 'BiTaksi', 'Uber'],
  // home
  ['home', 'çaydanlık', 'cezve'], ['home', 'sofa', 'armchair'], ['home', 'fridge', 'oven'], ['home', 'washing machine', 'dishwasher'],
  ['home', 'pillow', 'blanket'], ['home', 'mirror', 'window'], ['home', 'remote control', 'phone charger'], ['home', 'carpet', 'curtain'],
  ['home', 'toothbrush', 'hairbrush'], ['home', 'umbrella', 'raincoat'], ['home', 'nazar boncuğu', 'horseshoe'], ['home', 'kolonya', 'perfume'],
  ['home', 'tespih', 'bracelet'], ['home', 'terlik', 'shoes'], ['home', 'soba', 'radiator'], ['home', 'balcony', 'garden'],
  // school
  ['school', 'teacher', 'principal'], ['school', 'exam', 'homework'], ['school', 'pen', 'pencil'], ['school', 'notebook', 'book'],
  ['school', 'whiteboard', 'projector'], ['school', 'break time', 'lunch time'], ['school', 'English', 'Maths'], ['school', 'university', 'high school'],
  ['school', 'YKS', 'LGS'], ['school', 'dormitory', 'student house'], ['school', 'backpack', 'pencil case'], ['school', 'canteen', 'library'],
  ['school', 'scholarship', 'salary'], ['school', 'graduation', 'first day'],
  // jobs
  ['jobs', 'doctor', 'nurse'], ['jobs', 'police officer', 'soldier'], ['jobs', 'chef', 'waiter'], ['jobs', 'pilot', 'flight attendant'],
  ['jobs', 'engineer', 'architect'], ['jobs', 'taxi driver', 'bus driver'], ['jobs', 'simitçi', 'street vendor'], ['jobs', 'barber', 'hairdresser'],
  ['jobs', 'farmer', 'fisherman'], ['jobs', 'firefighter', 'paramedic'], ['jobs', 'lawyer', 'judge'], ['jobs', 'YouTuber', 'influencer'],
  ['jobs', 'dentist', 'vet'], ['jobs', 'kapıcı', 'security guard'], ['jobs', 'imam', 'teacher'],
  // animals
  ['animals', 'cat', 'dog'], ['animals', 'seagull', 'pigeon'], ['animals', 'Van cat', 'Persian cat'], ['animals', 'Kangal', 'wolf'],
  ['animals', 'lion', 'tiger'], ['animals', 'horse', 'donkey'], ['animals', 'cow', 'sheep'], ['animals', 'dolphin', 'shark'],
  ['animals', 'camel', 'giraffe'], ['animals', 'bee', 'butterfly'], ['animals', 'chicken', 'duck'], ['animals', 'snake', 'lizard'],
  ['animals', 'eagle', 'owl'], ['animals', 'turtle', 'frog'], ['animals', 'monkey', 'bear'], ['animals', 'stork', 'flamingo'],
  // sports and games
  ['sports', 'basketball', 'volleyball'], ['sports', 'tennis', 'table tennis'], ['sports', 'swimming', 'running'], ['sports', 'boxing', 'wrestling'],
  ['sports', 'yağlı güreş', 'judo'], ['sports', 'cirit', 'polo'], ['sports', 'tavla', 'chess'], ['sports', 'okey', 'UNO'],
  ['sports', 'PUBG', 'Fortnite'], ['sports', 'Minecraft', 'Roblox'], ['sports', 'skiing', 'snowboarding'], ['sports', 'cycling', 'skateboarding'],
  ['sports', 'gym', 'yoga'], ['sports', 'hide and seek', 'tag'], ['sports', 'Olympics', 'World Cup'], ['sports', 'archery', 'shooting'],
  // travel
  ['travel', 'Marmaray', 'metro'], ['travel', 'ferry', 'boat'], ['travel', 'dolmuş', 'minibus'], ['travel', 'taxi', 'bus'],
  ['travel', 'İstanbulkart', 'credit card'], ['travel', 'airplane', 'helicopter'], ['travel', 'train', 'tram'], ['travel', 'motorbike', 'bicycle'],
  ['travel', 'passport', 'ID card'], ['travel', 'suitcase', 'backpack'], ['travel', 'hotel', 'hostel'], ['travel', 'camping', 'picnic'],
  ['travel', 'Osmangazi Bridge', 'Bosphorus Bridge'], ['travel', 'traffic jam', 'red light'], ['travel', 'summer holiday', 'bayram holiday'],
  // everyday life
  ['life', 'Ramazan Bayramı', 'Kurban Bayramı'], ['life', 'iftar', 'sahur'], ['life', 'wedding', 'engagement'], ['life', 'henna night', 'birthday party'],
  ['life', 'New Year\'s Eve', 'Christmas'], ['life', 'Republic Day', 'Children\'s Day'], ['life', 'pazar (market)', 'supermarket'],
  ['life', 'çay bahçesi', 'café'], ['life', 'hamam', 'sauna'], ['life', 'mosque', 'church'], ['life', 'ezan', 'church bells'],
  ['life', 'earthquake', 'flood'], ['life', 'snow day', 'rainy day'], ['life', 'traffic in İstanbul', 'queue at the bank'],
  ['life', 'evil eye', 'black cat'], ['life', 'coffee fortune telling', 'horoscope'], ['life', 'mother-in-law', 'grandmother'],
  ['life', 'neighbour', 'cousin'], ['life', 'selfie', 'video call'], ['life', 'power cut', 'no internet'],
]
