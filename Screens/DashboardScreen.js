import React, {useEffect, useState} from "react";

import {View, Text, StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen({navigation}) {

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', ()=>{
            loadNutriments();
        });
        return unsubscribe;
    }, [navigation]);

    let today = new Date().toISOString();
    let storedDate;
    const [storedKcal, setStoredKcal] = useState(0);
    const [storedCarbs, setStoredCarbs] = useState(0);
    const [storedProteins, setStoredProteins] = useState(0);
    const [storedFats, setStoredFats] = useState(0);
    const [storedSugar, setStoredSugar] = useState(0);
    const [storedSatFats, setStoredSatFats] = useState(0);
    const [storedSodium, setStoredSodium] = useState(0);

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




    return (
        <View style={styles.container}>
            <Text>{storedKcal}</Text>
            <Text>{storedCarbs}</Text>
            <Text>{storedProteins}</Text>
            <Text>{storedFats}</Text>
            <Text>{storedSugar}</Text>
            <Text>{storedSatFats}</Text>
            <Text>{storedSodium}</Text>
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
    });