import React, {useEffect, useState} from "react";

import {Alert, Dimensions, StyleSheet, Text, View} from "react-native";
import {Button, Input} from "react-native-elements";
import {Picker} from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const apiKey = 'X8SKes6FOl8RiiZL2BfEYg==Z9D4Kd1gZ7aLQb68';

const DEBUG_MODE = false;

export default function InputScreen({navigation}) {

    useEffect(() => {
        return navigation.addListener('focus', () => {
            loadNutriments();
            updateDay();
        })
    }, [navigation]);

    let today = new Date().toISOString();
    let storedDate;
    let storedKcal = 0;
    let storedCarbs = 0;
    let storedProteins = 0;
    let storedFats = 0;
    let storedSugar = 0;
    let storedSatFats = 0;
    let storedSodium = 0;

    const units = [
        {k: 0, label: 'g', factor: 1},
        {k: 1, label: 'Kg', factor: 1000},
        {k: 2, label: 'lb', factor: 453.6},
        {k: 3, label: 'Oz', factor: 28.35}];

    const [searchInput, setSearchInput] = useState('');
    const [size, setSize] = useState('100');
    const [unit, setUnit] = useState(units[0].label);
    const [food, setFood] = useState(null);

    async function clearAsyncStorage() {
        await AsyncStorage.clear();
    }


    const callApi = () => {

        function adjustSize(food, factor) {
            for (let e in food) {
                if (food[e].constructor === String) {
                    continue;
                }
                food[e] = (food[e] * factor).toFixed(2);
            }
            return food;
        }

        console.log("Calling API...");
        let myHeaders = new Headers();
        myHeaders.append("X-Api-Key", apiKey);

        let requestOptions = {
            method: 'GET',
            redirect: 'follow',
            headers: myHeaders,
            contentType: 'application/json'
        };

        fetch(`https://api.calorieninjas.com/v1/nutrition?query=` + searchInput, requestOptions)
            .then(response => response.text())
            .then(result => {
                let f = JSON.parse(result).items[0];
                //If user has input a serving size => Calculate the macros using the size and factor
                if (size !== '') {
                    // Find factor
                    let factor;
                    for (let i in units) {
                        if (unit === units[i].label) {
                            factor = units[i].factor;
                            break;
                        }
                    }
                    adjustSize(f, size / 100 * factor);
                }
                setFood(f);
            })
            .catch(error => {
                Alert.alert('Error', error);
                console.log(error);
            });
    }

    async function updateDay() {
        storedDate = await AsyncStorage.getItem("TODAY");
        if (storedDate === undefined || storedDate === null || storedDate!== today) {
            storedDate = today;
        }
        console.log("updateDay(): storedDate: " + storedDate);
    }

    async function loadNutriments() {
        console.log("Loading Nutriments...")
        storedKcal = await AsyncStorage.getItem('KCAL');
        storedKcal === null ? storedKcal = 0 : storedKcal = parseFloat(storedKcal);
        console.log(storedKcal + " Stored kcal at loadNutriments()")
        storedCarbs = await AsyncStorage.getItem('CARB');
        storedCarbs === null ? storedCarbs = 0 : storedCarbs = parseFloat(storedCarbs);
        storedProteins = await AsyncStorage.getItem('PROT');
        storedProteins === null ? storedProteins = 0 : storedProteins = parseFloat(storedProteins);
        storedFats = await AsyncStorage.getItem('FAT');
        storedFats === null ? storedFats = 0 : storedFats = parseFloat(storedFats);
        storedSugar = await AsyncStorage.getItem('SUG');
        storedSugar === null ? storedSugar = 0 : storedSugar = parseFloat(storedSugar);
        storedSatFats = await AsyncStorage.getItem('SAT');
        storedSatFats === null ? storedSatFats = 0 : storedSatFats = parseFloat(storedSatFats);
        storedSodium = await AsyncStorage.getItem('SOD');
        storedSodium === null ? storedSodium = 0 : storedSodium = parseFloat(storedSodium);
        console.log("Nutriments loaded!");
    }

    const addInput = () => {

        if (food === null) {
            Alert.alert("Input a valid food first!");
            return;
        }

        async function saveNutriments() {
            console.log("Saving Nutriments...");
            await AsyncStorage.setItem('KCAL', storedKcal.toString());
            console.log("saving " + storedKcal)
            await AsyncStorage.setItem('CARB', storedCarbs.toString());
            await AsyncStorage.setItem('PROT', storedProteins.toString());
            await AsyncStorage.setItem('FAT', storedFats.toString());
            await AsyncStorage.setItem('SUG', storedSugar.toString());
            await AsyncStorage.setItem('SAT', storedSatFats.toString());
            await AsyncStorage.setItem('SOD', storedSodium.toString());
            console.log("Nutriments Saved!");
        }

        function storeNutriments() {
            try {
                console.log(storedKcal + " stored Kcal before");
                storedKcal += parseFloat(food.calories);
                storedCarbs += parseFloat(food.carbohydrate_total_g);
                storedProteins += parseFloat(food.protein_g);
                storedFats += parseFloat(food.fat_total_g);
                storedSugar += parseFloat(food.sugar_g);
                storedSatFats += parseFloat(food.fat_saturated_g);
                storedSodium += parseFloat(food.sodium_mg);
                console.log(storedKcal + "stored kcal after");
                saveNutriments();
            } catch (e) {
                console.log(e);
                console.log('error in saving nutriments');
            }
        }

        console.log("Adding food...");
        if (storedDate !== today || DEBUG_MODE) {
            console.log("Updating today's date (storedDate: " + storedDate + " today: " + today);
            console.log("Removing old nutriments...");
            storedKcal = 0;
            storedCarbs = 0;
            storedProteins = 0;
            storedFats = 0;
            storedSugar = 0;
            storedSatFats = 0;
            storedSodium = 0;

            console.log("Updated the date!");
            saveNutriments().then(() => {
                console.log("Removed old nutriments!")
                storeNutriments();
            });

        } else {
            console.log("Date is not updated");
            storeNutriments();
        }
    }

    return (
        <View style={styles.container}>
            <View style={{flexDirection: 'row', marginBottom: 12}}>
                <Input
                    containerStyle={styles.inputContainer}
                    onChangeText={value => setSearchInput(value)}
                    value={searchInput}
                    placeholder={"Input your food (e.g. Tomato)"}
                    placeholderTextColor={'grey'}
                />
                <Button
                    onPress={callApi}
                    icon={{
                        name: "search",
                        size: 32,
                        color: "black",
                    }}
                    buttonStyle={{backgroundColor: null}}
                />
            </View>
            <View style={{flexDirection: 'row', marginBottom: 12}}>
                <Input
                    containerStyle={{height: 32, width: windowWidth * 0.45}}
                    onChangeText={value => setSize(value)}
                    value={size}
                    placeholder={"Serving size"}
                    placeholderTextColor={'grey'}
                    keyboardType={'number-pad'}
                />
                <View style={styles.pickerInput}>
                    <Picker
                        selectedValue={unit}
                        onValueChange={(itemValue) => {
                            console.log(itemValue);
                            setUnit(itemValue);
                        }
                        }
                        prompt='Select unit'
                    >
                        {
                            units.map((u) => {
                                return <Picker.Item key={u.k} label={u.label} value={u.label}/>
                            })
                        }
                    </Picker>

                </View>
                <Button
                    onPress={addInput}
                    title='Add'
                    buttonStyle={{width: windowWidth * 0.25}}
                />
            </View>

            <View style={{paddingLeft: 11}}>
                <Text style={styles.subtitle}>Details</Text>
                {food == null ?
                    <Text style={styles.foodTitle}>No result</Text> :
                    <Text style={styles.foodTitle}>{food.name}</Text>
                }
                {food == null ?
                    <View/> :
                    <View style={{marginTop: 16}}>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Size</Text>
                            <Text>{food.serving_size_g} g</Text>
                        </View>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Calories</Text>
                            <Text>{food.calories} Cal</Text>
                        </View>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Carbohydrate</Text>
                            <Text>{food.carbohydrates_total_g} g</Text>
                        </View>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Protein</Text>
                            <Text>{food.protein_g} g</Text>
                        </View>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Fat</Text>
                            <Text>{food.fat_total_g} g</Text>
                        </View>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Sugar</Text>
                            <Text>{food.sugar_g} g</Text>
                        </View>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Saturated fat</Text>
                            <Text>{food.fat_saturated_g} g</Text>
                        </View>
                        <View style={styles.detailElement}>
                            <Text style={styles.detailTitle}>Sodium</Text>
                            <Text>{food.sodium_mg} mg</Text>
                        </View>
                    </View>
                }
            </View>
        </View>
    );
};


const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingTop: 11,
            paddingBottom: 11,
        },
        detailElement: {
            flexDirection: 'row',
        },
        detailTitle: {
            fontWeight: 'bold',
            width: windowWidth * 0.5
        },
        inputContainer: {
            height: 32,
            width: windowWidth * 0.85,
        },
        subtitle: {
            fontSize: 22,
            fontWeight: "bold",
        },
        pickerInput: {
            marginStart: 11,
            width: windowWidth * 0.25,
        },
        foodTitle: {
            paddingStart: 11,
            fontSize: 16,
            fontStyle: "italic",
        }
    }
)