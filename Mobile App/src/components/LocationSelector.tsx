import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { getCurrentLocation, LocationResult } from '../api/locationService';
import { AppText } from './ui';
import { theme } from '../constants/theme';
import { useTheme } from '../providers/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onSelect: (location: LocationResult) => void;
  onCancel?: () => void;
}

// Indian states and major agricultural districts fallback
const INDIAN_LOCATIONS: Record<string, string[]> = {
  'Andaman and Nicobar (UT)': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Kadapa', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Vishakhapatnam', 'Vizianagaram', 'West Godavari'],
  'Arunachal Pradesh': ['Anjaw', 'Changlang', 'East Kameng', 'East Siang', 'Kurung Kumey', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Subansiri', 'Papum Pare', 'Tawang', 'Tirap', 'Upper Dibang Valley', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
  'Assam': ['Baksa', 'Barpeta', 'Bongaigaon', 'Cachar', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Morigaon', 'Nagaon', 'Nalbari'],
  'Bihar': ['Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
  'Chandigarh (UT)': ['Chandigarh'],
  'Chhattisgarh': ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur'],
  'Gujarat': ['Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  'Haryana': ['Ambala', 'Bhiwani', 'Faridabad', 'Fatehabad', 'Gurgaon', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Mewat', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamuna Nagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
  'Jammu and Kashmir': ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kargil', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Leh', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'],
  'Jharkhand': ['Bokaro', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj', 'Saraikela Kharsawan', 'Simdega', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Bangalore Rural', 'Bangalore Urban', 'Belgaum', 'Bellary', 'Bidar', 'Bijapur', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Gulbarga', 'Hassan', 'Haveri', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysore', 'Raichur', 'Ramanagara', 'Shimoga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Lakshadweep (UT)': ['Lakshadweep'],
  'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa (East Nimar)', 'Khargone (West Nimar)', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Senapati', 'Tamenglong', 'Thoubal', 'Ukhrul'],
  'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
  'Mizoram': ['Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Serchhip'],
  'Nagaland': ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  'National Capital Territory of Delhi (UT)': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
  'Odisha': ['Anugul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Debagarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghapur', 'Jajapur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'],
  'Puducherry (UT)': ['Karaikal', 'Mahe', 'Pondicherry', 'Yanam'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Shahid Bhagat Singh Nagar', 'Shri Muktsar Sahib', 'Tarn Taran'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalor', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
  'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  'Tamil Nadu': ['Ariyalur', 'Chennai', 'Pudukkottai', 'Ramanathapuram', 'Salem', 'Sivaganga', 'Thanjavur', 'The Nilgiris', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Villupuram', 'Virudhunagar'],
  'Telangana': ['Adilabad', 'Hyderabad', 'Jagtial', 'Karimnagar', 'Khammam', 'Mahabubnagar', 'Mancherial', 'Medak', 'Nalgonda', 'Nizamabad', 'Rangareddy', 'Suryapet', 'Wanaparthi', 'Warangal'],
  'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh', 'Badaun', 'Bagpat', 'Bahraich', 'Balarampur', 'Ballia', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bijnor', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Sant Ravidas Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
  'West Bengal': ['Alipurduar', 'Bankura', 'Bardhaman', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Medinipur', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'],
};

export function LocationSelector({ onSelect, onCancel }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleAutoLocation = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      setLoading(false);

      Alert.alert(
        "Confirm Location",
        `${location.city}, ${location.state}`,
        [
          {
            text: "Confirm",
            onPress: () => onSelect(location),
            style: 'default',
          },
          { text: "Cancel", style: 'cancel' },
        ]
      );
    } catch (err: any) {
      setLoading(false);
      const message = err.message === 'Location permission denied' 
        ? "Please enable location permissions in your settings."
        : "Unable to fetch location automatically. Please search manually.";
      Alert.alert("Location Error", message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="heading" style={[{ fontSize: 24 }, { color: colors.text }]}>Select Location</AppText>
        {onCancel && (
          <Pressable onPress={onCancel}>
            <AppText color={colors.primary}>Close</AppText>
          </Pressable>
        )}
      </View>

      <AppText color={colors.textMuted} style={{ marginBottom: 20 }}>
        Help us personalize your agricultural advice based on your region.
      </AppText>

      {/* Auto Location Button */}
      <Pressable 
        onPress={handleAutoLocation} 
        disabled={loading}
        style={({ pressed }) => [
          styles.autoButton,
          pressed && { opacity: 0.8 },
          { backgroundColor: colors.primary + '15', borderColor: colors.primary }
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <AppText variant="label" color={colors.primary} style={{ marginLeft: 8 }}>
              Use Current Location (GPS)
            </AppText>
          </>
        )}
      </Pressable>

      <View style={styles.separator}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <AppText color={colors.textMuted} style={styles.separatorText}>SELECT MANUALLY</AppText>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {!selectedState ? (
          <>
            <AppText variant="label" style={[{ marginBottom: 16 }, { color: colors.text }]}>Select your State</AppText>
            {Object.keys(INDIAN_LOCATIONS).map((state) => (
              <Pressable
                key={state}
                onPress={() => setSelectedState(state)}
                style={[styles.listItem, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
              >
                <AppText style={{ color: colors.text }}>{state}</AppText>
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <Pressable 
              onPress={() => setSelectedState(null)}
              style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <AppText color={colors.primary} style={{ marginLeft: 8 }}>Back to States</AppText>
            </Pressable>

            <AppText variant="label" style={[{ marginBottom: 4 }, { color: colors.text }]}>{selectedState}</AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: 16 }}>Select District</AppText>
            {INDIAN_LOCATIONS[selectedState].map((district) => (
              <Pressable
                key={district}
                onPress={() => onSelect({
                  city: district,
                  state: selectedState,
                  country: 'India',
                  latitude: 0,
                  longitude: 0,
                  address: `${district}, ${selectedState}`,
                })}
                style={[styles.listItem, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
              >
                <AppText style={{ color: colors.text }}>{district}</AppText>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 24, textAlign: 'center' }}>
        We only use your location to provide accurate weather and crop data.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...theme.shadow.sm,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  searchWrapper: {
    zIndex: 100, // Important for the dropdown list
  },
  searchInput: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 16,
  },
  listView: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  row: {
    padding: 16,
    height: 60,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }
});
