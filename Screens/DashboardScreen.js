import React, {useEffect, useState} from "react";

import {Alert, Pressable, StyleSheet, Text, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import {ProgressChart, StackedBarChart} from "react-native-chart-kit";
import Icon from 'react-native-vector-icons/FontAwesome';

export default function DashboardScreen({navigation}) {

    useEffect(() => {
        return navigation.addListener('focus', () => {
            loadNutriments();
            loadNeededKcal();
            loadStoredDate();
        });
    }, [navigation]);

    const db = SQLite.openDatabase('nutrimon.db');
    new Date().toISOString();
    const [neededKcal, setNeededKcal] = useState(0);
    const [storedKcal, setStoredKcal] = useState(0);
    const [storedCarbs, setStoredCarbs] = useState(0);
    const [storedProteins, setStoredProteins] = useState(0);
    const [storedFats, setStoredFats] = useState(0);
    const [storedSugar, setStoredSugar] = useState(0);
    const [storedSatFats, setStoredSatFats] = useState(0);
    const [storedSodium, setStoredSodium] = useState(0);
    const [storedDate, setStoredDate] = useState("");

    async function loadStoredDate() {
        let date = await AsyncStorage.getItem("TODAY");
        setStoredDate(date);
        if (storedDate === "" || storedDate === undefined) {
            setStoredDate(new Date().toISOString());
            console.log("storedDate could not be loaded");
        }
        console.log("Loaded storedDate: " + storedDate);
    }

    const loadNutriments = async () => {
        console.log("Loading nutriments");
        let kcal, carb, prot, fat, sug, sat, sod;
        kcal = await AsyncStorage.getItem('KCAL');
        kcal === null ? setStoredKcal(0) : setStoredKcal(parseFloat(kcal));
        carb = await AsyncStorage.getItem('CARB');
        carb === null ? setStoredCarbs(0) : setStoredCarbs(parseFloat(carb));
        prot = await AsyncStorage.getItem('PROT');
        prot === null ? setStoredProteins(0) : setStoredProteins(parseFloat(prot));
        fat = await AsyncStorage.getItem('FAT');
        fat === null ? setStoredFats(0) : setStoredFats(parseFloat(fat));
        sug = await AsyncStorage.getItem('SUG');
        sug === null ? setStoredSugar(0) : setStoredSugar(parseFloat(sug));
        sat = await AsyncStorage.getItem('SAT');
        sat === null ? setStoredSatFats(0) : setStoredSatFats(parseFloat(sat));
        sod = await AsyncStorage.getItem('SOD');
        sod === null ? setStoredSodium(0) : setStoredSodium(parseFloat(sod));
    }

    const loadNeededKcal = () => {
        db.transaction(tx => {
            tx.executeSql('SELECT kcalories FROM user;', [], (_, {rows}) => {
                setNeededKcal(rows._array[0].kcalories);
            });
        }, null, null);
    }

    function calcKcalRatio() {
        if (storedKcal) {
            let data = storedKcal / neededKcal;
            if (data > 1) {
                return [1.];
            }
            return [data];
        }
        return [0.];
    }

    function calculateMacroRatio() {
        // Explanation for carbRatio:
        // Total g of carbs divided by the number of needed carbs.
        // Needed carbs are calculated by taking the neededKcal, supposing 50% of them come from carbs
        // and that 1g of carb is 4kcal
        let carbRatio = (storedCarbs / neededKcal * 0.5 / 4) * 100;
        let protRatio = (storedProteins / neededKcal * 0.25 / 4) * 100;
        let fatRatio = (storedFats / neededKcal * 0.25 / 9) * 100;
        console.log(carbRatio);
        if (carbRatio > 1) carbRatio = 1;
        if (protRatio > 1) protRatio = 1;
        if (fatRatio > 1) fatRatio = 1;
        if (isNaN(carbRatio)) carbRatio = 0;
        if (isNaN(protRatio)) protRatio = 0;
        if (isNaN(fatRatio)) fatRatio = 0;

        return [
            [carbRatio * 100, 100 - carbRatio * 100],
            [protRatio * 100, 100 - protRatio * 100],
            [fatRatio * 100, 100 - fatRatio * 100]
        ];
    }

    return (
        <View style={styles.container}>
            <Text style={{
                color: 'grey',
                fontSize: 10,
                elevation: 3
            }}>Last updated on the {storedDate.substring(0, 10)}</Text>
            <View style={{marginTop:-20}}>
                <ProgressChart
                    data={calcKcalRatio()}
                    width={400}
                    height={400}
                    strokeWidth={50}
                    radius={150}
                    chartConfig={{
                        marginTop: -400,
                        color: (opacity = 1) => `rgba(180, 195, 255, ${opacity})`,
                        useShadowColorFromDataset: false,
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                    }}
                    hideLegend={true}
                />
            </View>
            <Text style={{
                color: 'black',
                marginTop: -210,
                alignSelf: 'center',
                fontWeight: 'bold',
                fontSize: 20,
            }}>{storedKcal.toFixed(0)} / {neededKcal.toFixed(0)} kcal</Text>
            <StackedBarChart
                data={{
                    labels: ['Carbohydrates', 'Proteins', 'Fats'],
                    legend: ['current', 'recommended'],
                    data: calculateMacroRatio(),
                    barColors: ['rgb(180,195,255)', '#eeeeee']
                }}
                width={380}
                height={200}
                hideLegend={true}
                withHorizontalLabels={true}
                chartConfig={{
                    backgroundColor: '#1cc910',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                style={{
                    marginTop: 160,
                    alignSelf: 'center'
                }}/>
            <View style={styles.complementInfo}>
                <Text style={styles.complementInfoText}>Sugar</Text>
                <View style={{marginLeft: 57}}/>
                <Text style={styles.complementInfoText}>{storedSugar}/30 g</Text>
                <View style={{marginLeft: 27}}/>
                {storedSugar < 30 ?
                    <Icon name='smile-o' color='rgb(150, 212, 59)'/>
                    :
                    <Pressable
                        onPress={() => Alert.alert("You probably ate too much sugar",
                            "Visit https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/how-much-sugar-is-too-much to know more.")}>
                        <Icon name='warning' color='rgb(212, 174, 59)'/>
                    </Pressable>
                }

            </View>
            <View style={styles.complementInfo}>
                <Text style={styles.complementInfoText}>Saturated fats</Text>
                <View style={{marginLeft: 57}}/>
                <Text style={styles.complementInfoText}>{storedSatFats}/15 g</Text>
                <View style={{marginLeft: 27}}/>
                {storedSatFats < 15 ?
                    <Icon name='smile-o' color='rgb(150, 212, 59)'/>
                    :
                    <Pressable
                        onPress={() => Alert.alert("You probably ate too much saturated fat",
                            "Visit https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats to know more.")}>
                        <Icon name='warning' color='rgb(212, 174, 59)'/>
                    </Pressable>
                }
            </View>
            <View style={styles.complementInfo}>
                <Text style={styles.complementInfoText}>Sodium</Text>
                <View style={{marginLeft: 57}}/>
                <Text style={styles.complementInfoText}>{storedSodium}/2400 mg</Text>
                <View style={{marginLeft: 27}}/>
                {storedSodium < 2400 ?
                    <Icon name='smile-o' color='rgb(150, 212, 59)'/>
                    :
                    <Pressable
                        onPress={() => Alert.alert("You probably ate too much salt",
                            "Visit https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium/how-much-sodium-should-i-eat-per-day to know more.")}>
                        <Icon name='warning' color='rgb(212, 174, 59)'/>
                    </Pressable>
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
        complementInfo: {
            flex: 1,
            flexDirection: "row",
            marginStart: 20,
        },
        complementInfoText: {
            fontSize: 12,
            width: 100,
        }
    });