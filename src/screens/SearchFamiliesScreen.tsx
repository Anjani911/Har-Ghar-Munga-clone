import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Card, Title, Button, Surface, Text, TextInput, Appbar, Chip, Avatar, List, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../utils/api'; // path
import { useFocusEffect } from '@react-navigation/native';

interface SearchFamiliesScreenProps {
  navigation: any;
}

interface FamilyData {
  id: string;
  childName: string;
  parentName: string;
  mobileNumber: string;
  village: string;
  registrationDate: string;
  plantDistributed: boolean;
}
export default function SearchFamiliesScreen({ navigation }: SearchFamiliesScreenProps) {
  const [familiesData, setFamiliesData] = useState<FamilyData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFamilies, setFilteredFamilies] = useState<FamilyData[]>(familiesData);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'yesterday' | 'thisMonth' | 'lastMonth'>('all');

useFocusEffect(
  React.useCallback(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getFamilies(); // Pulls real data from backend
        setFamiliesData(data);
        setFilteredFamilies(data);
      } catch (error) {
        console.error('Failed to fetch families:', error);
      }
    };

    fetchData();
  }, [])
);
  // Helper function to check if date matches filter
  const isDateInRange = (dateString: string, filter: string) => {
    const [day, month, year] = dateString.split('/').map(Number);
    const registrationDate = new Date(year, month - 1, day);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    switch (filter) {
      case 'today':
        return registrationDate.toDateString() === today.toDateString();
      case 'yesterday':
        return registrationDate.toDateString() === yesterday.toDateString();
      case 'thisMonth':
        return registrationDate.getMonth() === today.getMonth() && 
               registrationDate.getFullYear() === today.getFullYear();
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return registrationDate.getMonth() === lastMonth.getMonth() && 
               registrationDate.getFullYear() === lastMonth.getFullYear();
      default:
        return true;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    let filtered = familiesData;
    
    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(family => 
        family.childName.toLowerCase().includes(query.toLowerCase()) ||
        family.parentName.toLowerCase().includes(query.toLowerCase()) ||
        family.mobileNumber.includes(query) ||
        family.village.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Filter by date range
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(family => isDateInRange(family.registrationDate, selectedFilter));
    }
    
    setFilteredFamilies(filtered);
  };

  const handleFilterChange = (filter: 'all' | 'today' | 'yesterday' | 'thisMonth' | 'lastMonth') => {
    setSelectedFilter(filter);
    
    let filtered = familiesData;
    
    // Filter by search query first
    if (searchQuery.trim()) {
      filtered = filtered.filter(family => 
        family.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.mobileNumber.includes(searchQuery) ||
        family.village.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Then filter by date range
    if (filter !== 'all') {
      filtered = filtered.filter(family => isDateInRange(family.registrationDate, filter));
    }
    
    setFilteredFamilies(filtered);
  };

  const getFilterCount = (filter: string) => {
    if (filter === 'all') return familiesData.length;
    return familiesData.filter(family => isDateInRange(family.registrationDate, filter)).length;
  };

  const handleViewDetails = (familyId: string) => {
    // Navigate to family details screen
    Alert.alert('परिवार विवरण', `परिवार ID: ${familyId} का विवरण देखा जा रहा है`);
  };

  const handleCallFamily = (mobileNumber: string) => {
    Alert.alert('कॉल करें', `${mobileNumber} पर कॉल करना चाहते हैं?`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#66BB6A']}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="परिवार खोजें" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <Surface style={styles.searchContainer}>
          <TextInput
            label="परिवार खोजें (नाम, मोबाइल, गाँव)"
            value={searchQuery}
            onChangeText={handleSearch}
            mode="outlined"
            style={styles.searchInput}
            placeholder="बच्चे का नाम, माता-पिता का नाम, मोबाइल या गाँव का नाम लिखें"
            left={<TextInput.Icon icon="magnify" color="#4CAF50" />}
            right={searchQuery ? <TextInput.Icon icon="close" onPress={() => handleSearch('')} color="#666" /> : undefined}
            outlineColor="#E0E0E0"
            activeOutlineColor="#4CAF50"
            theme={{ colors: { primary: '#4CAF50' } }}
          />
        </Surface>

        {/* Filter Chips */}
        <Surface style={styles.filterContainer}>
          <Text style={styles.filterLabel}>फिल्टर:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            <Chip
              selected={selectedFilter === 'all'}
              onPress={() => handleFilterChange('all')}
              style={[styles.filterChip, selectedFilter === 'all' && styles.selectedChip]}
              textStyle={[styles.chipText, selectedFilter === 'all' && styles.selectedChipText]}
            >
              सभी ({getFilterCount('all')})
            </Chip>
            <Chip
              selected={selectedFilter === 'today'}
              onPress={() => handleFilterChange('today')}
              style={[styles.filterChip, selectedFilter === 'today' && styles.selectedChip]}
              textStyle={[styles.chipText, selectedFilter === 'today' && styles.selectedChipText]}
            >
              आज ({getFilterCount('today')})
            </Chip>
            <Chip
              selected={selectedFilter === 'yesterday'}
              onPress={() => handleFilterChange('yesterday')}
              style={[styles.filterChip, selectedFilter === 'yesterday' && styles.selectedChip]}
              textStyle={[styles.chipText, selectedFilter === 'yesterday' && styles.selectedChipText]}
            >
              कल ({getFilterCount('yesterday')})
            </Chip>
            <Chip
              selected={selectedFilter === 'thisMonth'}
              onPress={() => handleFilterChange('thisMonth')}
              style={[styles.filterChip, selectedFilter === 'thisMonth' && styles.selectedChip]}
              textStyle={[styles.chipText, selectedFilter === 'thisMonth' && styles.selectedChipText]}
            >
              इस महीने ({getFilterCount('thisMonth')})
            </Chip>
            <Chip
              selected={selectedFilter === 'lastMonth'}
              onPress={() => handleFilterChange('lastMonth')}
              style={[styles.filterChip, selectedFilter === 'lastMonth' && styles.selectedChip]}
              textStyle={[styles.chipText, selectedFilter === 'lastMonth' && styles.selectedChipText]}
            >
              पिछले महीने ({getFilterCount('lastMonth')})
            </Chip>
          </ScrollView>
        </Surface>

        {/* Results Summary */}
        <Surface style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {filteredFamilies.length} परिवार मिले
          </Text>
        </Surface>

        {/* Family List */}
        <Surface style={styles.listContainer}>
          {filteredFamilies.length > 0 ? (
            filteredFamilies.map((family) => (
              <Card key={family.id} style={styles.familyCard}>
                <Card.Content style={styles.familyCardContent}>
                  <View style={styles.familyHeader}>
                    <View style={styles.familyInfo}>
                      <Avatar.Text 
                        size={50} 
                        label={family.childName.charAt(0)} 
                        style={{ backgroundColor: '#4CAF50' }}
                      />
                      <View style={styles.familyDetails}>
                        <Text style={styles.childName}>{family.childName}</Text>
                        <Text style={styles.parentName}>माता/पिता: {family.parentName}</Text>
                        <Text style={styles.village}>गाँव: {family.village}</Text>
                        <Text style={styles.registrationDate}>पंजीकरण: {family.registrationDate}</Text>
                      </View>
                    </View>
                    <View style={styles.familyActions}>
                      <IconButton
                        icon="phone"
                        size={20}
                        onPress={() => handleCallFamily(family.mobileNumber)}
                        style={styles.actionIcon}
                        iconColor="#4CAF50"
                      />
                      <IconButton
                        icon="eye"
                        size={20}
                        onPress={() => handleViewDetails(family.id)}
                        style={styles.actionIcon}
                        iconColor="#2196F3"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.familyFooter}>
                    <View style={styles.statusInfo}>
                      {family.plantDistributed && (
                        <Chip 
                          style={styles.plantChip}
                          textStyle={styles.plantText}
                          icon="check-circle"
                        >
                          पौधा मिला
                        </Chip>
                      )}
                    </View>
                    <Text style={styles.mobileNumber}>{family.mobileNumber}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>कोई परिवार नहीं मिला</Text>
              <Text style={styles.emptyStateMessage}>
                कृपया अलग शब्दों से खोजें या फिल्टर बदलें
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                  setFilteredFamilies(familiesData);
                }}
                style={styles.resetButton}
                textColor="#4CAF50"
              >
                रीसेट करें
              </Button>
            </View>
          )}
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedChip: {
    backgroundColor: '#E8F5E8',
  },
  chipText: {
    color: '#666666',
    fontSize: 12,
  },
  selectedChipText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  summaryContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  familyCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  familyCardContent: {
    padding: 16,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  familyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  familyDetails: {
    marginLeft: 12,
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  parentName: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  village: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  registrationDate: {
    fontSize: 12,
    color: '#999999',
  },
  familyActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    margin: 0,
  },
  familyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  plantChip: {
    height: 28,
    backgroundColor: '#E8F5E8',
  },
  plantText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mobileNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  resetButton: {
    borderRadius: 12,
  },
});
