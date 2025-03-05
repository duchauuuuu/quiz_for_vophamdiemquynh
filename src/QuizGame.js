import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QuizGame.css';
import { Button, Card, Modal, Form, Container, Row, Col } from 'react-bootstrap';

const QuizGame = () => {
    useEffect(() => {
        document.title = 'Quiz Võ Phạm Diễm Quỳnh';
      }, []); // Mảng rỗng để chỉ chạy một lần khi component mount
  const [customQuestions, setCustomQuestions] = useState(
    Array.from({ length: 8 }, () => ({ 
      question: '', 
      correctAnswer: '',
      answerType: 'Okay!' 
    }))
  );

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

  const createGameBoard = () => {
    const questionTiles = customQuestions.map((q, index) => ({
      id: index + 1,
      type: 'question',
      ...q
    }));

    const mysteryBags = Array.from({ length: 8 }, (_, i) => ({
      id: i + 9,
      type: 'powerup',
      effect: [2, -1, 1, 0, 3, -2, 2, 'swap'][i]
    }));

    const allTiles = shuffleArray([...questionTiles, ...mysteryBags]);
    const finalTiles = allTiles.slice(0, 16);

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
      alert('Vui lòng điền đầy đủ câu hỏi và câu trả lời!');
      return;
    }

    const initialTeams = gameSetup.teams.length > 0 
      ? gameSetup.teams 
      : ['Đội 1', 'Đội 2'];

    setGameSetup(prev => ({
      ...prev,
      teams: initialTeams,
      currentTeam: 0,
      scores: initialTeams.reduce((acc, team) => ({...acc, [team]: 0}), {}),
      isGameStarted: true
    }));

    createGameBoard();
    setModals(prev => ({...prev, questionInput: false}));
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
      setModals(prev => ({...prev, currentQuestion: true}));
      setIsAnswerRevealed(false);
    } else {
      setModals(prev => ({...prev, mysteryBag: true}));
    }
  };

  const handleMysteryBag = () => {
    const { currentTeam, teams, scores } = gameSetup;
    const currentTeamName = teams[currentTeam];
    const nextTeamIndex = (currentTeam + 1) % teams.length;
    const effect = gameBoard.selectedTile.effect;

    const newScores = {...scores};
    if (effect === 'swap') {
      const teamNames = Object.keys(newScores);
      if (teamNames.length > 1) {
        const [team1, team2] = teamNames;
        [newScores[team1], newScores[team2]] = [newScores[team2], newScores[team1]];
      }
    } else {
      newScores[currentTeamName] += effect;
    }

    setGameSetup(prev => ({
      ...prev,
      currentTeam: nextTeamIndex,
      scores: newScores
    }));

    setModals(prev => ({...prev, mysteryBag: false}));
    setGameBoard(prev => ({...prev, selectedTile: null}));
  };

  const revealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const selectAnswer = (isCorrect) => {
    const { currentTeam, teams, scores } = gameSetup;
    const currentTeamName = teams[currentTeam];
    const nextTeamIndex = (currentTeam + 1) % teams.length;

    const newScores = {...scores};
    if (isCorrect) {
      newScores[currentTeamName] += 1;
    }

    setGameSetup(prev => ({
      ...prev,
      currentTeam: nextTeamIndex,
      scores: newScores
    }));

    setModals(prev => ({...prev, currentQuestion: false}));
    setGameBoard(prev => ({...prev, selectedTile: null}));
    setIsAnswerRevealed(false);
  };

  const resetGame = () => {
    createGameBoard();
    setGameSetup(prev => ({
      ...prev,
      currentTeam: 0,
      scores: prev.teams.reduce((acc, team) => ({...acc, [team]: 0}), {})
    }));
    setModals(prev => ({
      ...prev,
      currentQuestion: false,
      mysteryBag: false,
      gameOver: false
    }));
  };

  const endGame = () => {
    setModals(prev => ({...prev, gameOver: true}));
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
      <Modal show={modals.questionInput} backdrop="static" keyboard={false} size="lg">
        <Modal.Header>
          <Modal.Title>Nhập Câu Hỏi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customQuestions.map((q, index) => (
            <div key={index} className="question-input">
              <Form.Group className="mb-3">
                <Form.Label>Câu Hỏi {index + 1}</Form.Label>
                <Form.Control 
                  as="textarea"
                  rows={2}
                  placeholder={`Nhập câu hỏi ${index + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionInput(index, 'question', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Câu Trả Lời Đúng</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder={`Nhập câu trả lời đúng ${index + 1}`}
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionInput(index, 'correctAnswer', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Loại Đáp Án</Form.Label>
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
            Tạo Trò Chơi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Game Interface */}
      {gameSetup.isGameStarted && (
        <>
          <Row className="mb-4">
            <Col className="d-flex justify-content-between">
              <Button 
                variant="success" 
                className="btn-custom" 
                onClick={() => setModals(prev => ({...prev, questionInput: true}))}
              >
                Nhập Câu Hỏi Mới
              </Button>
              <Button variant="danger" className="btn-custom" onClick={endGame}>
                Kết Thúc Trò Chơi
              </Button>
              <Button variant="secondary" className="btn-custom" onClick={resetGame}>
                Làm Mới
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
                <Card className={`team-card ${gameSetup.currentTeam === index ? 'active' : ''}`}>
                  <Card.Header>
                    {team}: {gameSetup.scores[team]} điểm
                  </Card.Header>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Current Question Modal */}
      <Modal show={modals.currentQuestion} onHide={() => setModals(prev => ({...prev, currentQuestion: false}))}>
        <Modal.Header closeButton>
          <Modal.Title>Câu Hỏi {gameBoard.selectedTile?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {gameBoard.selectedTile && (
            <>
              <div className="text-center mb-4">
                <p className="h5">{gameBoard.selectedTile.question}</p>
                {isAnswerRevealed && (
                  <p className="text-success mt-2">Đáp án đúng: {gameBoard.selectedTile.correctAnswer}</p>
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
                      onClick={() => selectAnswer(gameBoard.selectedTile.answerType === 'Okay!')}
                    >
                      Okay!
                    </Button>
                  </Col>
                  <Col>
                    <Button 
                      variant="outline-danger" 
                      className="btn-custom w-100"
                      onClick={() => selectAnswer(gameBoard.selectedTile.answerType === 'Oops!')}
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
      <Modal show={modals.mysteryBag} onHide={() => setModals(prev => ({...prev, mysteryBag: false}))}>
        <Modal.Header closeButton>
          <Modal.Title>Túi Mù {gameBoard.selectedTile?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <p className="h5">
              Hiệu ứng: {gameBoard.selectedTile?.effect === 'swap' 
                ? 'Hoán đổi điểm số giữa các đội' 
                : `${gameBoard.selectedTile?.effect > 0 ? '+' : ''}${gameBoard.selectedTile?.effect} điểm`}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="btn-custom" onClick={handleMysteryBag}>
            Xác Nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Game Over Modal */}
      <Modal show={modals.gameOver} onHide={() => setModals(prev => ({...prev, gameOver: false}))}>
        <Modal.Header closeButton>
          <Modal.Title>Kết Thúc Trò Chơi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <p className="winner-text">Chúc mừng {getWinningTeam()} đã chiến thắng!</p>
          </div>
          {Object.entries(gameSetup.scores).map(([team, score]) => (
            <div key={team} className="d-flex justify-content-between mb-2">
              <span>{team}</span>
              <span>{score} điểm</span>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-custom" onClick={() => setModals(prev => ({...prev, gameOver: false}))}>
            Đóng
          </Button>
          <Button variant="primary" className="btn-custom" onClick={resetGame}>
            Chơi Lại
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default QuizGame;