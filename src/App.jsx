import './App.css';
import React, { useState, useEffect } from "react";
import { Navbar, Container, Modal, Row, Col, Button, Alert } from 'react-bootstrap';
import { fetchCordinates, startSession, endSession, saveUsernameAndDuration, getAllUserDurations} from './apiService';


function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [clickedCoordinates, setClickedCoordinates] = useState({ x: 0, y: 0 });
   const [modalData, setModalData] = useState([
    { characterName: 'Black Goat' },
    { characterName: 'Homer' },
    { characterName: 'DeathNote' }
  ]);
  const [sessionDuration, setSessionDuration] = useState(null);
 const [intervalId, setIntervalId] = useState(null);
  const [startTime, setStartTime] = useState(null);
 const [show, setShow] = useState(true);

  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [leaderboards, setLeaderboards] = useState([]);
  const [showLeaderboardsModal, setShowLeaderboardsModal] = useState(false);


const handleClose = () => setShow(false);




useEffect(() => {
    // Start session when the component mounts
    const initiateSession = async () => {
      try {
        const response = await startSession(new Date());
        console.log(response.session_id)
        setStartTime(new Date());
      } catch (error) {
        console.error('Error starting session:', error);
      }
    };

    initiateSession();
    return () => {
      // Optionally, end the session here if needed
    };
  }, []); 

   useEffect(() => {
    // Update duration every second
    const interval = setInterval(() => {
      if (startTime) {
        const now = new Date();
        const elapsedMilliseconds = now - startTime;
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
        setSessionDuration(elapsedSeconds);
      }
    }, 1000);
     setIntervalId(interval);
    // Clean up function to clear the interval when the component unmounts or when the session ends
    return () => clearInterval(interval);
  }, [startTime]);




  const handleEndSession = async () => {
    if (intervalId) {
      clearInterval(intervalId); // Clear the interval
    }
   
    if (startTime) {
      try {
        setShowUsernameModal(true);
        await endSession(new Date());
        
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
  };


const handleSaveScore = async () => {
  try {
    await saveUsernameAndDuration(username, sessionDuration);
    // Optionally, you can reset the state variables here
    setUsername('');
    setShowUsernameModal(false);
  } catch (error) {
    console.error('Error saving score:', error);
  }
};


 const fetchLeaderboardData = async () => {
    try {
      const response = await getAllUserDurations();
      // Sort leaderboards by time in ascending order
      response.sort((a, b) => a.duration - b.duration);
      setLeaderboards(response);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  useEffect(() => {
    if (showLeaderboardsModal) {
      fetchLeaderboardData();
    }
  }, [showLeaderboardsModal]);



















function normalizeCoordinates(rawX, rawY) {
  // Viewport dimensions
  const viewportWidth = window.innerWidth; // Width of the viewport in pixels
  const viewportHeight = window.innerHeight; // Height of the viewport in pixels

  // Image dimensions (replace these with the actual dimensions of your image)
  const imageWidth = 235; // Width of the image in pixels
  const imageHeight = 993; // Height of the image in pixels

  // Calculate the aspect ratio of the image
  const aspectRatio = imageWidth / imageHeight;

  // Calculate the height of the container based on the aspect ratio and viewport width
  const containerHeight = viewportWidth / aspectRatio;

  // Normalize X coordinate
  const normalizedX = rawX / viewportWidth;

  // Normalize Y coordinate
  const normalizedY = rawY / containerHeight;

  return { x: normalizedX, y: normalizedY };
}








  useEffect(() => {
  const handleScroll = () => {
    setScrollPosition(window.scrollY);
  };
  // console.log('Scroll Position:', window.scrollY);
  //     console.log('Modal Top:', modalTop);
  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

const handleCharacterClick = async (characterName, index) => {
  const { x, y } = clickedCoordinates;
  const normalizedCoordinates = normalizeCoordinates(x, y);

  try {
    // Fetch correct data from the backend
    const correctData = await fetchCordinates();
    

    // Iterate over each character's data
    for (const data of correctData) {
      
      // Check if the clicked coordinates match the character's coordinates
      if (
        data.characterName === characterName &&
        areCoordinatesClose(normalizedCoordinates, data.xCoordinate, data.yCoordinate)
      ) {
        // Match found, do something (e.g., show a message, update UI)
        console.log(`Character ${characterName} found at coordinates (${normalizedCoordinates.x}, ${normalizedCoordinates.y})`);
        const updatedData = [...modalData];
    updatedData.splice(index, 1); // Remove the item at the clicked index
    setModalData(updatedData);
    console.log('Updated modal data:', updatedData);
    console.log('Modal data length:', modalData.length);

    setShowModal(false)

      if (updatedData.length === 0) {
        console.log('it is cleared!!!')
          handleEndSession();
        }
      }
    }

    // If no match is found
    console.log(`No characters found at coordinates (${normalizedCoordinates.x}, ${normalizedCoordinates.y})`);
    

  } catch (error) {
    console.error('Error fetching coordinates:', error);
  }
}

function areCoordinatesClose(coords1, coords2x, coords2y) {
  // Define a threshold for closeness (e.g., 10 pixels)
  const threshold = 0.02;
  console.log('Cordinates:' ,coords1, coords2x, coords2y)
  // Calculate the distance between the two sets of coordinates
  const distance = Math.sqrt(
    Math.pow(coords1.x - coords2x, 2) + Math.pow(coords1.y - coords2y, 2)
  );
   console.log(distance)
  // Return true if the distance is within the threshold, false otherwise
  return distance <= threshold;
}





const modalTop = position.y - 50 - scrollPosition;

  const handlePageClick = (event) => {
    console.log("Clicked at coordinates:", event.pageX, event.pageY, window.scrollY);
    setClickedCoordinates({ x: event.pageX, y: event.pageY });
    
    setShowModal(true);
  };

  const handleMouseMove = (event) => {
    setPosition({ x: event.pageX, y: event.pageY });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className='bg1'>
      <div className="waldo-container">
        <div
          className="waldo"
          onClick={handlePageClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        ></div>

   <Modal
  show={showUsernameModal}
  onHide={() => setShowUsernameModal(false)}
  contentClassName="username-modal"
>
  <Modal.Header closeButton className="username-header">
    <Modal.Title className="username-title">Congratulations! You won the game!</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Enter your username:</p>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="username-input"
    />
    <p className='mt-3'>Your score (end time): {sessionDuration} seconds</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="primary" onClick={handleSaveScore}>
      Save
    </Button>
  </Modal.Footer>
</Modal>

          <div
            className="pointer-circle"
            style={{ left: position.x - 50, top: position.y - 50 }}
          >
            <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        style={{ position: 'fixed', right: window.innerWidth - 300 - position.x + 'px'  , top: modalTop - 40 + 'px' }}
        
      >
     <Modal.Body style={{ backgroundColor: 'black', padding: '0' }}>
      {modalData.map((item, index) => (
        <Row key={index} className="modal-row" onClick={() => handleCharacterClick(item.characterName, index)}>
          <Col><h5>{item.characterName}</h5></Col>
        </Row>
      ))}
    </Modal.Body>


      </Modal>

       



          </div>
       
         
        <Navbar bg="dark" variant="dark" className='navbarZ' style={{ display: 'flex', gap: '100px' }}>
        
    <Navbar.Text style={{ fontSize: '60px', fontWeight: 'bolder', color: 'red', marginLeft: '50px',  }}>Waldo</Navbar.Text>
    <Navbar.Text  onClick={() => setShowLeaderboardsModal(true)} style={{ color: 'white', fontSize: '20px', cursor: 'pointer' }}>Leaderboards</Navbar.Text>
    <img src="deathnote.png" alt="Death Note" style={{ width: '80px', height: '70px' }} />
    <img src="homer.png" alt="Homer" style={{ width: '80px', height: '80px' }} />
    <img src="goat.png" alt="Waldo" style={{ width: '80px', height: '80px' , margin: 0}} />
    <Navbar.Text style={{ color: 'white', position: 'absolute', top: '4vh', right: '5vw' }}>Timer: {sessionDuration} seconds </Navbar.Text>
  
        </Navbar>

      











    


      </div>
     

      <Alert
        variant="dark"
        style={{
          position: 'fixed',
          top: '150px',
          left: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: '1000', // Ensure it's on top of other content
          
          
        }}
        onClose={handleClose}
        dismissible
      >
        <p>
          Welcome to Where's Waldo Game, here are a few things to guide you:
        </p>
        <ul style={{ marginBottom: '0' }}>
          <li>You need to find DeathNote, Homer, and Black Goat in this vertical labyrinth</li>
          <li>Be wary of time, try to find them quickly</li>
          <li>When you find one of the characters, click on them and select their name</li>
          <li>Check out Leaderboards to see scores of other players</li>
          <li>When you find them all, you will be able to register with your username and time</li>
            <li>Hint: All characters are above the head with 'World of Block God" section on right</li>
            <li>Click X too close this message on top right</li>
          <li>Have fun!</li>
        </ul>
      
      </Alert>
           <Modal
  show={showLeaderboardsModal}
  onHide={() => setShowLeaderboardsModal(false)}
  contentClassName="leaderboards-modal"
>
  <Modal.Header closeButton className="leaderboards-header">
    <Modal.Title className="leaderboards-title">Leaderboards</Modal.Title>
  </Modal.Header>
  <Modal.Body >
    <table className="table">
      <thead >
        <tr >
          <th className="table1">#</th>
          <th className="table1">Username</th>
          <th className="table1">Time</th>
        </tr>
      </thead>
      <tbody>
        {leaderboards.map((entry, index) => (
          <tr key={index}>
            <td className="table1">{index + 1 + '.'}</td>
            <td className="table1">{entry.username}</td>
            <td className="table1">{entry.duration} seconds</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowLeaderboardsModal(false)}>Close</Button>
  </Modal.Footer>
</Modal>

    </div>
  );
}

export default App;
