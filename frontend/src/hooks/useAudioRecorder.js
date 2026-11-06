
import { useCallback, useEffect, useRef, useState } from "react";

export default function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioUrlRef = useRef("");

  const clearAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = "";
    }

    setAudioUrl("");
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError("");
      setAudioBlob(null);
      setElapsed(0);
      clearAudioUrl();

      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        throw new Error(
          "Microphone recording requires a supported browser and localhost or HTTPS."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "application/octet-stream",
        });

        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);

          audioUrlRef.current = url;
          setAudioBlob(blob);
          setAudioUrl(url);
        } else {
          setError("No audio was recorded. Please try again.");
        }

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        setElapsed((seconds) => seconds + 1);
      }, 1000);
    } catch (err) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(err.message || "Could not access the microphone.");
    }
  }, [clearAudioUrl]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    clearInterval(timerRef.current);
    timerRef.current = null;
    setRecording(false);
  }, []);

  const resetRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    clearInterval(timerRef.current);
    timerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    setRecording(false);
    setAudioBlob(null);
    setElapsed(0);
    setError("");
    clearAudioUrl();
  }, [clearAudioUrl]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);

      if (recorderRef.current?.state === "recording") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  return {
    recording,
    audioUrl,
    audioBlob,
    elapsed,
    error,
    setError,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
