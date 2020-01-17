import React, { useState, useEffect, useRef } from 'react';

import { storiesOf } from '@storybook/react';
import { range } from 'lodash';
import { Hangman } from './Hangman';
import { randomWord } from './Words.js';

const HangmanContainer = props => {
  return <div {...props} style={{ width: '350px', ...props.style }}></div>;
};

const HangmanCycle = () => {
  const guessCounts = range(0, 11);
  const timeoutRef = useRef();
  const [currentGuessCountIndex, setCurrentGuessCountIndex] = useState(0);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      const nextIndex = currentGuessCountIndex + 1;
      setCurrentGuessCountIndex(nextIndex > guessCounts.length - 1 ? 0 : nextIndex);
    }, 500);

    return () => clearInterval(timeoutRef.current);
  }, [currentGuessCountIndex, guessCounts.length]);

  const incorrectGuessCount = guessCounts[currentGuessCountIndex];

  return (
    <HangmanContainer>
      <p>Incorrect Guesses: {incorrectGuessCount}</p>

      <Hangman incorrectGuessCount={incorrectGuessCount}></Hangman>
    </HangmanContainer>
  );
};

const ReactHangman = () => {
  function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
  }
  const forceUpdate = useForceUpdate();
  const [answer, setAnswer] = useState(randomWord());
  const [maxIncorrect, setMaxIncorrect] = useState(10);
  const [incorrect, setIncorrect] = useState(0);
  const [guessed, setGuessed] = useState(new Set([]));

  const handleGuess = e => {
    let letter = e.target.value;
    setIncorrect(incorrect + (answer.includes(letter) ? 0 : 1));
    setGuessed(guessed.add(letter));
    forceUpdate();
  };

  const guessedWord = () => {
    return answer.split('').map(letter => (guessed.has(letter) ? letter : ' _ '));
  };

  console.log(answer, 'answ');
  const gameOver = incorrect >= maxIncorrect;
  const isWinner = guessedWord().join('') === answer;

  const generateLetters = () => {
    return 'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
      <button
        className="btn letter-btn"
        key={letter}
        value={letter}
        onClick={handleGuess}
        disabled={guessed.has(letter)}
      >
        {letter}
      </button>
    ));
  };
  let gameLetters = generateLetters();

  if (isWinner) {
    gameLetters = 'You Won!!!';
  }

  if (gameOver) {
    gameLetters = 'Not this time, try again!!!';
  }
  const resetButton = () => {
    setIncorrect(0);
    setGuessed(new Set([]));
    setAnswer(randomWord());
  };

  return (
    <HangmanContainer>
      <div className="hangman-wrap">
        <Hangman incorrectGuessCount={incorrect}></Hangman>
        <div className="hangman-console">
          <p>Incorrect Guesses: {incorrect} out of 10</p>
          <h2>{!gameOver ? guessedWord() : answer}</h2>
          <h2>{gameLetters}</h2>
          <button className="btn btn-reset" onClick={resetButton}>
            Reset
          </button>
        </div>
      </div>
    </HangmanContainer>
  );
};
storiesOf('Hangman', module)
  .add('Default State', () => {
    return (
      <HangmanContainer>
        <Hangman incorrectGuessCount={0}></Hangman>
      </HangmanContainer>
    );
  })
  .add('Parts Drawn', () => {
    return (
      <HangmanContainer>
        <Hangman incorrectGuessCount={8}></Hangman>
      </HangmanContainer>
    );
  })
  .add('Cycle', () => {
    return <HangmanCycle></HangmanCycle>;
  })
  .add('ReactHangman', () => {
    return <ReactHangman></ReactHangman>;
  });
