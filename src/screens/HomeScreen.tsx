import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Button,
    FlatList,
    TouchableOpacity,
    Image
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { UseNavigationModel } from '../models/typescript/navigation';
import apibase from '../utilities/apibase';
import { links } from '../utilities/apibase/links'
import { SharedContext } from '../store/context/SharedContext';
import { SharedContextModel } from '../models/typescript/sharedContext';
import { useSelector, useDispatch } from 'react-redux';
import {
    setGamesData, games
} from '../store/redux/gamesSlice';
import { fonts } from '../utilities/fonts';
import { GameModel } from '../models/typescript/game';
import { height_screen, width_screen } from '../utilities/dimensions';
import { routes } from '../utilities/routes';
import ErrorModal from '../components/alertModal';

function HomeScreen(): JSX.Element {
    const navigation: UseNavigationModel = useNavigation();

    const currentContext: SharedContextModel = useContext(SharedContext)
    const { setShowGlobalLoading, setShowOverlay, platform, category, sortby, applyTrigger } = currentContext

    const dispatch = useDispatch();
    const data: Array<GameModel> = useSelector(games);

    const [showErrorModal, setShowErrorModal] = useState<boolean>(false)
    const [errorModalAlertText, setErrorModalAlertText] = useState<string>("")

    function GetData() {
        setShowOverlay(true)
        setShowGlobalLoading(true)

        let paramsUrl = links.games + '?platform=' + platform.text.toLowerCase()
        category.id !== "10" && (paramsUrl += ('&category=' + category.text.toLowerCase()))
        sortby.id !== "10" && (paramsUrl += ('&sort-by=' + sortby.text.toLowerCase()))

        apibase.Get({
            url: paramsUrl,
            successFunction: (res: any) => {
                dispatch(setGamesData(res))
                setShowOverlay(false)
                setShowGlobalLoading(false)
            },
            errorFunction: (res: any) => {
                setErrorModalAlertText(res)
                setShowGlobalLoading(false)
                setShowErrorModal(true)
            },
            exceptionFunction: (ex: any) => {
                setErrorModalAlertText(ex)
                setShowGlobalLoading(false)
                setShowErrorModal(true)
            }
        })
    }

    useEffect(() => {
        GetData()
    }, [])

    useEffect(() => {
        applyTrigger !== 0 && GetData()
    }, [applyTrigger])

    function OnGamePressed(game: GameModel) {
        navigation.navigate(routes.GameDetailScreen, { game })
    }

    interface RenderItemModel {
        item: GameModel,
        index: number
    }
    const renderItem = useCallback((eachItem: RenderItemModel) => (
        <TouchableOpacity onPress={() => OnGamePressed(eachItem.item)} key={eachItem.item.id} style={styles.eachGameContainer}>
            <>
                <Image resizeMode='stretch' style={styles.thumbnail} source={{ uri: eachItem.item.thumbnail }} />
                <Text numberOfLines={1} style={styles.title}>{eachItem.item.title}</Text>
                <Text style={styles.genre}>{eachItem.item.genre}</Text>
            </>

            <View style={styles.platformAndReleaseSection}>
                <Text style={styles.platform}>{eachItem.item.platform}</Text>
                <Text style={styles.date}>Release date: {eachItem.item.release_date}</Text>
            </View>
        </TouchableOpacity>
    ), []);

    return (
        <View style={styles.container}>
            <ErrorModal
                text={errorModalAlertText}
                show={showErrorModal}
                onSuccess={() => { currentContext.setShowOverlay(false), setShowErrorModal(false) }}
            />
            <Text style={styles.gamesFoundText}>{data.length}</Text>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={20}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: 'white'
    },
    gamesFoundText: {
        fontFamily: fonts.SegoeBold,
        color: '#adadad',
        fontSize: 14,
        textAlign: 'right',
        paddingBottom: 8
    },
    eachGameContainer: {
        width: '100%',
        backgroundColor: 'white',
        height: height_screen * .3,
        marginBottom: 12,
        borderBottomWidth: 0.5,
        borderLeftWidth: 0.5,
        borderRadius: 20,
        elevation: 5,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        paddingBottom: 12,
        justifyContent: 'space-between'
    },
    thumbnail: {
        height: '60%',
        width: '100%',
        alignSelf: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontFamily: fonts.SegoeBold,
        fontSize: 24,
        color: 'black',
        marginBottom: 4,
        paddingHorizontal: 8
    },
    genre: {
        fontFamily: fonts.SegoeBold,
        fontSize: 16,
        color: 'black',
        paddingHorizontal: 8,
    },
    platformAndReleaseSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,

    },
    platform: {
        fontFamily: fonts.Segoe,
        fontSize: 14,
        color: '#444444',
    },
    date: {
        fontFamily: fonts.Segoe,
        fontSize: 14,
        color: '#444444'
    }
});

export default HomeScreen;
