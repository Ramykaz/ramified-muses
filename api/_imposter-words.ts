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
  ['places', 'Galata Tower', 'Maiden\'s Tower (Kız Kulesi)'], ['places', 'Hagia Sophia (Ayasofya)', 'Blue Mosque (Sultanahmet Camii)'], ['places', 'Cappadocia', 'Pamukkale'],
  ['places', 'Anıtkabir', 'Topkapı Palace (Topkapı Sarayı)'], ['places', 'Taksim Square', 'Kızılay'], ['places', 'Grand Bazaar (Kapalıçarşı)', 'Spice Bazaar (Mısır Çarşısı)'],
  ['places', 'Bosphorus (Boğaz)', 'Golden Horn (Haliç)'], ['places', 'Ephesus (Efes)', 'Troy (Truva)'], ['places', 'Mount Ararat (Ağrı Dağı)', 'Uludağ'], ['places', 'Eiffel Tower', 'Big Ben'],
  ['places', 'Prince\'s Islands (Adalar)', 'Bozcaada'], ['places', 'Ölüdeniz', 'Kaputaş Beach'], ['places', 'Sümela Monastery', 'Uzungöl'],
  ['places', 'Kadıköy', 'Beşiktaş'], ['places', 'İstiklal Avenue', 'Bağdat Avenue'], ['places', 'Statue of Liberty (Özgürlük Heykeli)', 'Christ the Redeemer'],
  ['places', 'Pyramids (Piramitler)', 'Great Wall of China (Çin Seddi)'], ['places', 'Disneyland', 'Vialand'], ['places', 'airport', 'bus station (otogar)'],
  ['places', 'hospital', 'pharmacy (eczane)'], ['places', 'shopping mall (AVM)', 'bazaar'], ['places', 'library', 'bookshop (kitapçı)'], ['places', 'cinema', 'theatre'],
  // food
  ['food', 'simit', 'poğaça'], ['food', 'döner', 'iskender'], ['food', 'lahmacun', 'pide'], ['food', 'mantı', 'ravioli'],
  ['food', 'menemen', 'omelette (omlet)'], ['food', 'köfte', 'hamburger'], ['food', 'kokoreç', 'midye dolma'], ['food', 'kumpir', 'french fries (patates kızartması)'],
  ['food', 'börek', 'gözleme'], ['food', 'sarma', 'dolma'], ['food', 'mercimek çorbası', 'tarhana çorbası'], ['food', 'pizza', 'pasta'],
  ['food', 'sushi', 'noodles'], ['food', 'kebab', 'shawarma'], ['food', 'çiğ köfte', 'falafel'], ['food', 'kahvaltı', 'brunch'],
  ['food', 'beyaz peynir', 'kaşar'], ['food', 'sucuk', 'pastırma'], ['food', 'zeytin', 'domates'], ['food', 'watermelon (karpuz)', 'melon (kavun)'],
  ['food', 'banana', 'apple'], ['food', 'rice', 'bulgur'], ['food', 'egg', 'cheese'], ['food', 'tost', 'sandwich'], ['food', 'chicken', 'fish (balık)'],
  ['food', 'hamsi', 'çupra'], ['food', 'kısır', 'tabbouleh'], ['food', 'çılbır', 'scrambled eggs (çırpılmış yumurta)'],
  // drinks and sweets
  ['drinks', 'çay', 'Türk kahvesi'], ['drinks', 'ayran', 'şalgam'], ['drinks', 'boza', 'salep'], ['drinks', 'Coca-Cola', 'Pepsi'],
  ['drinks', 'lemonade (limonata)', 'orange juice'], ['drinks', 'water', 'soda'], ['drinks', 'latte', 'cappuccino'], ['drinks', 'milk', 'yoghurt (yoğurt)'],
  ['drinks', 'baklava', 'künefe'], ['drinks', 'lokum', 'helva'], ['drinks', 'sütlaç', 'kazandibi'], ['drinks', 'dondurma', 'cake'],
  ['drinks', 'chocolate', 'biscuits (bisküvi)'], ['drinks', 'aşure', 'güllaç'], ['drinks', 'pişmaniye', 'cotton candy (pamuk şeker)'], ['drinks', 'tulumba', 'lokma'],
  ['drinks', 'Ülker Çikolatalı Gofret', 'Albeni'], ['drinks', 'Nutella', 'honey (bal)'],
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
  ['football', 'Manchester United', 'Liverpool'], ['football', 'goalkeeper (kaleci)', 'defender (defans oyuncusu)'], ['football', 'red card', 'yellow card'],
  ['football', 'penalty (penaltı)', 'free kick (serbest vuruş)'], ['football', 'World Cup', 'Champions League'], ['football', 'referee (hakem)', 'coach (teknik direktör)'],
  ['football', 'stadium', 'training ground (antrenman sahası)'], ['football', 'derby', 'final'], ['football', 'VAR', 'offside (ofsayt)'],
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
  ['home', 'çaydanlık', 'cezve'], ['home', 'sofa (kanepe)', 'armchair (koltuk)'], ['home', 'fridge (buzdolabı)', 'oven (fırın)'], ['home', 'washing machine (çamaşır makinesi)', 'dishwasher (bulaşık makinesi)'],
  ['home', 'pillow (yastık)', 'blanket (battaniye)'], ['home', 'mirror (ayna)', 'window'], ['home', 'remote control (kumanda)', 'phone charger (şarj aleti)'], ['home', 'carpet (halı)', 'curtain (perde)'],
  ['home', 'toothbrush', 'hairbrush (saç fırçası)'], ['home', 'umbrella (şemsiye)', 'raincoat (yağmurluk)'], ['home', 'nazar boncuğu', 'horseshoe (at nalı)'], ['home', 'kolonya', 'perfume (parfüm)'],
  ['home', 'tespih', 'bracelet (bilezik)'], ['home', 'terlik', 'shoes'], ['home', 'soba', 'radiator (kalorifer)'], ['home', 'balcony (balkon)', 'garden'],
  // school
  ['school', 'teacher', 'principal (okul müdürü)'], ['school', 'exam', 'homework'], ['school', 'pen', 'pencil'], ['school', 'notebook', 'book'],
  ['school', 'whiteboard (tahta)', 'projector (projeksiyon)'], ['school', 'break time (teneffüs)', 'lunch time'], ['school', 'English', 'Maths'], ['school', 'university', 'high school'],
  ['school', 'YKS', 'LGS'], ['school', 'dormitory (yurt)', 'student house'], ['school', 'backpack', 'pencil case (kalemlik)'], ['school', 'canteen (kantin)', 'library'],
  ['school', 'scholarship (burs)', 'salary (maaş)'], ['school', 'graduation (mezuniyet)', 'first day'],
  // jobs
  ['jobs', 'doctor', 'nurse (hemşire)'], ['jobs', 'police officer', 'soldier (asker)'], ['jobs', 'chef', 'waiter (garson)'], ['jobs', 'pilot', 'flight attendant (hostes)'],
  ['jobs', 'engineer', 'architect (mimar)'], ['jobs', 'taxi driver', 'bus driver'], ['jobs', 'simitçi', 'street vendor (seyyar satıcı)'], ['jobs', 'barber (berber)', 'hairdresser (kuaför)'],
  ['jobs', 'farmer', 'fisherman (balıkçı)'], ['jobs', 'firefighter (itfaiyeci)', 'paramedic (sağlık görevlisi)'], ['jobs', 'lawyer (avukat)', 'judge (hakim)'], ['jobs', 'YouTuber', 'influencer'],
  ['jobs', 'dentist', 'vet (veteriner)'], ['jobs', 'kapıcı', 'security guard (güvenlik görevlisi)'], ['jobs', 'imam', 'teacher'],
  // animals
  ['animals', 'cat', 'dog'], ['animals', 'seagull (martı)', 'pigeon (güvercin)'], ['animals', 'Van cat', 'Persian cat'], ['animals', 'Kangal', 'wolf (kurt)'],
  ['animals', 'lion', 'tiger'], ['animals', 'horse', 'donkey (eşek)'], ['animals', 'cow', 'sheep (koyun)'], ['animals', 'dolphin', 'shark (köpekbalığı)'],
  ['animals', 'camel', 'giraffe (zürafa)'], ['animals', 'bee (arı)', 'butterfly (kelebek)'], ['animals', 'chicken', 'duck (ördek)'], ['animals', 'snake', 'lizard (kertenkele)'],
  ['animals', 'eagle (kartal)', 'owl (baykuş)'], ['animals', 'turtle (kaplumbağa)', 'frog (kurbağa)'], ['animals', 'monkey', 'bear (ayı)'], ['animals', 'stork (leylek)', 'flamingo'],
  // sports and games
  ['sports', 'basketball', 'volleyball'], ['sports', 'tennis', 'table tennis (masa tenisi)'], ['sports', 'swimming', 'running'], ['sports', 'boxing', 'wrestling (güreş)'],
  ['sports', 'yağlı güreş', 'judo'], ['sports', 'cirit', 'polo'], ['sports', 'tavla', 'chess'], ['sports', 'okey', 'UNO'],
  ['sports', 'PUBG', 'Fortnite'], ['sports', 'Minecraft', 'Roblox'], ['sports', 'skiing', 'snowboarding (snowboard)'], ['sports', 'cycling', 'skateboarding (kaykay)'],
  ['sports', 'gym', 'yoga'], ['sports', 'hide and seek (saklambaç)', 'tag (kovalamaca)'], ['sports', 'Olympics', 'World Cup'], ['sports', 'archery (okçuluk)', 'shooting (atıcılık)'],
  // travel
  ['travel', 'Marmaray', 'metro'], ['travel', 'ferry (vapur)', 'boat'], ['travel', 'dolmuş', 'minibus'], ['travel', 'taxi', 'bus'],
  ['travel', 'İstanbulkart', 'credit card'], ['travel', 'airplane', 'helicopter'], ['travel', 'train', 'tram (tramvay)'], ['travel', 'motorbike', 'bicycle'],
  ['travel', 'passport', 'ID card (kimlik kartı)'], ['travel', 'suitcase (bavul)', 'backpack'], ['travel', 'hotel', 'hostel (pansiyon)'], ['travel', 'camping (kamp)', 'picnic (piknik)'],
  ['travel', 'Osmangazi Bridge', 'Bosphorus Bridge'], ['travel', 'traffic jam (trafik sıkışıklığı)', 'red light (kırmızı ışık)'], ['travel', 'summer holiday', 'bayram holiday (bayram tatili)'],
  // everyday life
  ['life', 'Ramazan Bayramı', 'Kurban Bayramı'], ['life', 'iftar', 'sahur'], ['life', 'wedding', 'engagement (nişan)'], ['life', 'henna night (kına gecesi)', 'birthday party'],
  ['life', 'New Year\'s Eve (yılbaşı gecesi)', 'Christmas'], ['life', 'Republic Day (Cumhuriyet Bayramı)', 'Children\'s Day (23 Nisan)'], ['life', 'pazar (market)', 'supermarket'],
  ['life', 'çay bahçesi', 'café'], ['life', 'hamam', 'sauna'], ['life', 'mosque', 'church'], ['life', 'ezan', 'church bells (kilise çanları)'],
  ['life', 'earthquake (deprem)', 'flood (sel)'], ['life', 'snow day', 'rainy day'], ['life', 'traffic in İstanbul', 'queue at the bank (banka kuyruğu)'],
  ['life', 'evil eye (nazar)', 'black cat'], ['life', 'coffee fortune telling (kahve falı)', 'horoscope (burç yorumu)'], ['life', 'mother-in-law (kayınvalide)', 'grandmother'],
  ['life', 'neighbour (komşu)', 'cousin (kuzen)'], ['life', 'selfie', 'video call'], ['life', 'power cut (elektrik kesintisi)', 'no internet'],
]
