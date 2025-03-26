import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QuizGame.css';
import { Button, Card, Modal, Form, Container, Row, Col } from 'react-bootstrap';

const QuizGame = () => {
  useEffect(() => {
    document.title = 'Quiz Võ Phạm Diễm Quỳnh';
  }, []);

  const [customQuestions, setCustomQuestions] = useState([
    {
      question: 'What is it?',
      correctAnswer: 'The park',
      answerType: 'Okay!',
      image: '/vpdq3.png',
    },
    {
      question: 'What is it?',
      correctAnswer: `It's a movie theater.`,
      answerType: 'Okay!',
      image: '/vpdq1.png',
    },
    {
      question: "The supermarket is_____the hotel and the swimming pool.",
      correctAnswer: 'Between',
      answerType: 'Okay!',
      image: '/qnew.png',
    },
    {
      question: 'What is it?',
      correctAnswer: `It's a department store`,
      answerType: 'Okay!',
      image: '/vpdq4.png',
    },
    {
      question: 'Where is next to the supermarket?',
      correctAnswer: 'The library',
      answerType: 'Okay!',
      image: '/vpdq5.png',
    },
    {
      question: 'The park is .... the supermarket',
      correctAnswer: 'Across from',
      answerType: 'Okay!',
      image: '/vpdq6.png',
    },
  ]);

  const [gameSetup, setGameSetup] = useState({
    teams: [],
    currentTeam: 0,
    scores: {},
    isGameStarted: false
  });

  const [gameBoard, setGameBoard] = useState({
    tiles: [],
    tilesState: {},
    selectedTile: null
  });

  const [modals, setModals] = useState({
    questionInput: true,
    currentQuestion: false,
    mysteryBag: false,
    gameOver: false
  });

  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const handleQuestionInput = (index, field, value) => {
    const newQuestions = [...customQuestions];
    newQuestions[index][field] = value;
    setCustomQuestions(newQuestions);
  };

  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newQuestions = [...customQuestions];
      newQuestions[index].image = imageUrl;
      setCustomQuestions(newQuestions);
    }
  };

  const createGameBoard = () => {
    const questionTiles = customQuestions.map((q, index) => ({
      id: index + 1,
      type: 'question',
      ...q
    }));

    const mysteryBags = [
      { id: 7, type: 'powerup', effect: 10 },
      { id: 8, type: 'powerup', effect: 5 }
    ];

    const allTiles = shuffleArray([...questionTiles, ...mysteryBags]);
    const finalTiles = allTiles.slice(0, 8);

    const tilesState = finalTiles.reduce((acc, tile) => ({
      ...acc,
      [tile.id]: false
    }), {});

    setGameBoard({
      tiles: finalTiles,
      tilesState,
      selectedTile: null
    });
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    const allQuestionsValid = customQuestions.every(q =>
      q.question.trim() !== '' && q.correctAnswer.trim() !== ''
    );

    if (!allQuestionsValid) {
      alert('Please fill in all questions and answers!');
      return;
    }

    const initialTeams = gameSetup.teams.length > 0
      ? gameSetup.teams
      : ['Team 1', 'Team 2'];

    setGameSetup(prev => ({
      ...prev,
      teams: initialTeams,
      currentTeam: 0,
      scores: initialTeams.reduce((acc, team) => ({ ...acc, [team]: 0 }), {}),
      isGameStarted: true
    }));

    createGameBoard();
    setModals(prev => ({ ...prev, questionInput: false }));
  };

  const selectTile = (tileId) => {
    const selectedTile = gameBoard.tiles.find(t => t.id === tileId);

    setGameBoard(prev => ({
      ...prev,
      tilesState: {
        ...prev.tilesState,
        [tileId]: true
      },
      selectedTile
    }));

    if (selectedTile.type === 'question') {
      setModals(prev => ({ ...prev, currentQuestion: true }));
      setIsAnswerRevealed(false);
    } else {
      setModals(prev => ({ ...prev, mysteryBag: true }));
    }
  };

  const handleMysteryBag = () => {
    const { currentTeam, teams, scores } = gameSetup;
    const currentTeamName = teams[currentTeam];
    const nextTeamIndex = (currentTeam + 1) % teams.length;
    const effect = gameBoard.selectedTile.effect;

    const newScores = { ...scores };
    newScores[currentTeamName] += effect;

    setGameSetup(prev => ({
      ...prev,
      currentTeam: nextTeamIndex,
      scores: newScores
    }));

    setModals(prev => ({ ...prev, mysteryBag: false }));
    setGameBoard(prev => ({ ...prev, selectedTile: null }));
  };

  const revealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const selectAnswer = (playerChoice) => {
    const { currentTeam, teams, scores } = gameSetup;
    const currentTeamName = teams[currentTeam];
    const nextTeamIndex = (currentTeam + 1) % teams.length;

    const newScores = { ...scores };
    const correctAnswerType = gameBoard.selectedTile.answerType;

    if (playerChoice === correctAnswerType && playerChoice === 'Okay!') {
      const randomPoints = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
      newScores[currentTeamName] += randomPoints;
    }

    setGameSetup(prev => ({
      ...prev,
      currentTeam: nextTeamIndex,
      scores: newScores
    }));

    setModals(prev => ({ ...prev, currentQuestion: false }));
    setGameBoard(prev => ({ ...prev, selectedTile: null }));
    setIsAnswerRevealed(false);
  };

  const resetGame = () => {
    createGameBoard();
    setGameSetup(prev => ({
      ...prev,
      currentTeam: 0,
      scores: prev.teams.reduce((acc, team) => ({ ...acc, [team]: 0 }), {})
    }));
    setModals(prev => ({
      ...prev,
      currentQuestion: false,
      mysteryBag: false,
      gameOver: false
    }));
  };

  const endGame = () => {
    setModals(prev => ({ ...prev, gameOver: true }));
  };

  const getWinningTeam = () => {
    const scores = gameSetup.scores;
    const teams = Object.entries(scores);
    if (teams.length === 0) return null;
    const winner = teams.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );
    return winner[0];
  };

  return (
    <Container fluid className="quiz-container">
      {/* Question Input Modal */}
      <Modal
        show={modals.questionInput}
        onHide={() => setModals(prev => ({ ...prev, questionInput: false }))}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>🎉 Enter Questions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customQuestions.map((q, index) => (
            <div key={index} className="question-input mb-4">
              <Form.Group className="mb-3">
                <Form.Label>Question {index + 1}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder={`Enter question ${index + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionInput(index, 'question', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Correct Answer</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={`Enter correct answer ${index + 1}`}
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionInput(index, 'correctAnswer', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Image (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                />
                {q.image && (
                  <div className="mt-2">
                    <img src={q.image} alt={`Preview ${index + 1}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                  </div>
                )}
              </Form.Group>
              <Form.Group>
                <Form.Label>Answer Type</Form.Label>
                <Form.Select
                  value={q.answerType}
                  onChange={(e) => handleQuestionInput(index, 'answerType', e.target.value)}
                >
                  <option value="Okay!">Okay!</option>
                  <option value="Oops!">Oops!</option>
                </Form.Select>
              </Form.Group>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="btn-custom" onClick={startGame}>
            Create Game
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Game Interface */}
      {gameSetup.isGameStarted && (
        <>
          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Button
                variant="success"
                className="btn-custom"
                onClick={() => setModals(prev => ({ ...prev, questionInput: true }))}
              >
                Enter New Questions
              </Button>
              <Button variant="danger" className="btn-custom" onClick={endGame}>
                End Game
              </Button>
              <Button variant="secondary" className="btn-custom" onClick={resetGame}>
                Refresh
              </Button>
            </Col>
          </Row>

          <Row className="row-cols-4 g-4">
            {gameBoard.tiles.map(tile => (
              <Col key={tile.id} className="d-flex justify-content-center">
                <Button
                  variant={gameBoard.tilesState[tile.id] ? "secondary" : "outline-dark"}
                  onClick={() => selectTile(tile.id)}
                  disabled={gameBoard.tilesState[tile.id]}
                  className="tile-btn"
                >
                  {tile.id}
                </Button>
              </Col>
            ))}
          </Row>

          <Row className="mt-4">
            {gameSetup.teams.map((team, index) => (
              <Col key={team}>
                <Card className={`team-card ${gameSetup.currentTeam === index ? 'active animate__animated animate__pulse' : ''}`}>
                  <Card.Header>
                    {team}: {gameSetup.scores[team]} points
                  </Card.Header>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Current Question Modal */}
      <Modal show={modals.currentQuestion} onHide={() => setModals(prev => ({ ...prev, currentQuestion: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Question {gameBoard.selectedTile?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {gameBoard.selectedTile && (
            <>
              <div className="text-center mb-4">
                {gameBoard.selectedTile.image && (
                  <img src={gameBoard.selectedTile.image} alt="Question" className="mb-3" style={{ maxWidth: '300px', maxHeight: '300px' }} />
                )}
                <p className="h5">{gameBoard.selectedTile.question}</p>
                {isAnswerRevealed && (
                  <p className="text-success mt-2">Correct answer: {gameBoard.selectedTile.correctAnswer}</p>
                )}
              </div>
              {!isAnswerRevealed ? (
                <div className="text-center">
                  <Button variant="primary" className="btn-custom" onClick={revealAnswer}>
                    Check
                  </Button>
                </div>
              ) : (
                <Row>
                  <Col>
                    <Button
                      variant="outline-success"
                      className="btn-custom w-100"
                      onClick={() => selectAnswer('Okay!')}
                    >
                      Okay!
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      variant="outline-danger"
                      className="btn-custom w-100"
                      onClick={() => selectAnswer('Oops!')}
                    >
                      Oops!
                    </Button>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Mystery Bag Modal */}
      <Modal show={modals.mysteryBag} onHide={() => setModals(prev => ({ ...prev, mysteryBag: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Mystery Bag {gameBoard.selectedTile?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <p className="h5">Effect: +{gameBoard.selectedTile?.effect} points</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="btn-custom" onClick={handleMysteryBag}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Game Over Modal */}
      <Modal show={modals.gameOver} onHide={() => setModals(prev => ({ ...prev, gameOver: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Game Over</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <p className="winner-text">Congratulations {getWinningTeam()} has won! 😊</p>
          </div>
          {Object.entries(gameSetup.scores).map(([team, score]) => (
            <div key={team} className="d-flex justify-content-between mb-2">
              <span>{team}</span>
              <span>{score} points</span>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-custom" onClick={() => setModals(prev => ({ ...prev, gameOver: false }))}>
            Close
          </Button>
          <Button variant="primary" className="btn-custom" onClick={resetGame}>
            Play Again
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default QuizGame;