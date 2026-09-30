import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { serviceApi } from '../../services/serviceApi';
import { Service } from '../../types';
import { SearchBar } from '../../components/SearchBar';
import { ServiceCard } from '../../components/ServiceCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { COLORS } from '../../constants/colors';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    serviceApi
      .getServices()
      .then((res) => {
        if (res.success && res.data) setServices(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Search Services" showBack />
      <View style={styles.content}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search for plumber, electrician, AC..."
        />

        {isLoading ? (
          <Loading message="Loading services..." />
        ) : filteredServices.length === 0 ? (
          <EmptyState
            title="No Services Found"
            message={`No service matching "${query}" was found.`}
            icon="search-outline"
          />
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.itemWrapper}>
                <ServiceCard
                  service={item}
                  onPress={() =>
                    router.push({
                      pathname: '/(customer)/workers',
                      params: { service: item.name },
                    })
                  }
                />
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingVertical: 16,
  },
  itemWrapper: {
    width: '50%',
    padding: 6,
  },
});
