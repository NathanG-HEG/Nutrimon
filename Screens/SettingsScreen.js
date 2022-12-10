import React, {useState} from "react";

import {View, Text} from "react-native";
import {Button, Overlay} from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SettingsScreen() {

    const [aboutVisible, setAboutVisible] = useState(false);

    const toggleOverlay = () => {
        setAboutVisible(!aboutVisible);
    }

    return (
        <View style={{
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingTop: 11,
            paddingBottom: 11,
        }}>
            <Button
                icon={<Icon
                    name='info-circle'
                    size={22}
                    color='rgb(137,158,255)'/>
                }
                title='  About Nutrimon'
                buttonStyle={{
                    width: 400,
                    backgroundColor: 'rgb(194,194,194)',
                    borderWidth: 0.8,
                    borderColor: 'rgb(137,158,255)',
                    borderRadius: 0
                }}
                onPress={toggleOverlay}
            />
            <Overlay
                isVisible={aboutVisible}
                onBackdropPress={toggleOverlay}
                overlayStyle={{
                    width: 380,
                    height: 480
                }}>
                <Text style={{
                    fontSize: 18,
                    alignSelf: 'center',
                    fontWeight: 'bold'
                }}>
                    About Nutrimon
                </Text>
                <Text>
                    Nutrimon is a nutrition app that aims to help people manage their food intake.
                    No data is collected from the app, everything is stored on your device.
                    The food nutriments are fetched from www.calorieninjas.com.
                    Your food intake is not stored, only the nutriments. Nutriments are deleted daily.
                </Text>
            </Overlay>
        </View>
    );
};