import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import styled from "styled-components";
import config from "../config/config";

const Wrapper = styled.div`
  display: block;
  margin: 0 auto;
`;

// const Extracted = styled.div`
//   white-space: pre-wrap;
// `;

export default function Viewer() {
  const webcamRef = useRef(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [extracted, setExtracted] = useState("");

  const [isPaused, setPause] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    setPause(false);
    const client_id = Date.now();
    const url = `${config.WS_SERVER}/${client_id}`;
    ws.current = new WebSocket(url);

    // console.log(url);
    // ws.current.onopen = () => console.log("ws opened");
    // ws.current.onclose = () => console.log("ws closed");

    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = (event) => {
      if (isPaused) return;
      const message = JSON.parse(event.data);
      // console.log(message);
      var text = message["extracted"];
      var img = message["processed_img"];
      setExtracted(text);
      setCapturedImg(img);
    };
  }, [isPaused]);

  function sendMessage(msg) {
    if (!ws.current) return;

    ws.current.send(msg);
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment", // Can be "environment" or "user"
    screenshotQuality: 1,
  };

  const capture = useCallback(() => {
    const capturedImg = webcamRef.current.getScreenshot();
    setCapturedImg(capturedImg);
    setExtracted("");
    const data = JSON.stringify({ data: capturedImg });
    sendMessage(data);
  }, [webcamRef]);

  return (
    <Wrapper>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="80%"
        videoConstraints={videoConstraints}
      />
      <p>
        <button onClick={capture}>Capture photo</button>
      </p>
      {capturedImg && (
        <img alt="Extracted text" src={capturedImg} width="80%" />
      )}

      <textarea
        readOnly={true}
        rows="10"
        cols="100"
        value={extracted}
      ></textarea>
    </Wrapper>
  );
}
