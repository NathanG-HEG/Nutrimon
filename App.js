import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import StatisticsScreen from "./Screens/StatisticsScreen";
import SettingsScreen from "./Screens/SettingsScreen";
import DashboardScreen from "./Screens/DashboardScreen";
import InputScreen from "./Screens/InputScreen";
import ProfileScreen from "./Screens/ProfileScreen";
import * as SQLite from 'expo-sqlite';
import {Alert} from "react-native";
import {useEffect} from "react";
import Icon from "react-native-vector-icons/FontAwesome";

export default function App() {
    const Tab = createBottomTabNavigator();
    const db = SQLite.openDatabase('nutrimon.db');
    let initialRouteName = "Input";

    useEffect(() => {
        checkFirstLaunch();
    }, []);

    /**
     * TEST FUNCTION drop all tables
     */
    function dropAllTables() {
        db.transaction(tx => {
                tx.executeSql("DROP TABLE IF EXISTS sports;")
            }, error => console.log(error.message),
            () => console.log("Dropped sports table"));
        db.transaction(tx => {
                tx.executeSql("DROP TABLE IF EXISTS user;")
            }, error => console.log(error.message),
            () => console.log("Dropped user table"));
        db.transaction(tx => {
                tx.executeSql("DROP TABLE IF EXISTS dates;")
            }, error => console.log(error.message),
            () => console.log("Dropped dates table"));
    }

    /**
     * Function to check whether user is stored or not in DB
     */
    function checkFirstLaunch() {
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM user;", [], (_, {rows}) => {
                rows.length === 0 ? initialRouteName = "Profile" : initialRouteName = "Input";
            });
        }, () => {
            console.log("Database does not exist or could not be read");
            createDatabase();
        }, () => console.log("Database could be read successfully"));
    }

    /**
     * Function to create database
     */
    function createDatabase() {
        const errorMessage = "Critical error during application setup CODE: ";
        const successMessage = "Successfully created table: ";
        // Creates user table
        db.transaction(tx => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY NOT NULL, name TEXT, gender TEXT, weight INTEGER, height INTEGER, kcalories INTEGER);");
        }, error => {
            console.log(error.message);
            Alert.alert(errorMessage + error.code);
        }, () => console.log(successMessage + "user"));

        // Creates sports table
        db.transaction(tx => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS sports (id INTEGER PRIMARY KEY NOT NULL, name TEXT, kcalories INTEGER, isPracticed INTEGER, timesAWeek INTEGER);");
        }, error => {
            console.log(error.message);
            Alert.alert(errorMessage + error.code);
        }, () => console.log(successMessage + "sports"));


        // Creates days table
        db.transaction(tx => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS dates (id INTEGER PRIMARY KEY NOT NULL, day TEXT, kcaloriesDelta INTEGER);");
        }, error => {
            console.log(error.message);
            Alert.alert(errorMessage + error.code);
        }, () => console.log(successMessage + "dates"));

        // Fills sports table
        const sports = [
            {name: "Weight lifting", kcalories: 400},
            {name: "Aerobics", kcalories: 400},
            {name: "Running", kcalories: 600},
            {name: "Basketball", kcalories: 400},
            {name: "Combat sports", kcalories: 700},
            {name: "Football", kcalories: 450},
            {name: "Golf", kcalories: 250},
            {name: "Ice hockey", kcalories: 450},
            {name: "Tennis", kcalories: 400},
            {name: "Walking", kcalories: 200},
            {name: "Swimming", kcalories: 700},
            {name: "None", kcalories: 0},
        ];
        sports.forEach(sport => {
            db.transaction(tx => {
                    tx.executeSql('INSERT INTO sports VALUES (?, ?, ?, ?, ?)', [sport.index, sport.name, sport.kcalories, 0, 0]);
                },
                error => {
                    console.log(error.message);
                    Alert.alert(errorMessage + error.code);
                }, () => console.log("Added sport" + sport.name))
        });
    }
    const iconColor = 'rgb(137,158,255)'

    return (
        <NavigationContainer>
            <Tab.Navigator
                initialRouteName={initialRouteName}
                tabBarActiveTintColor='rgb(180,195,255)'
            >
                <Tab.Screen name="Statistics" component={StatisticsScreen}
                            options={{tabBarIcon: () => (<Icon name='line-chart' size={18} color={iconColor}/>)}}/>
                <Tab.Screen name="Dashboard" component={DashboardScreen}
                            options={{tabBarIcon: () => (<Icon name='bar-chart' size={18} color={iconColor}/>)}}/>
                <Tab.Screen name="Input" component={InputScreen}
                            options={{tabBarIcon: () => (<Icon name='plus-square' size={18} color={iconColor}/>)}}/>
                <Tab.Screen name="Settings" component={SettingsScreen}
                            options={{tabBarIcon: () => (<Icon name='gears' size={18} color={iconColor}/>)}}/>
                <Tab.Screen name="Profile" component={ProfileScreen}
                            options={{title: "Set up", tabBarIcon: () => (<Icon name='user-circle' size={18} color={iconColor}/>)}}/>
            </Tab.Navigator>
        </NavigationContainer>
    );
}
