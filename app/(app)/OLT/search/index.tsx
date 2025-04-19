import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    FlatList,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSession } from '@/context/AuthContext';
import { useLocalSearchParams } from 'expo-router';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const SearchScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('SN');
    const [results, setResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { session: token } = useSession();

    const spinValue = useRef(new Animated.Value(0)).current;

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [isLoading]);

    const handleSearch = async () => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setResults([]);
            setHasSearched(true);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        setError(null);

        if (searchType === 'SN') {
            try {
                const response = await fetch(`${apiUrl}/device/${id}/onu/search/sn`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sn: trimmedQuery }),
                });

                if (response.status === 404) {
                    setResults([]);
                    setError('No matching devices found.');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Request failed');
                }

                const data = await response.json();

                const formattedResults = data ? [{
                    status: data.status,
                    description: data.Description,
                    fsp: data.FSP,
                    sn: data.SN,
                    ontid: data.ONTID,
                    vendorsn: data.VendorSN,
                    lineProfile: data.LineProfile,
                }] : [];

                setResults(formattedResults);
            } catch (err) {
                console.error('API Error:', err);
                setResults([]);
                setError('An error occurred while fetching data.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const clearQuery = () => {
        setQuery('');
        setResults([]);
        setError(null);
        setHasSearched(false);
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>🔍 Device Lookup</Text>

            <View style={styles.card}>
                <Picker
                    selectedValue={searchType}
                    onValueChange={setSearchType}
                    style={styles.picker}
                    dropdownIconColor="#1DB954"
                >
                    <Picker.Item label="Search by SN" value="SN" />
                    <Picker.Item label="Search by Description" value="description" />
                </Picker>

                <TextInput
                    style={styles.input}
                    placeholder={`Enter ${searchType.toUpperCase()}`}
                    placeholderTextColor="#888"
                    value={query}
                    onChangeText={setQuery}
                />

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                        <Text style={styles.btnText}>🚀 Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearBtn} onPress={clearQuery}>
                        <Text style={styles.btnText}>❌ Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]}>
                        <Text style={styles.loadingText}>🔄</Text>
                    </Animated.View>
                </View>
            )}

            {!isLoading && hasSearched && error && (
                <Text style={styles.noResultsText}>🚫 {error}</Text>
            )}

            {!isLoading && results.length > 0 && (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => item.id || item.sn || index.toString()}
                    contentContainerStyle={{ paddingTop: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.resultItem}>
                            <Text style={styles.resultText}>🔢 Status: <Text style={styles.highlight}>{item.status}</Text></Text>
                            <Text style={styles.resultText}>🔢 SN: <Text style={styles.highlight}>{item.sn}</Text></Text>
                            <Text style={styles.resultText}>📄 Description: <Text style={styles.highlight}>{item.description}</Text></Text>
                            <Text style={styles.resultText}>🔌 FSP: <Text style={styles.highlight}>{item.fsp}</Text></Text>
                            <Text style={styles.resultText}>💻 ONTID: <Text style={styles.highlight}>{item.ontid}</Text></Text>
                            <Text style={styles.resultText}>🔢 VendorSN: <Text style={styles.highlight}>{item.vendorsn}</Text></Text>
                            <Text style={styles.resultText}>🆔 Line Profile: <Text style={styles.highlight}>{item.lineProfile}</Text></Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#0d0d0d',
    },
    heading: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1DB954',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: '#1DB95488',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },
    card: {
        backgroundColor: '#181818',
        borderRadius: 12,
        padding: 18,
        shadowColor: '#1DB954',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    picker: {
        backgroundColor: '#222',
        color: '#1DB954',
        marginBottom: 14,
        borderRadius: 10,
    },
    input: {
        height: 48,
        backgroundColor: '#101010',
        borderColor: '#1DB95433',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        color: '#ffffff',
        fontSize: 15,
        marginBottom: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    searchBtn: {
        backgroundColor: '#00bfff',
        flex: 1,
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#00bfff',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    clearBtn: {
        backgroundColor: '#ff3c3c',
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#ff3c3c',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    resultItem: {
        backgroundColor: '#121212',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#1DB954',
    },
    resultText: {
        fontSize: 15,
        color: '#ddd',
        marginBottom: 6,
    },
    highlight: {
        color: '#1DB954',
        fontWeight: '600',
    },
    noResultsText: {
        textAlign: 'center',
        marginVertical: 30,
        fontSize: 16,
        color: '#bbb',
        fontStyle: 'italic',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30,
    },
    loadingSpinner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: '#1DB954',
        borderBottomColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 24,
        color: '#1DB954',
    },
});

export default SearchScreen;
