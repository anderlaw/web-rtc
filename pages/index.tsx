import type {NextPage} from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";

import Script from 'next/script'

const Home: NextPage = () => {
    const [socket,setSocket] = useState<any>(null)
    const sendRef = useRef<HTMLVideoElement | null>(null)
    const receiveRef = useRef<HTMLVideoElement | null>(null)
    const [mediaSource, setMediaSource] = useState<any>(null)
    // 1。音视频采集
    // 2。传输
    const router = useRouter()
    useEffect(() => {
        if(!socket){
            return
        }
        const personType = router.asPath.split('=')[1]
        if (personType === 'send') {
            //send call
            const constraints = {
                video: true,
                audio: false
            };
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                if (sendRef.current) {
                    const pc = new RTCPeerConnection() as any;
                    pc.onaddstream = function (obj: any) {
                        console.log('on add ')
                        sendRef.current!.srcObject = obj.stream;
                        sendRef.current!.onloadedmetadata = function (e) {
                            console.log('play')
                            sendRef.current?.play();
                        };
                    }
                    // Adding a local stream won't trigger the onaddstream callback
                    pc.addStream(stream);

                    pc.createOffer(function (offer: any) {
                        pc.setLocalDescription(new RTCSessionDescription(offer), function () {
                            console.log('1stCheckSend', offer)
                            socket.emit('1stCheckSend',offer)
                            // send the offer to a server to be forwarded to the friend you're calling.
                        }, (err) => {
                            console.log(err)
                        });
                    }, (err) => {
                        console.log(err)
                    });
                }
            })
        } else {
            //receive call
            console.log(personType)
            const pc = new RTCPeerConnection() as any;
            // pc.setRemoteDescription(new RTCSessionDescription('offer'), function() {
            //   pc.createAnswer(function(answer) {
            //     pc.setLocalDescription(new RTCSessionDescription(answer), function() {
            //       // send the answer to a server to be forwarded back to the caller (you)
            //     }, error);
            //   }, error);
            // }, error);
            // var offer = getResponseFromFriend();
            // pc.setRemoteDescription(new RTCSessionDescription('offer'), function() { }, error);
        }
    }, [router.asPath,socket])
    useEffect(() => {
        if(socket !== null){
            //注册消息
            socket.on('1sCheckSend',(msg:any) => {
                console.log(msg)
            })
            socket.on('1sCheckReceive',(msg:any) => {
                console.log(msg)
            })
        }
    },[socket])

    return (
        <>
            <div className={styles.container}>
                <video width={200} height={400} ref={sendRef}></video>
                <video width={200} height={400} ref={receiveRef}></video>
            </div>
            <Script
                src="http://localhost:000/socket.io/socket.io.js"
                onLoad={() => {
                    const io = (window as any).io;
                    const socket = io();
                    setSocket(socket)
                }}
            />
        </>
    )
}

export default Home
