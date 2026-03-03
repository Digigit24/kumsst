import React from "react";
import styled from "@emotion/styled";

const CardCloud = () => {
  return (
    <StyledWrapper>
      <div className="card-time-cloud">
        <div className="card-time-cloud-front" />
        <div className="card-time-cloud-back">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#FFFFFF"
              d="M32.4,-41C45.2,-42.2,61,-38.6,63.9,-29.9C66.8,-21.2,56.8,-7.2,47.5,1.7C38.2,10.6,29.6,14.4,26.3,28.4C22.9,42.3,24.7,66.4,18.4,73C12,79.7,-2.5,68.8,-19.2,64.4C-35.9,60,-54.8,61.9,-56.2,52.9C-57.7,43.8,-41.7,23.7,-37.5,9.4C-33.3,-5,-41,-13.6,-44.4,-26.2C-47.8,-38.7,-47,-55.2,-38.9,-56.2C-30.7,-57.2,-15.4,-42.7,-2.8,-38.3C9.8,-34,19.6,-39.8,32.4,-41Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
        <div className="card-time-cloud-notif-group">
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
          <div className="card-time-cloud-notif" />
        </div>
        <p className="card-time-cloud-day">Monday</p>
        <p className="card-time-cloud-day-number">3/5/2025</p>
        <p className="card-time-cloud-hour">20:54</p>
        <div className="card-time-cloud-icon">
          <svg
            strokeWidth="0.6"
            stroke="#d3d3d3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="30px"
            width="30px"
          >
            <g strokeWidth={0} id="SVGRepo_bgCarrier" />
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              id="SVGRepo_tracerCarrier"
            />
            <g id="SVGRepo_iconCarrier">
              <path
                fill="#88878d"
                d="M12 2C7.58 2 4 5.58 4 10v4.17l-1.71 1.71A1 1 0 0 0 3 17.59V18a1 1 0 0 0 1 1h5a3 3 0 0 0 6 0h5a1 1 0 0 0 1-1v-.41a1 1 0 0 0-.29-.71L19 15.17V10c0-4.42-3.58-8-8-8zm0 18a1 1 0 0 1-1-1h2a1 1 0 0 1-1 1zm7-4l1 1H4l1-1V10c0-3.87 3.13-7 7-7s7 3.13 7 7v6z"
                clipRule="evenodd"
                fillRule="evenodd"
              />
            </g>
          </svg>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card-time-cloud {
    position: relative;
    border-radius: 1em;
    width: 17.5em;
    height: 7.5em;
    z-index: 2;
    border: solid 0.1em lightgrey;
    transition: 0.5s all ease-in-out;
    box-shadow: 0em 0em rgb(0, 0, 0, 0.25);
    overflow: hidden;
  }

  .card-time-cloud-front {
    width: 20em;
    height: 12.5em;
    background: lightgray;
    border-radius: 1em;
    position: absolute;
    z-index: 2;
    top: 95%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 0.5s all ease-in-out;
  }

  .card-time-cloud-back {
    width: 20em;
    height: 12.5em;
    background: rgb(136, 135, 141);
    border-radius: 1em;
    position: absolute;
    z-index: 1;
    top: 57.5%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 0.5s all ease-in-out;
  }

  .card-time-cloud:hover {
    height: 14em;
    margin-bottom: 1em;
    box-shadow: 0em 1em rgb(0, 0, 0, 0.25);
  }

  .card-time-cloud:hover .card-time-cloud-front {
    top: 105%;
  }

  .card-time-cloud:hover .card-time-cloud-back {
    filter: blur(1em);
  }

  .card-time-cloud-back svg {
    position: absolute;
    z-index: 1;
    top: -5em;
    left: -2.5em;
    width: 25em;
    height: auto;
    opacity: 50%;
    animation: rotate-cloud 15s linear infinite;
    filter: blur(1.5em);
  }

  @keyframes rotate-cloud {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Notification dots replacing rain */
  .card-time-cloud-notif {
    width: 0.5em;
    height: 0.5em;
    background: rgba(211, 211, 211, 0.7);
    border-radius: 50%;
    z-index: 1;
    position: absolute;
    bottom: -2em;
    opacity: 0;
  }

  .card-time-cloud-notif:nth-child(1) {
    left: 1em;
  }
  .card-time-cloud-notif:nth-child(2) {
    left: 3em;
    width: 0.4em;
    height: 0.4em;
  }
  .card-time-cloud-notif:nth-child(3) {
    left: 5em;
  }
  .card-time-cloud-notif:nth-child(4) {
    left: 7em;
    width: 0.35em;
    height: 0.35em;
  }
  .card-time-cloud-notif:nth-child(5) {
    left: 9em;
  }
  .card-time-cloud-notif:nth-child(6) {
    left: 11em;
    width: 0.45em;
    height: 0.45em;
  }
  .card-time-cloud-notif:nth-child(7) {
    left: 13em;
  }
  .card-time-cloud-notif:nth-child(8) {
    left: 15em;
    width: 0.4em;
    height: 0.4em;
  }
  .card-time-cloud-notif:nth-child(9) {
    left: 4em;
    width: 0.35em;
    height: 0.35em;
  }
  .card-time-cloud-notif:nth-child(10) {
    left: 12em;
  }

  .card-time-cloud:hover .card-time-cloud-notif {
    animation: notif-float 2s ease-out infinite;
  }

  @keyframes notif-float {
    0% {
      bottom: -1em;
      opacity: 0;
      transform: scale(0.5);
    }
    20% {
      opacity: 0.7;
      transform: scale(1);
    }
    100% {
      bottom: 14em;
      opacity: 0;
      transform: scale(0.3);
    }
  }

  .card-time-cloud:hover .card-time-cloud-notif:nth-child(2),
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(6) {
    animation: notif-float 2s ease-out infinite 0.3s;
  }
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(3),
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(7) {
    animation: notif-float 2s ease-out infinite 0.6s;
  }
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(4),
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(8) {
    animation: notif-float 2s ease-out infinite 0.45s;
  }
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(5),
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(9) {
    animation: notif-float 2s ease-out infinite 0.8s;
  }
  .card-time-cloud:hover .card-time-cloud-notif:nth-child(10) {
    animation: notif-float 2s ease-out infinite 1.1s;
  }

  /* Text elements */
  .card-time-cloud-day {
    color: rgb(136, 135, 141);
    position: absolute;
    z-index: 3;
    top: 1.25em;
    left: 0.5em;
    font-size: 1.5em;
    font-weight: bold;
    transition: 0.5s all ease-in-out;
  }

  .card-time-cloud-day-number {
    color: rgb(136, 135, 141);
    position: absolute;
    z-index: 3;
    top: 3em;
    left: 0.65em;
    font-size: 1.25em;
    transition: 0.5s all ease-in-out;
    font-weight: 500;
  }

  .card-time-cloud-hour {
    color: rgb(136, 135, 141);
    position: absolute;
    z-index: 3;
    top: 1.25em;
    right: 0.5em;
    font-size: 1.5em;
    font-weight: bold;
    transition: 0.5s all ease-in-out;
  }

  .card-time-cloud:hover .card-time-cloud-hour {
    top: 0.5em;
    font-size: 3em;
  }

  .card-time-cloud:hover .card-time-cloud-day,
  .card-time-cloud:hover .card-time-cloud-day-number,
  .card-time-cloud:hover .card-time-cloud-hour {
    color: #4a4b55;
  }

  /* Bell icon */
  .card-time-cloud-icon svg {
    position: absolute;
    z-index: 4;
    top: 4em;
    right: 0.6em;
    transform: rotate(0deg);
    width: 1.5em;
    height: auto;
    transition: 0.5s all ease-in-out;
  }

  .card-time-cloud:hover .card-time-cloud-icon svg {
    top: 7.25em;
    right: -1.75em;
    width: 7.5em;
    height: auto;
    transform: rotate(-35deg);
  }

  /* Active / press state */
  .card-time-cloud:active {
    transition: 0.25s all ease-in-out;
    transform: scale(0.95);
  }

  .card-time-cloud:active .card-time-cloud-front {
    transition: 0.25s all ease-in-out;
    top: 120%;
    background-color: #4a4b55;
  }

  .card-time-cloud:active .card-time-cloud-icon svg {
    transition: 0.25s all ease-in-out;
    top: 8em;
    transform: rotate(-25deg);
    stroke: #4a4b55;
  }
`;

export default CardCloud;
