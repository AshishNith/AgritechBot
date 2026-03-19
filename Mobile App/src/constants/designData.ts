import { AppLanguage, ChatSummary, Product } from '../types/api';

export const designImages = {
  splashFields: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjUnU3cjNAR3ubce5eCiIJkfthR0NQd2AirWiUIVywYT1YFcKBSuVjCQUYn5WdyOAE3pA1j458VqgRyayGpUzVPsCDmjHPU3LJwQx54Otgwn8aRRE232Bxu2jPmZagxsjQYm1sp3iATWtViddJlV2ajCjUKlHYZXwGvT4Q9EHg-55WzTFqgtyj6A9G2AZIjF15zbTarsx-ET9kisW07p_djfIWYXjWlhUXF0-zF8Dyu2S1EaHxlvcklt1B98wvOQjqSYuePxGPeGO7',
  languageGlobe: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwtYwvVZ3O2L2_Cnf6gTZRIz71_WT26w4eAJ2DFLFUKL4n6mfstWP2vcW9hXCW1fg0kCPo5UUS1Caue-oyL2Il0tGju6_YMmYTw4siR-yKsX9qihzLDoLym7RS_fSt4iv2Jupwauw6OUv0fK6zvM4tl6S7Bl_iLBRfCWttBzb-X04ZBgfrhCWD1ilMH3E5VrS3reNGWabd0ybm8gJBbbC5e4WLe6tkrvR15NI80LCX6d6t3EB_fclUxGUh1NURXvHz0AK6TGbv0SMH',
  voiceIntro: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWuO54xz-8Rcdw-ciuqTC-S-tfiPYDe8RjsWm_9a7nRtaIH9o-ddropUt-fnuG3iFu3whASLqoSCOX7BflniO-nJibuo0jyP2vqD8PcW5cF7mweyy13FpaUAFpTGxf4N3WlLys9g7XpLaiIfDuJhwbFuUVWUQp3Y5VsQT653zxrih6Gi6E59uSsHQexnDHWFNFBlzgylM7UyJI18Bd3Ubo_YdZLd-xZIU_quu2rq2OFHEtWfHG0A99C80rGDxNzXo_OyKBVNfDO-91',
  cropIntro: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByZQ4I8D2yDdMEPfdR5_uiqE-gKg_XjHX9UccFwEaF1kbEEBHOo3WPNR8Vq9KD4imX9WNwUAZDGA5BMW9nB9Yuxa2BniJ9ABVtzHrPlmIb69x2KY_sqJLAeJbdDntrxPxNKYN2uV4VBoUixutPXMPQamfaX_ZmyfadEnIYm_X7MM4UzYha76q1vSQ4HOZm-TL0xMAjrS-O1hL_UUdM6R8iJ7Ttna_IC4pQ7HRICuFDZH2BhiHfFwhgNiDxDlEc9rg9dIus7kt7-2tg',
  scannerLeaf: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYuHvFP5X--XncNQ2tPwsAt9NDJJe9ckHrTGptrWRYG_r11eobz6nLaZoJZHhqX0XXfbgVeoclMIuZDPWyXi-T8H1mT9nr_Hwp6IW20qHbzU-g6_9bC2-y_th-81BNonY__jKoUScU_0CXRiQcKWVEJXBn0szepZvUycMehJ5CjwBMH5cDTQvqqiN9VUmGPNQM7E4jd-s521SLG8hZY1p5rqsNU_vGQMMyghHL1YuFrkaN6PazQOpKr6yCrcDPSgaqC-xVmF1uD2zI',
  profileMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV2P9yLxFzHr_moAxsUnb1iqqbIt0kxCvAb5QO3ldKpCE2nNW-GMoppRGzfYNwoHu4pEHVxjczO5mhEWc-SUeA4_eOgkwJ3gYjWr6z5Py6dxC9LJP4IQO9PmoqZEJHDq250q7IPRsPpFhoEBf7BMHGbsE8yZP8U1tnGkyXxdQWxpdPWAFJamPSD10eSz-0CQFOVxZ9f6EoWSCA0teKuFV2jHH5lglbrEn4pt3SSmSQiDlVJcZKayI2lpTFN30sirdnwvPy_WabLnj5',
  premiumHero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATcwxTwEo0b6Fgw91rcCxfmGGT0XBkfxiki7qVAc5jTuhpppiFKlp-dwsAJ8gW-0FwIQLM6BtYB0d5rDIXiRJANqEZkBaaRydZlVM-Idn93oOJQNNsz2DdzQ6w_FCkV2bbRWhTHmsTZWRKn5_KedjDtaVJHgDyjqjS6gy5BnBegaGeEfwvnZrWWxiCfD0VDITpUA0vgRozkMFRT9BZfabSoyRBuUkLHZQuK7yWdUdB3Ykk8Up3g9Bgkl0w5kff1d_qNLZQrXZuqC7e',
  productHero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgaMhDOMWbkUgMd3_Y8lbz_n2tbIFBQJoVZetPo2ZO6MNiivTzXd2lJ8zejVuAnAw2qbkC9gvJGjtuL2oJhq52YLkdc8DvXV7zMe-fe4WOZ61jE7frROJ9UlkT_RDMfGQyyj4bA9vjarLWjRmNPs-3_p0piH7SiMJDOci-w8pdY6hyq6FnqXwWOmasy9YHTndJNS8V6R9XALzdOcmi_e4_4BcqcxWVkQs2GdzkflvexkI5mToPpRqr8Zpa0VtP08wTnpXtbbkgCEuC',
  chatAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXptuQwHjKlOe8UEht3fHYOoXLXWDoKvkklVevI36D3_ghiSDPDeInArPAeZq8sFJi4wYNHtqpWLL921I4KQjjz738G2XmPKZ65DQsZhLxAiBPXgK3O74AEpvim4XlPYg8UXojwoRE-KjhPmjHZDnY0HOBYNJ8vF2emD9AGqgXVQl4ePNfIC3KubU63Ou6W9VD21330cJ_QVAx1Xaj8quqONONgMPkgE0FBTfIeP58yPxK_s1CTKhLDi6Qea3KKpCZo4h6Z-l5Efkj',
  profilePortrait: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9HGtxMC7i65yRlC4d245jYBlOQ2HYALjBlWIFKxfm8nUaWkW0OCbzBfiyYA2YOo9KX-TMPIlGycrVcvvue1L53PIAgbpV3lcNcalwLt8JCAOEhJKkGDflqud_uTavN7eRnlCGmDj5C4rCePRohC_fhMC1eVnNpx6NdNffp3vHyXRJ60wPdu1xNloicBHe5J0mQ-5fgrjG2EUleo3FNhW0uW4xuGPlOawk-NYKC9kXD0jM5OC8potifrpQSgVHNPxDzlmhBsvNVYaK',
  historyWheat: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlm5lBo8zqdFANpZ3eB9SyNJFA8Po19mLXr8axUpE1D2peEJWcdm7n6D3ECYlhazZTNGgv3EUaAjIVR-bpatD8VGLVKiaOStgR0OTtX0LyuImP3pQxBZ2d9fApkZFXUpTIBKGnwpay-0h_8g0HQCQsHubUQW8WRYRu8FuDp3Zi8HHG5SU0Zljbuf4SFIxMV2xr9LqfKw-NKW6XeYmgRcNTs47MRJX1SYIGvWNxFFcr_quKE5fyIxk8BbMYydlFLhpCjlji5jv3G13-',
  historyTomato: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMPPCoQ_1WFQnQI1_XJx1mrDUp88Nl_h8Ywo0GkHwkNFKJUlI16ZO1WEXiuu3OkVWzrDQXMeT_p5cNeiAU-TpTdx7juche2oFxRxULWaa0d5_-NTeqzgXWQbXS8yR3kLEQq3vdjdiRtW_V7v91SIsJuSUTTuPlxAMrkrJFt-jEkUZota8qOLEODjP9inzcqDUWkhpkVjY4-Wu0R1we10VOwQhfSAfCUakuAAxkA92MbgfK0Zfh6aoKUO8BPMKqO5ynUPf_C7alZLUj'
};

export const languageOptions: AppLanguage[] = ['English', 'Hindi', 'Gujarati', 'Punjabi'];

export const quickChips = ['Weather', 'Crop Prices', 'Fertilizer Info'];

export const marketplaceFallback: Product[] = [
  {
    id: 'p1',
    name: 'Premium Urea',
    description: 'Balanced nitrogen support for rapid crop growth.',
    category: 'Fertilizers',
    price: 1250,
    unit: '50 KG',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAEUyL3aK_JM-eGAo9oErHtdm8VWRMZHfANcj7R4YwE1P4yeiv00Eb9G5cn5vy0fNr0Q-wT8lPJz31DgX0gYr6ZZYa_a-6PneE1QWvCwba2URWOIP6pXQJLyl8yJ8w6AbYNHdWM1D6uqERlyLEWtBfV5wPs97IaiQV3NVs01heYRK8Kuf4wyRCiJn_Zse4uXytPwg8gLnroU3rQrGzr3LeDPcqIhAdgLDXdJyrDUCIHsuHhBYKpef4gsJ4bj0yv79F_EMe2ERAsn8sn'],
    seller: { name: 'GreenFields Co-op', phone: '+919800000001', location: 'Punjab' },
    inStock: true,
    quantity: 18,
  },
  {
    id: 'p2',
    name: 'Potash Liquid',
    description: 'Improves root strength and drought resilience.',
    category: 'Fertilizers',
    price: 890,
    unit: '5L',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBS2oFdyDf9ReOVcOxpVsBuObZxuk50z1oTqTAP2vjbAkmvUPiCA4cTJrEMGOCx5PuGWxzMJk8hLnY8RIG_-yguKO1IOKVVD7aIC4l7dX-vfdHK1mGKEo2qxbymV2qx9XWEnyjRFA0P-EL2TeB7gSUlXE_NY-Zs9D9_baDW5NHkGNI6aIGWIwl9hXaSvoIWbpw8voABBuRFZHOEfCxQVTLs-r3n-MaBsPE3HEtIihcwqP36fZfRpjPdHrcJH4m3fKHewfres0GLhD7d'],
    seller: { name: 'AgriFlow', phone: '+919800000002', location: 'Gujarat' },
    inStock: true,
    quantity: 24,
  },
  {
    id: 'p3',
    name: 'Organic DAP',
    description: 'Organic nutrient blend for sustainable soil health.',
    category: 'Fertilizers',
    price: 1500,
    unit: '25 KG',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCJ3jetAcB3PYvV4AaEcY97R7yBPVFXTophDAgnMf14uMtp-Tacp7i92OnoruOZBk7ZVXz3EW8D0dObPnm-vBwlvQGwpz2wcBOAQfFBQvX9XvWsFFVbVTjausA178f8nxARk7rQxVVbjNDe-xWp4kBgfVfjGHvHExD1daRsogtxo4D7a3y6m_6Xu1sJAp-sfgRw-wuTTvUbM-1hJ6G3qbEj1oK4XhtFbwLIKkC-JPlq1ZVRU-KS9i0CGAFwDHVMvMEU-I_6qOqY3gn6'],
    seller: { name: 'SoilPlus', phone: '+919800000003', location: 'Haryana' },
    inStock: true,
    quantity: 12,
  },
  {
    id: 'p4',
    name: 'Wheat Seeds',
    description: 'Golden wheat seeds optimized for higher yield.',
    category: 'Seeds',
    price: 450,
    unit: 'kg',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCFPlm-7Ic7beeIPmaDuuSzV59W4uj6PA9cu_PVpgjaWeVJuY7CndL1Gir-3-3JquHtBoGPXYq1q0l-qWbD2CLyhW2fqDbZFRBIm-_jhVB3lBm9ZU23TK7kEVYxJSqgZr1p26WUou50Donn7lSbyCXnKEw9sWT4u5ISR-BY4ca0i2lnW7hALns7QTj0WFQSHXI3a0_X0G1-1kSs2KxSMfWxGHzVv1ObXhN70y3NDKExbWdctdfJL7L9RKJEdxg8wEemecTex8KICXnD'],
    seller: { name: 'Punjab Seeds', phone: '+919800000004', location: 'Punjab' },
    inStock: true,
    quantity: 50,
  },
  {
    id: 'p5',
    name: 'Cotton Seeds',
    description: 'BT Cotton Gold pack for strong fiber quality.',
    category: 'Seeds',
    price: 720,
    unit: 'packet',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC8ZDVWJCT4JCkKfO_h_vTpEfiuHJQfVFT3w12ItoXYQ2rCT1IG40ygyzc6T9HCPaV7I6oQdhjcE8TOFynFxw2ok5VEoiszqXrbr7FgSsLXzK3oBZZwoqG_13CHTM_gYEKwU1_UZvamFMeeJGTBvEhO48Xzis_FgqdOBzpCOWEm-9ETIExI8iZhOPWuVXCS3V1k3CiNdnxR4ikpgs1VAl0qHN5MgwKOuv9QjBsWB4Lw-1yv9Gsa_ckFhCtBNDFh_0pRC-hsB21rAvCV'],
    seller: { name: 'Cotton Gold', phone: '+919800000005', location: 'Rajasthan' },
    inStock: true,
    quantity: 30,
  },
  {
    id: 'p6',
    name: 'Paddy Seeds',
    description: 'Basmati Special pack with aromatic grain selection.',
    category: 'Seeds',
    price: 580,
    unit: 'kg',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuApQLXFGzHO3fmtw5MW9x6CHn7CuUJ6A2fQXHezsBhXIIRlFFidA3SkxynDkytL5n_jD4ErIkVD4iA_aojjgc8RuUFNSzt--xTu2Ei2vG36qZvLTd0WGVwKN4qAgF6mB8CiDH4nqj2Leyn3r1HsgOomX590Uz24xyd8l_p5ie8rOhqewjTI6tFDqLbyXGGNnjIvIrDVgzOFSw1OT2OJyzRaD9le7_Ps66TejoJ8BqrxDgUAcqjbR4ic2faEPYy9LYOQBk7fCDXC6bVI'],
    seller: { name: 'Rice Valley', phone: '+919800000006', location: 'Punjab' },
    inStock: true,
    quantity: 32,
  },
  {
    id: 'p7',
    name: 'Digital Soil Meter',
    description: 'Handheld soil testing tool for moisture and pH insights.',
    category: 'Tools',
    price: 2499,
    unit: 'piece',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDCwMfVC65_cV2VqJQnJfyI8mvcLkqD_mOzbQ-GhjffsuKJjOmuvkyEcnW1cL4qWPi1sGX9EBZzCmFbMz7iKIn1p7nV2ZvQHeeeCCEZP7PDfD4SIrJAi_vZR03rEcfNpTm23gMs2kFDkYZlLWWvGtgll2QZ05133rBf3Bh0kv2TFeQwX3T0RgCwuoa-yZd7-VlI-pnemH2cuJ4HAmRJgDG7F-BhUnN3RYPyF5eOD0-auTjEeLo2RtUvI47qz-IVpwIgKG8fVbCNCstg'],
    seller: { name: 'Field Metrics', phone: '+919800000007', location: 'Delhi' },
    inStock: true,
    quantity: 8,
  },
  {
    id: 'p8',
    name: 'Manual Sprayer',
    description: 'Professional sprayer for focused field treatment.',
    category: 'Tools',
    price: 1850,
    unit: 'piece',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuByhhMA-JUUNRMXXJY72eoNudZp8tMrHfUxrnOVIbC7ZB8-D9TSlszXd1fCEWcmAfxqm0GZcD58ysG8OBZ6jL3tap7tU9j95voHj-AC8gMBwd-g-jqw8Lfji3fexi4CU-yOgnwFmdCed_9ygq9biE-zHeMTNyk8Lxn4YUtJpp0dcrpqwAA1rZoyHrjtj_B7fTKbO7iCc8JvNIrSk0tRL4j8fR_yqy6K2SGom7u1xPS7qIm-_B7VatVs9mUlNtmlXyGrac_xsk2vzzQx'],
    seller: { name: 'Agro Gear', phone: '+919800000008', location: 'Madhya Pradesh' },
    inStock: true,
    quantity: 10,
  },
];

export const fallbackHistory: ChatSummary[] = [
  { id: 'h1', title: 'Yellow Rust (Puccinia)', language: 'Wheat', messageCount: 12, updatedAt: new Date().toISOString() },
  { id: 'h2', title: 'Healthy Crop', language: 'Tomato', messageCount: 5, updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: 'h3', title: 'Leaf Blast', language: 'Rice', messageCount: 7, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString() },
  { id: 'h4', title: 'Nutrient Deficiency', language: 'Wheat', messageCount: 6, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
];

export const homeWeatherCard = {
  temperature: '28°C',
  condition: 'Partly Cloudy',
  moisture: '64%',
  station: 'Station A-12 • Active',
};

export const sampleAddress = {
  line1: 'Village Road 18',
  city: 'Bathinda',
  state: 'Punjab',
  pincode: '151001',
};
