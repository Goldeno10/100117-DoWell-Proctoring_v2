import { useEffect, useRef, useState } from "react";
import { registerForEvent } from "../../../services/eventServices";
import { useSearchParams } from "react-router-dom";
import styles from "./styles.module.css";
import dowellLogo from "../../../assets/logo.png";
import expiredIllus from "../../../assets/expired-illustration.svg";
import DotLoader from "../../../components/DotLoader/DotLoader";
import { toast } from 'sonner';
import { validateEmail } from "../../../utils/utils";
import { PUBLIC_USER_DETAIL_KEY_IN_LOCAL_STORAGE } from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import EyeTracker from "../../../components/EyeTracker/EyeTracker";
import useStartCountDown from "../hooks/useStartCountdown";
import useLoadEventDetail from "../hooks/useLoadEventDetail";
import useSocketIo from "../../../hooks/useSocketIo";
import ScreenCapture from "../../../utils/captureScreen";

const dummyLink = "https://ll04-finance-dowell.github.io/100058-DowellEditor-V2/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9kdWN0X25hbWUiOiJXb3JrZmxvdyBBSSIsImRldGFpbHMiOnsiZmllbGQiOiJkb2N1bWVudF9uYW1lIiwiY2x1c3RlciI6IkRvY3VtZW50cyIsImRhdGFiYXNlIjoiRG9jdW1lbnRhdGlvbiIsImNvbGxlY3Rpb24iOiJDbG9uZVJlcG9ydHMiLCJkb2N1bWVudCI6IkNsb25lUmVwb3J0cyIsInRlYW1fbWVtYmVyX0lEIjoiMTIxMjAwMSIsImZ1bmN0aW9uX0lEIjoiQUJDREUiLCJjb21tYW5kIjoidXBkYXRlIiwiZmxhZyI6InNpZ25pbmciLCJfaWQiOiI2NWZlZDhjNzM3YzZkNmNmMTQ2YTFkOTAiLCJhY3Rpb24iOiJkb2N1bWVudCIsImF1dGhvcml6ZWQiOiJzYWdhci1oci1oaXJpbmciLCJ1c2VyX2VtYWlsIjoiIiwidXNlcl90eXBlIjoicHVibGljIiwiZG9jdW1lbnRfbWFwIjpbeyJjb250ZW50IjoiczEiLCJyZXF1aXJlZCI6ZmFsc2UsInBhZ2UiOjF9LHsiY29udGVudCI6ImkyIiwicmVxdWlyZWQiOmZhbHNlLCJwYWdlIjoyfSx7ImNvbnRlbnQiOiJpMyIsInJlcXVpcmVkIjpmYWxzZSwicGFnZSI6Mn0seyJjb250ZW50IjoiaTQiLCJyZXF1aXJlZCI6ZmFsc2UsInBhZ2UiOjJ9LHsiY29udGVudCI6Imk1IiwicmVxdWlyZWQiOmZhbHNlLCJwYWdlIjoyfV0sImRvY3VtZW50X3JpZ2h0IjoiYWRkX2VkaXQiLCJkb2N1bWVudF9mbGFnIjoicHJvY2Vzc2luZyIsInJvbGUiOiJGcmVlbGFuY2VyIiwicHJldmlvdXNfdmlld2VycyI6bnVsbCwibmV4dF92aWV3ZXJzIjpbIkR1bW15SFIiXSwibWV0YWRhdGFfaWQiOiI2NWZlZDhjODQwMDE2MmQ3MDRkNjk1MmEiLCJwcm9jZXNzX2lkIjoiNjVmZWQ4YzJiODZlM2E0ZTYwMGJiNDc3IiwidXBkYXRlX2ZpZWxkIjp7ImRvY3VtZW50X25hbWUiOiJVbnRpdGxlZCBEb2N1bWVudF9zYWdhci1oci1oaXJpbmciLCJjb250ZW50IjoiIiwicGFnZSI6IiJ9fX0.lX91uUpJY6oubfhKqLfJsX1IHW87-YkDXpHWqfshFQU&link_id=2130413081054482926";

const EventRegistrationPage = () => {
    const [ eventDetailLoading, setEventDetailLoading ] = useState(true);
    const [ foundEventDetail, setFoundEventDetail ] = useState(null);
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ currentFormPage, setCurrentFormPage ] = useState(0);
    const [ userDetails, setUserDetails ] = useState({
        name: '',
        email: '',
        user_image: '',
        event_id: '',
        user_lat: '',
        user_lon: '',
    });
    const [ activeUserStream, setActiveUserStream ] = useState(null);
    const [ cameraPermissionGranted, setCameraPermissionGranted ] = useState(false);
    const [ locationAccessGranted, setLocationAccessGranted ] = useState(false);
    const [ eventRegistrationLoading, setEventRegistrationLoading ] = useState(false);
    const [ eventStarted, setEventStarted ] = useState(false);
    const [ countDownTimer, setCountDownTimer ] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [ initialCountDownBegun, setInitialCountDownBegun ] = useState(false);
    const [ iframeLoading, setIframeLoading ] = useState(true);

    const videoRef = useRef();

    const handleUpdateUserDetail = (name, val) => {
        setUserDetails((prevVal) => {
            return {
                ...prevVal,
                [name]: val,
            }
        })
    }

    useLoadEventDetail(
        foundEventDetail,
        setFoundEventDetail,
        setCurrentFormPage,
        setEventDetailLoading,
        setEventStarted,
        setUserDetails,
        async () => {
            await handleRequestCameraPermission();
            handleRequestLocationAccess();
        },
    )

    useEffect(() => {
        if (activeUserStream !== null) {
            console.log('streamm ->>>', activeUserStream);
            setCameraPermissionGranted(true);
            if (videoRef.current) videoRef.current.srcObject = activeUserStream;
        }
    }, [currentFormPage])

    useStartCountDown(
        eventStarted, 
        userDetails, 
        foundEventDetail, 
        iframeLoading, 
        initialCountDownBegun, 
        setInitialCountDownBegun, 
        setCountDownTimer
    );
    
    useSocketIo(
        !iframeLoading,
        foundEventDetail?._id,
        userDetails.email,
        userDetails.name,
        activeUserStream,
    );

    const handleGoToNextPage = async () => {
        const nextPage = currentFormPage + 1;

        switch (nextPage) {
            case 1:
                setCurrentFormPage(nextPage);
                return;
            case 2:
                if (userDetails.name.length < 1) return toast.info('Please enter your name');
                if (userDetails.email.length < 1) return toast.info('Please enter your email');
                if (!validateEmail(userDetails.email)) return toast.info('Please enter a valid email');

                setCurrentFormPage(nextPage);
                return;
            case 3:
                if (!cameraPermissionGranted) return toast.info('Please grant access to your audio and video before proceeding');

                setCurrentFormPage(nextPage);
                return;
            case 4: {
                if (eventRegistrationLoading) return;
                if (!locationAccessGranted) return toast.info('Please grant access to your location before proceeding');
                
                const copyOfUserDetails = {...userDetails};
                copyOfUserDetails.event_id = searchParams.get('event_id');

                setEventRegistrationLoading(true);

                try {
                    const res = (await registerForEvent(copyOfUserDetails)).data;
                    console.log(res?.data);

                    localStorage.setItem(PUBLIC_USER_DETAIL_KEY_IN_LOCAL_STORAGE, JSON.stringify({...res?.data}));
                    setUserDetails(res?.data);

                    setEventRegistrationLoading(false);
                    setEventStarted(true);
                } catch (error) {
                    if (error?.response?.status === 409) {
                        localStorage.setItem(PUBLIC_USER_DETAIL_KEY_IN_LOCAL_STORAGE, JSON.stringify(error?.response?.data?.data));
                        setUserDetails(error?.response?.data?.data);

                        setEventRegistrationLoading(false);
                        setEventStarted(true);

                        return;
                    }

                    toast.error(error?.response?.data?.message);
                    setEventRegistrationLoading(false);
                }

                return;
            }
            default:
                console.log("no case defined");
                return;
        }
    }

    const handleRequestCameraPermission = async () => {
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            try {
                let userStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    // audio: true,
                })

                setCameraPermissionGranted(true);
                setActiveUserStream(userStream);

                if (videoRef.current) videoRef.current.srcObject = userStream;
            } catch (error) {
                console.log(error);
                toast.info('Please approve audio and video permission requests');
            }

            return
        }
        
        toast.info('Your device does not have a camera');
    }

    const handleRequestLocationAccess = () => {
        navigator.geolocation.getCurrentPosition((position => {
            handleUpdateUserDetail('user_lat', position.coords.latitude);
            handleUpdateUserDetail('user_lon', position.coords.longitude);

            setLocationAccessGranted(true);
        }), (error) => {
            console.log(error);
            toast.info('Please approve location request');
        })
    }

    if (eventStarted) return <ScreenCapture 
        captureScreen={true}
        eventId={foundEventDetail?._id}
        participantId={userDetails?._id}
    >
        <div className={styles.event__Wrapper}>
            <div className={styles.event__Live__Info}>
                <h3>{foundEventDetail?.name}</h3>
                <p><span>{`${countDownTimer?.days < 10 ? '0' : ''}${countDownTimer?.days}`}days {`${countDownTimer?.hours < 10 ? '0' : ''}${countDownTimer?.hours}`}hours {`${countDownTimer?.minutes < 10 ? '0' : ''}${countDownTimer?.minutes}`}minutes {`${countDownTimer?.seconds < 10 ? '0' : ''}${countDownTimer?.seconds}`}seconds</span> left</p>
            </div>
            {
                iframeLoading && <div 
                    className={styles.event__Iframe}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <DotLoader />
                </div>
            }
            <iframe 
                // src={foundEventDetail?.link} 
                src={dummyLink}
                title="Event Link"
                className={iframeLoading ? styles.hidden__Frame : styles.event__Iframe}
                onLoad={() => {
                    setIframeLoading(false)
                }}
            >    
            </iframe>

            {/* <div className={styles.track__Container}>
                <EyeTracker />
            </div> */}
        </div>
    </ScreenCapture>

    return <>
        <div className={styles.wrapper}>
            <div className={styles.event__Card}>
                <img
                    src={dowellLogo}
                    alt="dowell logo"
                    className={styles.logo}
                />

                {
                    eventDetailLoading ? <DotLoader /> :

                    !foundEventDetail ? <>
                        <h3>Event not found</h3>
                        <img 
                            src={expiredIllus}
                            alt="illustration"
                            className={styles.event__Ended__Illus}
                        />
                        <div className={styles.event__Details}>
                            <p style={{ textAlign: 'center' }}><span className={styles.info__Bold}>We cannot seem to find this event, it has either been deleted or it does not exist</span></p>
                        </div>
                    </>
                    :
                    new Date().getTime() > new Date(foundEventDetail?.close_date).getTime() ?
                    <>
                        <h3>This event is over</h3>
                        <img 
                            src={expiredIllus}
                            alt="illustration"
                            className={styles.event__Ended__Illus}
                        />
                    </>
                    :
                    <>
                        <h3>{foundEventDetail?.name}</h3>

                        <div className={styles.event__Details}>
                            {
                                currentFormPage === 0 ? <>
                                    <p><span className={styles.info__Bold}>Starts: </span>{new Date(foundEventDetail?.start_time).toDateString()} by {new Date(foundEventDetail?.start_time).toLocaleTimeString()}</p>
                                    <p><span className={styles.info__Bold}>Ends: </span>{new Date(foundEventDetail?.close_date).toDateString()} by {new Date(foundEventDetail?.close_date).toLocaleTimeString()}</p>
                                    <br />
                                    <p><span className={styles.info__Bold}>Time allowed: </span>{isNaN(foundEventDetail?.duration_in_hours) ? foundEventDetail?.duration_in_hours : Number(foundEventDetail?.duration_in_hours).toLocaleString()} hour{foundEventDetail?.duration_in_hours > 1 ? 's' : ''}</p>
                                </> 
                                :
                                currentFormPage === 1 ? 
                                <div className={styles.user__Detail}>
                                    <label>
                                        <span>Name</span>
                                        <input 
                                            type="text"
                                            name="name"
                                            value={userDetails.name}
                                            onChange={({ target }) => handleUpdateUserDetail(target.name, target.value)}
                                        />
                                    </label>
                                    <label>
                                        <span>Email</span>
                                        <input 
                                            type="text" 
                                            name="email"
                                            value={userDetails.email}
                                            onChange={({ target }) => handleUpdateUserDetail(target.name, target.value)}
                                        />
                                    </label>
                                </div> 
                                :
                                currentFormPage === 2 ? 
                                <div className={styles.user__Detail}>
                                    <video ref={videoRef}
                                        autoPlay 
                                        playsInline 
                                        controls={false} 
                                        controlsList="nofullscreen"
                                        className={`${styles.video__Item} ${!cameraPermissionGranted ? styles.no__Display : ''}`}
                                    >

                                    </video>
                                    {
                                        cameraPermissionGranted ? <>
                                            <p>Please ensure your face is fully visible in the frame before clicking &apos; Next &apos;</p>
                                        </> :
                                        <>
                                            <p>Please grant access to your video and audio by clicking the button below</p>
                                            <button 
                                                style={{ 
                                                    width: 'max-content',
                                                    margin: '0 auto'
                                                }} 
                                                className={styles.back_Btn} 
                                                onClick={handleRequestCameraPermission}
                                            >
                                                Grant permission
                                            </button>
                                        </>
                                    }
                                    <br />
                                </div>
                                :
                                currentFormPage === 3 ? <>
                                    {
                                        locationAccessGranted ? <></>
                                        :
                                        <>
                                            <p>One last step. Please grant location access by clicking the button below</p>
                                            <button 
                                                style={{ 
                                                    width: 'max-content',
                                                    margin: '10px auto 0',
                                                    display: 'block',
                                                }} 
                                                className={styles.back_Btn} 
                                                onClick={handleRequestLocationAccess}
                                            >
                                                Grant permission
                                            </button>
                                        </>
                                    }
                                </>
                                :
                                <></>
                            }
                        </div>

                        <div className={styles.btn__nav__Wrap}>
                            {
                                currentFormPage > 0 &&
                                <button className={styles.back_Btn} onClick={() => setCurrentFormPage(currentFormPage - 1)}>
                                    Back
                                </button>
                            }
                            <button 
                                className={styles.start_Btn} 
                                onClick={handleGoToNextPage}
                                disabled={
                                    (
                                        (currentFormPage > 2 && !locationAccessGranted) ||
                                        eventRegistrationLoading
                                    ) ? 
                                        true 
                                    : 
                                    false
                                }
                            >
                                {
                                    eventRegistrationLoading ? <LoadingSpinner /> 
                                    :
                                    currentFormPage <= 2 ?
                                        'Next'
                                    :
                                    'Begin'
                                }
                            </button>
                        </div>
                    </>
                }
            </div>
        </div>
    </>
}

export default EventRegistrationPage;