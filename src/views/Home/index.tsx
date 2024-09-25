import {View, Text,TextInput, SafeAreaView} from 'react-native';
import SearchBar from '@/components/SearchBar';


function HomeScreen() {
  return (
    <SafeAreaView>
      <SearchBar />
    </SafeAreaView>
  );
}

export default HomeScreen;
