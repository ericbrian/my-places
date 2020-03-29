const locations = [
  [
    " الخبر المملكة العربية السعودية‎",
    26.217191,
    50.197138,
    "Work",
    "<strong> الخبر المملكة العربية السعودية‎</strong><br />al-Kobar, Saudi Arabia"
  ],
  [
    "Albany, NY",
    42.651897,
    -73.755912,
    "Pleasure",
    "<strong>Albany, NY</strong>"
  ],
  [
    "Alexandria, VA",
    38.804836,
    -77.046921,
    "Home",
    "<strong>Alexandria, VA</strong>"
  ],
  [
    "Strasburg, VA",
    38.9926675, -78.3543833,
    "Pleasure",
    "<strong>Strasburg, VA</strong>"
  ],
  [
    "Altrip, Germany",
    49.431436,
    8.494974,
    "Pleasure",
    "<strong>Altrip, Germany</strong>"
  ],
  [
    "Amsterdam, Nederland",
    52.370216,
    4.895168,
    "Pleasure",
    "<strong>Amsterdam, Nederland</strong>"
  ],
  [
    "Anapolis, MD",
    38.978445,
    -76.492183,
    "Work",
    "<strong>Anapolis, MD</strong>"
  ],
  [
    "Bakersville, CA",
    35.373292,
    -119.018712,
    "Pleasure",
    "<strong>Bakersville, CA</strong>"
  ],
  [
    "Bernau am Chiemsee, Germany",
    47.811639,
    12.373964,
    "Pleasure",
    "<strong>Bernau am Chiemsee, Germany</strong>"
  ],
  [
    "Bolder, Colorado",
    40.014986,
    -105.270546,
    "Work",
    "<strong>Bolder, Colorado</strong>"
  ],
  ["Boston, MA", 42.360083, -71.05888, "Work", "<strong>Boston, MA</strong>"],
  [
    "Bruxelles, België",
    50.850346,
    4.351721,
    "Work",
    "<strong>Bruxelles, België</strong>"
  ],
  [
    "Cape Coral, FL",
    26.562854,
    -81.949533,
    "Pleasure",
    "<strong>Cape Coral, FL</strong>"
  ],
  [
    "Chicago, Illinois",
    41.878114,
    -87.629798,
    "Work",
    "<strong>Chicago, Illinois</strong>"
  ],
  [
    "Daytona Beach, FL",
    29.210815,
    -81.022833,
    "Pleasure",
    "<strong>Daytona Beach, FL</strong>"
  ],
  [
    "Denver, Colorado",
    39.739236,
    -104.990251,
    "Work",
    "<strong>Denver, Colorado</strong>"
  ],
  [
    "Duisburg, Deutschland",
    51.434408,
    6.762329,
    "Pleasure",
    "<strong>Duisburg, Deutschland</strong>"
  ],
  [
    "Essen, Deutschland",
    51.455643,
    7.011555,
    "Pleasure",
    "<strong>Essen, Deutschland</strong>"
  ],
  [
    "Frankenthal, Germany",
    49.543185,
    8.351234,
    "Pleasure",
    "<strong>Frankenthal, Germany</strong>"
  ],
  [
    "Frankfurt, Germany",
    50.110922,
    8.682127,
    "Pleasure",
    "<strong>Frankfurt, Germany</strong>"
  ],
  [
    "Haßloch, Deutschland",
    49.361015,
    8.257806,
    "Home",
    "<strong>Haßloch, Deutschland</strong>"
  ],
  [
    "Heidelberg, Germany",
    49.398752,
    8.672434,
    "Pleasure",
    "<strong>Heidelberg, Germany</strong>"
  ],
  [
    "Houston, TX",
    29.760427,
    -95.369803,
    "Pleasure",
    "<strong>Houston, TX</strong>"
  ],
  [
    "Houston, TX",
    29.760427,
    -95.369803,
    "Pleasure",
    "<strong>Houston, TX</strong>"
  ],
  [
    "Juniper, FL",
    26.934225,
    -80.094209,
    "Work",
    "<strong>Juniper, FL</strong>"
  ],
  [
    "Key West, FL",
    24.555059,
    -81.779987,
    "Pleasure",
    "<strong>Key West, FL</strong>"
  ],
  [
    "Köln, Deutschland",
    50.937531,
    6.960279,
    "Pleasure",
    "<strong>Köln, Deutschland</strong>"
  ],
  [
    "Las Vegas, NV",
    36.169941,
    -115.13983,
    "Pleasure",
    "<strong>Las Vegas, NV</strong>"
  ],
  [
    "Liege, Belgium",
    50.632557,
    5.579666,
    "Work",
    "<strong>Liege, Belgium</strong>"
  ],
  [
    "Limburgerhof, Germany",
    49.420761,
    8.390031,
    "Pleasure",
    "<strong>Limburgerhof, Germany</strong>"
  ],
  [
    "Little Rock, AR",
    34.746481,
    -92.289595,
    "Pleasure",
    "<strong>Little Rock, AR</strong><br />William J. Clinton Presidential Library and Museum"
  ],
  [
    "Lloret de Mar, Spain",
    41.700599,
    2.839819,
    "Pleasure",
    "<strong>Lloret de Mar, Spain</strong>"
  ],
  [
    "London, England",
    51.507351,
    -0.127758,
    "Pleasure",
    "<strong>London, England</strong>"
  ],
  [
    "Long Beach, California",
    33.77005,
    -118.193739,
    "Pleasure",
    "<strong>Long Beach, California</strong>"
  ],
  [
    "Ludwigshafen am Rhein, Deutschland",
    49.47741,
    8.44518,
    "Birth",
    "<strong>Ludwigshafen am Rhein, Deutschland</strong><br />Birth Place"
  ],
  [
    "Mainz, Germany",
    49.992862,
    8.247253,
    "Pleasure",
    "<strong>Mainz, Germany</strong>"
  ],
  [
    "Mannheim, Deutschland",
    49.487459,
    8.466039,
    "Home",
    "<strong>Mannheim, Deutschland</strong>"
  ],
  [
    "Metz, France",
    49.119309,
    6.175716,
    "Pleasure",
    "<strong>Metz, France</strong>"
  ],
  ["Miami, FL", 25.76168, -80.19179, "Pleasure", "<strong>Miami, FL</strong>"],
  [
    "München, Deutschland",
    48.135125,
    11.58198,
    "Home",
    "<strong>München, Deutschland</strong><br />College Home"
  ],
  [
    "Mutterstadt, Deutschland",
    49.44197,
    8.35527,
    "Home",
    "<strong>Mutterstadt, Deutschland</strong>"
  ],
  [
    "Nakskov, Danmark",
    54.833406,
    11.143724,
    "Pleasure",
    "<strong>Nakskov, Danmark</strong>"
  ],
  [
    "Nancy, France",
    48.692054,
    6.184417,
    "Pleasure",
    "<strong>Nancy, France</strong>"
  ],
  [
    "Neuhofen, Deutschland",
    49.422421,
    8.423456,
    "Home",
    "<strong>Neuhofen, Deutschland</strong>"
  ],
  [
    "New York, NY",
    40.712775,
    -74.005973,
    "Pleasure",
    "<strong>New York, NY</strong>"
  ],
  [
    "Newburgh, New York",
    41.5032087,
    -74.0392206,
    "Pleasure",
    "<strong>Newburgh, New York</strong><br />Visit Orange County Choppers showroom."
  ],
  [
    "Oklahoma City, OK",
    35.46756,
    -97.516428,
    "Pleasure",
    "<strong>Oklahoma City, OK</strong>"
  ],
  [
    "Olive Branch, MS",
    34.96176,
    -89.829532,
    "Work",
    "<strong>Olive Branch, MS</strong><br />Science Conference"
  ],
  [
    "Omaha, NE",
    41.256537,
    -95.934503,
    "Pleasure",
    "<strong>Omaha, NE</strong>"
  ],
  [
    "Orlando, FL",
    28.538336,
    -81.379236,
    "Pleasure",
    "<strong>Orlando, FL</strong>"
  ],
  [
    "Partnachklamm, Germany",
    47.468324,
    11.119327,
    "Pleasure",
    "<strong>Partnachklamm, Germany</strong>"
  ],
  [
    "Pesaro, Italy",
    43.912476,
    12.915549,
    "Pleasure",
    "<strong>Pesaro, Italy</strong>"
  ],
  [
    "Pisa, Italia",
    43.722839,
    10.401689,
    "Work",
    "<strong>Pisa, Italia</strong>"
  ],
  [
    "Riccione, Italia",
    43.992109,
    12.650329,
    "Pleasure",
    "<strong>Riccione, Italia</strong>"
  ],
  [
    "Rimini, Italia",
    44.067829,
    12.569516,
    "Pleasure",
    "<strong>Rimini, Italia</strong>"
  ],
  [
    "Rothenburg ob der Tauber, Germany",
    49.380183,
    10.186739,
    "Pleasure",
    "<strong>Rothenburg ob der Tauber, Germany</strong>"
  ],
  [
    "Rotterdam, Nederland",
    51.92442,
    4.477733,
    "Pleasure",
    "<strong>Rotterdam, Nederland</strong>"
  ],
  [
    "Saint Louis, MO",
    38.627003,
    -90.199404,
    "Pleasure",
    "<strong>Saint Louis, MO</strong>"
  ],
  [
    "Salinas, CA",
    36.677737,
    -121.655501,
    "Pleasure",
    "<strong>Salinas, CA</strong>"
  ],
  [
    "Salzburg, Österreich",
    47.80949,
    13.05501,
    "Pleasure",
    "<strong>Salzburg, Österreich</strong>"
  ],
  [
    "Salzburg, Österreich",
    47.80949,
    13.05501,
    "Pleasure",
    "<strong>Salzburg, Österreich</strong>"
  ],
  [
    "San Francisco, CA",
    37.77493,
    -122.419416,
    "Pleasure",
    "<strong>San Francisco, CA</strong>"
  ],
  [
    "San Marino",
    43.94236,
    12.457777,
    "Pleasure",
    "<strong>San Marino</strong>"
  ],
  [
    "Sanibel Island, FL",
    26.443397,
    -82.111512,
    "Pleasure",
    "<strong>Sanibel Island, FL</strong><br />J.N. 'Ding' Darling National Wildlife Refuge"
  ],
  [
    "Santa Barbara, CA",
    34.420831,
    -119.69819,
    "Pleasure",
    "<strong>Santa Barbara, CA</strong>"
  ],
  [
    "Speyer, Germany",
    49.317277,
    8.441217,
    "Pleasure",
    "<strong>Speyer, Germany</strong>"
  ],
  [
    "St. Augustine Beach, FL",
    29.843983,
    -81.271155,
    "Pleasure",
    "<strong>St. Augustine Beach, FL</strong>"
  ],
  [
    "Strasbourg, France",
    48.573405,
    7.752111,
    "Pleasure",
    "<strong>Strasbourg, France</strong>"
  ],
  [
    "Stuttgart, Germany",
    48.775846,
    9.182932,
    "Pleasure",
    "<strong>Stuttgart, Germany</strong>"
  ],
  [
    "Vancouver, Canada",
    49.282729,
    -123.120738,
    "Pleasure",
    "<strong>Vancouver, Canada</strong>"
  ],
  [
    "Venice, Italia",
    45.440847,
    12.315515,
    "Pleasure",
    "<strong>Venice, Italia</strong>"
  ],
  [
    "Ventura, CA",
    34.280492,
    -119.29452,
    "Pleasure",
    "<strong>Ventura, CA</strong>"
  ],
  [
    "Verona, Italy",
    45.438619,
    10.993313,
    "Work",
    "<strong>Verona, Italy</strong>"
  ],
  [
    "Vicenza, Italy",
    45.545479,
    11.535421,
    "Work",
    "<strong>Vicenza, Italy</strong>"
  ],
  [
    "Virginia Beach, VA",
    36.852926,
    -75.977985,
    "Home",
    "<strong>Virginia Beach, VA</strong>"
  ],
  [
    "Washington, DC",
    38.907192,
    -77.036871,
    "Pleasure",
    "<strong>Washington, DC</strong>"
  ],
  [
    "Wichita, KS",
    37.687176,
    -97.330053,
    "Home",
    "<strong>Wichita, KS</strong>"
  ],
  [
    "Wissembourg, France",
    49.036858,
    7.94454,
    "Pleasure",
    "<strong>Wissembourg, France</strong>"
  ],
  [
    "Worms, Germany",
    49.634137,
    8.350718,
    "Pleasure",
    "<strong>Worms, Germany</strong>"
  ],
  [
    "Ingolstadt Germany",
    48.76237,
    11.42523,
    "Pleasure",
    "<strong>Ingolstadt Germany</strong><br />Visit archaeological sites."
  ],
  [
    "Trier Germany",
    49.75735,
    6.63629,
    "Pleasure",
    "<strong>Trier Germany</strong><br />Visit archaeological sites."
  ],
  [
    "Andechs Germany",
    47.97487,
    11.18525,
    "Pleasure",
    "<strong>Andechs Germany</strong><br />Visit Andechs Monastery."
  ]
]