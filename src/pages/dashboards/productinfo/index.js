import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Grid
} from '@mui/material';

const ProductInfo = () => {
  const quizQuestions = [
    {
      question: "What is the capital of France?",
      type: 'single-line-text',
    },
    {
      question: "Who wrote the play 'Romeo and Juliet'?",
      options: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"],
      type: 'textarea',
    },
    {
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Venus", "Mars", "Jupiter"],
      type: 'multiple-choice',
    },
    {
      question: "In which year did Christopher Columbus first reach the Americas?",
      options: ["1492", "1776", "1865", "1620"],
      type: 'multiple-choice',
    },
  ];

  const [selectedOption, setSelectedOption] = useState(null);
  const [data,setData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [responseSent, setResponseSent] = useState({});
  const token = localStorage.getItem('accessToken');
  const [answerMissing, setAnswerMissing] = useState(false);
  const isFormFilled = data && data.length > 0;


  useEffect(() => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const existingResponse = responses.find(
      (response) => response.question === currentQuestion.question
    );

    if (existingResponse) {
      setSelectedOption(existingResponse.selectedOption);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestionIndex, responses]);

  const handleOptionSelect = (optionText) => {
    setSelectedOption(optionText);
  };

  const sendResponseToBackend = (method, question, selectedOptionText) => {
    const encodedQuestion = encodeURIComponent(question);
    const endpoint =
      method === 'PATCH'
        ? `http://localhost:8000/userresponses/${encodedQuestion}`
        : 'http://localhost:8000/userresponses';

    fetch(endpoint, {
      method: method,
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        selectedOption: selectedOptionText,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setResponseSent((prevState) => ({
          ...prevState,
          [question]: true,
        }));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      const currentQuestion = quizQuestions[currentQuestionIndex];
      const response = {
        question: currentQuestion.question,
        selectedOption: selectedOption,
      };

      // Check if the selected option is not null
      if (selectedOption !== null) {
        setResponses([...responses, response]);
        setAnswerMissing(false); // Reset the missing answer flag

        const questionExistsInDatabase = responseSent[currentQuestion.question];
        const method = questionExistsInDatabase ? 'PATCH' : 'POST';
        sendResponseToBackend(method, currentQuestion.question, selectedOption);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Show a message to answer the question
        setAnswerMissing(true);
      }
    } else {
      const currentQuestion = quizQuestions[currentQuestionIndex];
      const response = {
        question: currentQuestion.question,
        selectedOption: selectedOption,
      };

      // Check if the selected option is not null
      if (selectedOption !== null) {
        setResponses([...responses, response]);
        setAnswerMissing(false); // Reset the missing answer flag

        const questionExistsInDatabase = responseSent[currentQuestion.question];
        const method = questionExistsInDatabase ? 'PATCH' : 'POST';
        sendResponseToBackend(method, currentQuestion.question, selectedOption);
        setSubmitted(true);
      } else {
        // Show a message to answer the question
        setAnswerMissing(true);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleDeleteFormData = () => {
    // Make an API call to delete the user's responses
    axios
      .delete('http://localhost:8000/userresponses', {
        headers: {
          'Authorization': `${token}`,
        },
      })
      .then((response) => {
        // Handle the successful deletion of data
        console.log('Data deleted successfully');
        // You may want to reset relevant state variables here
        setResponses([]);
        setData([]);
        setSubmitted(false);
        setResponseSent({});
      })
      .catch((error) => {
        console.error('Error deleting user responses:', error);
      });
  };
//   console.log(data);

  useEffect(() => {
    axios
      .get('http://localhost:8000/userresponses', {
        headers: {
          'Authorization': `${token}`,
        },
      })
      .then((response) => {
        // console.log('User responses:', response.data);
        setData(response.data)
      })
      .catch((error) => {
        console.error('Error retrieving user responses:', error);
      });
  }, [token]);

  const renderInput = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];

    switch (currentQuestion.type) {
      case 'single-line-text':
        return (
          <TextField
            variant="outlined"
            value={selectedOption || ''}
            onChange={(e) => handleOptionSelect(e.target.value)}
            label="Type your answer here"
            required
          />
        );
      case 'textarea':
        return (
          <TextField
            value={selectedOption || ''}
            onChange={(e) => handleOptionSelect(e.target.value)}
            placeholder="Type your answer here"
            rows={4}
            multiline
            required
          />
        );
      case 'multiple-choice':
        return (
          <FormControl component="fieldset">
            <FormLabel component="legend">{currentQuestion.question}</FormLabel>
            <RadioGroup
              name="option"
              value={selectedOption}
              onChange={(e) => handleOptionSelect(e.target.value)}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      default:
        return null;
    }
  };

  const renderQuestionContent = () => {
    if (submitted) {
      return (
        <div className="submitted-message">
          <Typography variant="h5">Thank you for submitting your responses!</Typography>
        </div>
      );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Typography variant="h6" marginTop={'20px'}>{currentQuestion.question}</Typography>
        </Grid>
        <Grid item>
          <div className="options">{renderInput()}</div>
        </Grid>
        {answerMissing && (
          <Grid item>
            <Typography variant="body2" color="error">
              Please answer this question before proceeding.
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Grid container spacing={2}>
            {currentQuestionIndex > 0 && (
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePreviousQuestion}
                >
                  Back
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <div>
    <Typography variant="h3">Quiz App</Typography>
    {isFormFilled ? (
      <div className="submitted-message">
        <Typography variant="h5">You have already filled the form. Thank you for your responses!</Typography>
        <Button variant="contained" color="primary" onClick={handleDeleteFormData}>Fill Again</Button>
      </div>
    ) : (
      renderQuestionContent()
    )}
  </div>
  );
};

export default ProductInfo;
