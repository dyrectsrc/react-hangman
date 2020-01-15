import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

import './Hangman.css';

/**
 * Returns an array of functions that draw each part of the Hangman on the
 * canvas, scaled according to the passed size.
 *
 * @param {Number} size
 */
const getHangmanParts = size => {
  const bodyHeight = size / 2;
  const appendageWidth = bodyHeight / 3;

  const platform = canvasContext => {
    canvasContext.lineWidth = 10;
    canvasContext.beginPath();
    canvasContext.moveTo(0, size);
    canvasContext.lineTo(size, size);
    canvasContext.stroke();
  };

  const post = canvasContext => {
    canvasContext.lineWidth = 10;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, size);
    canvasContext.stroke();
  };

  const pole = canvasContext => {
    canvasContext.lineWidth = 10;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(size / 2, 0);
    canvasContext.stroke();
  };

  const rope = canvasContext => {
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, 0);
    canvasContext.lineTo(size / 2, size / 10);
    canvasContext.stroke();
  };

  const head = canvasContext => {
    canvasContext.beginPath();
    canvasContext.arc(size / 2, size / 10 + size / 16, size / 16, 0, Math.PI * 2, true);
    canvasContext.stroke();
  };

  const body = canvasContext => {
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 10 + size / 8);
    canvasContext.lineTo(size / 2, size - bodyHeight);
    canvasContext.stroke();
  };

  const leftArm = canvasContext => {
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 3);
    canvasContext.lineTo(size / 2 - appendageWidth, size / 3);
    canvasContext.stroke();
  };

  const rightArm = canvasContext => {
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 3);
    canvasContext.lineTo(size / 2 + appendageWidth, size / 3);
    canvasContext.stroke();
  };

  const leftLeg = canvasContext => {
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size - bodyHeight);
    canvasContext.lineTo(size / 2 - appendageWidth, size - bodyHeight + appendageWidth);
    canvasContext.stroke();
  };

  const rightLeg = canvasContext => {
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size - bodyHeight);
    canvasContext.lineTo(size / 2 + appendageWidth, size - bodyHeight + appendageWidth);
    canvasContext.stroke();
  };

  return [platform, post, pole, rope, head, body, leftArm, rightArm, leftLeg, rightLeg];
};

// Helper function to prepare the canvas for drawing
const draw = (canvasContext, drawFn) => {
  canvasContext.lineWidth = 2; // Reset line width to default
  drawFn(canvasContext);
};

// Clears the canvas
const clearCanvas = canvas => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Draws the "Hangman" graphic with parts filled in according to the number of incorrect guesses.
 *
 * For example, to draw the first 5 parts of the hangman:
 *
 * ```javascript
 * <Hangman incorrectGuessCount={5} />
 * ```
 */
export const Hangman = ({ incorrectGuessCount = 0 }) => {
  const containerRef = useRef();
  const canvasRef = useRef();
  const drawnPartsRef = useRef(0);
  const previousIncorrectGuessCountRef = useRef(incorrectGuessCount);
  const [size, setSize] = useState();

  const hangmanParts = useMemo(() => getHangmanParts(size), [size]);

  // Resizes the canvas based on its parent's width
  const resizeCanvas = useCallback(() => {
    const style = getComputedStyle(containerRef.current);
    const containerSize = parseInt(style.width);
    setSize(containerSize);
  }, []);

  // Debounced version to use as a resize event listener
  const resizeCanvasDebounce = useCallback(debounce(resizeCanvas, 50), []);

  // Clears and resets the canvas so parts can be redrawn
  const resetCanvas = () => {
    clearCanvas(canvasRef.current);
    drawnPartsRef.current = 0;
  };

  // Resize the canvas when the window size changes
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvasDebounce);
    return () => window.removeEventListener('resize', resizeCanvasDebounce);
  }, [resizeCanvas, resizeCanvasDebounce]);

  // Reset and redraw whenever canvas size changes
  useEffect(resetCanvas, [size]);

  // Draw the hangman parts
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // If the guess count went backward then reset the drawn state
    if (previousIncorrectGuessCountRef.current > incorrectGuessCount) {
      resetCanvas();
    }
    previousIncorrectGuessCountRef.current = incorrectGuessCount;

    // Draw the relevant part for the number of incorrect guesses
    const partsToDraw = hangmanParts.slice(drawnPartsRef.current, incorrectGuessCount);
    partsToDraw.forEach(f => draw(context, f));
    drawnPartsRef.current = incorrectGuessCount;
  }, [hangmanParts, incorrectGuessCount]);

  return (
    <div className="Hangman" ref={containerRef}>
      <canvas ref={canvasRef} height={size} width={size}></canvas>
    </div>
  );
};

Hangman.propTypes = {
  incorrectGuessCount: PropTypes.number.isRequired,
};
