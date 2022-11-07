import React, {useEffect, useState} from "react";
import {Input} from 'react-native-elements';
import {View, Text, StyleSheet, Dimensions, Alert, ToastAndroid} from "react-native";
import {Picker} from "@react-native-picker/picker";
import * as SQLite from "expo-sqlite";
import {Button} from 'react-native-elements';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function ProfileScreen() {

    const genders = [{k: 0, label: "Male"}, {k: 1, label: "Female"}, {k: 2, label: "Do not specify/Other"}];
    const timesAWeek = [1, 2, 3, 4, 5, 6, 7];
    const db = SQLite.openDatabase('nutrimon.db');

    /* States */
    const [name, setName] = useState('');
    const [gender, setGender] = useState(genders[0].label);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [availableSports, setAvailableSports] = useState([]);
    const [sport1, setSport1] = useState('None');
    const [timesAWeek1, setTimesAWeek1] = useState('');
    const [sport2, setSport2] = useState('None');
    const [timesAWeek2, setTimesAWeek2] = useState('');
    const [userExist, setUserExist] = useState(false);

    useEffect(() => {
        //Select user data
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM user', [], (_, {rows}) => {
                rows._array.forEach(r => console.log(r));
                let user = rows._array[0];
                if (user !== undefined) {
                    setName(user.name);
                    setGender(user.gender);
                    setWeight(user.weight + "");
                    setHeight(user.height + "");
                    setUserExist(true);
                } else {
                    setUserExist(false);
                }
            });
        }, error => {
            setUserExist(false);
            console.log(error.message);
            Alert.alert("Error " + error.code);
        }, () => {
            console.log("Success in reading user data");
        });

        //Select list of sports
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM sports ORDER BY name', [], (_, {rows}) => {
                setAvailableSports(rows._array);
            });
        }, error => {
            console.log(error.message);
            Alert.alert("Error " + error.code)
        }, () => console.log("Success in reading all sports"));

        // Select practiced sports
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM sports WHERE isPracticed = 1', [], (_, {rows}) => {
                let s1 = rows._array[0];
                let s2 = rows._array[1];
                if(s1){
                    setSport1(s1.name);
                    setTimesAWeek1(s1.timesAWeek);
                } else{
                    setSport1("None");
                }
                if(s2){
                    setSport2(s2.name);
                    setTimesAWeek2(s2.timesAWeek);
                } else{
                    setSport2("None");
                }

            });
        }, error => {
            console.log(error.message);
            Alert.alert("Error " + error.code);
        }, () => console.log("Success in reading practiced sports"));
    }, []);

    function updateSports() {
        db.transaction(tx => {
            tx.executeSql('UPDATE sports SET isPracticed = 1 WHERE name=? OR name=?;',
                [sport1, sport2]);
        }, error => {
            console.log(error.message);
            Alert.alert("Error " + error.code);
        }, null);

        db.transaction(tx => {
            tx.executeSql('UPDATE sports SET isPracticed = 0 WHERE NOT name=? OR NOT name=?;',
                [sport1, sport2]);
        }, error => {
            console.log(error.message);
            Alert.alert("Error " + error.code);
        }, null);


    }

    function saveProfile() {
        function showToast() {
            ToastAndroid.showWithGravity("Your profile has been updated!", ToastAndroid.LONG, ToastAndroid.TOP);
        }

        console.log("Saving profile...");
        console.log("Does user exist? " + userExist)
        if (userExist) {
            console.log("Updating profile...");
            console.log("Updating " + name + " " + gender + " " + weight + " " + height);
            db.transaction(tx => {
                tx.executeSql('UPDATE user SET name = ?, gender = ?, weight = ?, height = ? WHERE 1=1;',
                    [name, gender, weight, height]);
            }, error => {
                console.log(error.message);
                Alert.alert("Error " + error.code);
            }, () => {
                console.log("User updated!");
                showToast();
            });
        } else {
            console.log("Creating profile...");
            console.log("Inserting " + name + " " + gender + " " + weight + " " + height);
            db.transaction(tx => {
                tx.executeSql('INSERT INTO user (name, gender, weight, height) VALUES (?,?,?,?);',
                    [name, gender, weight, height]);
            }, error => {
                console.log(error.message);
                Alert.alert("Error " + error.code);
            }, () => {
                console.log("User created!");
                setUserExist(false);
                showToast();
            });
        }
        updateSports();
    }

    return (
        <View style={styles.container}>
            {/*Personal details container*/}
            <View style={styles.small_container}>
                <Text style={styles.subtitle}>Personal details</Text>
                <Text style={styles.label}>Name</Text>
                <Input
                    onChangeText={value => {
                        setName(value);
                    }} value={name}
                    placeholder="John Doe"
                    placeholderTextColor='grey'
                    inputContainerStyle={styles.inputContainer}
                />
                <Text style={styles.label}>Gender</Text>
                <View style={styles.pickerInput}>
                    <Picker
                        selectedValue={gender}
                        onValueChange={(itemValue) => {
                            setGender(itemValue);
                        }
                        }
                        prompt='Select gender'
                    >
                        {
                            genders.map((g) => {
                                return <Picker.Item key={g.k} label={g.label} value={g.label}/>
                            })
                        }
                    </Picker>
                </View>
                <Text style={styles.label}>Weight (kg)</Text>
                <Input
                    onChangeText={value => setWeight(value)}
                    value={weight}
                    placeholder="Weight in kg"
                    placeholderTextColor='grey'
                    inputContainerStyle={styles.inputContainer}
                    keyboardType='number-pad'
                />
                <Text style={styles.label}>Height (cm)</Text>
                <Input
                    onChangeText={value => setHeight(value)}
                    value={height}
                    placeholder="Height in cm"
                    placeholderTextColor='grey'
                    inputContainerStyle={styles.inputContainer}
                    keyboardType='number-pad'
                />
            </View>
            {/*Sports container*/}
            <View style={styles.small_container}>
                <Text style={styles.subtitle}>Activity details</Text>
                {/*Sport 1*/}
                <Text style={styles.label}>Sport 1</Text>
                <View style={styles.secondaryPickerInput}>
                    <Picker
                        selectedValue={sport1}
                        onValueChange={(itemValue) => {
                            setSport1(itemValue);
                        }
                        }
                        prompt='Select a first sport'
                    >
                        {
                            availableSports.map((sport) => {
                                return <Picker.Item key={sport.id} label={sport.name} value={sport.name}/>
                            })
                        }
                    </Picker>
                </View>
                <View style={styles.pickerInput}>
                    <Picker
                        selectedValue={timesAWeek1}
                        onValueChange={(itemValue) => {
                            setTimesAWeek1(itemValue);
                        }
                        }
                        prompt='How many times a week?'
                    >
                        {
                            timesAWeek.map((t) => {
                                return <Picker.Item key={t} label={t.toString()} value={t.toString()}/>
                            })
                        }
                    </Picker>
                </View>
                {/*Sport 2*/}
                <Text style={styles.label}>Sport 2</Text>
                <View style={styles.secondaryPickerInput}>
                    <Picker
                        selectedValue={sport2}
                        onValueChange={(itemValue) => {
                            setSport2(itemValue);
                        }
                        }
                        prompt='Select a second sport'
                    >
                        {
                            availableSports.map((sport) => {
                                return <Picker.Item key={sport.id} label={sport.name} value={sport.name}/>
                            })
                        }
                    </Picker>
                </View>
                <View style={styles.pickerInput}>
                    <Picker
                        selectedValue={timesAWeek2}
                        onValueChange={(itemValue) => {
                            setTimesAWeek2(itemValue);
                        }
                        }
                        prompt='How many times a week?'
                    >
                        {
                            timesAWeek.map((t) => {
                                return <Picker.Item key={t} label={t.toString()} value={t.toString()}/>
                            })
                        }
                    </Picker>
                </View>

            </View>
            <View style={{width: windowWidth, alignItems: 'center', position: 'absolute', bottom: 11}}>
                <Button
                    disabled={name === '' || weight === '' || height === ''}
                    title='Save profile'
                    onPress={saveProfile}
                />
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
        small_container: {
            paddingLeft: 11,
        },
        inputContainer: {
            height: 24,
            width: windowWidth * 0.85,
        },
        subtitle: {
            fontSize: 22,
            fontWeight: "bold",
        },
        pickerInput: {
            borderBottomWidth: 1,
            borderBottomColor: 'grey',
            height: 38,
            marginStart: 11,
            width: windowWidth * 0.85,
            marginBottom: 28,

        },
        secondaryPickerInput: {
            borderBottomWidth: 1,
            borderBottomColor: 'grey',
            height: 38,
            marginStart: 11,
            width: windowWidth * 0.85,
            marginBottom: 0,
        },
        label: {
            paddingStart: 11,
            fontWeight: "bold",
            color: 'grey',
        }
    }
)