document.addEventListener('DOMContentLoaded', () => {

    const grid = document.querySelector('.grid');
    const gameMusic = document.querySelector('#game-music');
    const width = 10;
    const height = 20;

    const songList = [
      'hold_on_tight.mp3',
      'strategy.mp3',
      'takedown.mp3',
      'this_is_for.mp3'
    ];

    for (let i = 0; i < width * height; i++) {
        const div = document.createElement('div');
        grid.appendChild(div);
    }
    for (let i = 0; i < width; i++) {
        const div = document.createElement('div');
        div.classList.add('taken');
        grid.appendChild(div);
    }

    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const nextDisplay = document.querySelector('.next-container');
    const levelDisplay = document.querySelector('#level');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const rotateBtn = document.getElementById('rotate-btn');
    const downBtn = document.getElementById('down-btn');

    let nextRandom = 0;
    let timerId;
    let score = 0;
    let level = 1;
    let timerSpeed = 1000;

    const colors = [
      '#FF6B6B', 
      '#FFC75F',
      '#88D8B0',
      '#9D638B',
      '#5E94D4',
      '#A799B7',
      '#E8B4BC'
    ];

    const lTetromino = [
      [1, width + 1, width * 2 + 1, 2],
      [width, width + 1, width + 2, width * 2 + 2],
      [1, width + 1, width * 2 + 1, width * 2],
      [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];
    const zTetromino = [
      [0, width, width + 1, width * 2 + 1],
      [width + 1, width + 2, width * 2, width * 2 + 1],
      [0, width, width + 1, width * 2 + 1],
      [width + 1, width + 2, width * 2, width * 2 + 1]
    ];
    const tTetromino = [
      [1, width, width + 1, width + 2],
      [1, width + 1, width + 2, width * 2 + 1],
      [width, width + 1, width + 2, width * 2 + 1],
      [1, width, width + 1, width * 2 + 1]
    ];
    const oTetromino = [
      [0, 1, width, width + 1],
      [0, 1, width, width + 1],
      [0, 1, width, width + 1],
      [0, 1, width, width + 1]
    ];
    const iTetromino = [
      [1, width + 1, width * 2 + 1, width * 3 + 1],
      [width, width + 1, width + 2, width + 3],
      [1, width + 1, width * 2 + 1, width * 3 + 1],
      [width, width + 1, width + 2, width + 3]
    ];
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
    let currentPosition = 4;
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let currentRotation = 0;
    let current = theTetrominoes[random][currentRotation];

    function draw() {
      current.forEach(index => {
          const square = squares[currentPosition + index];
          if (square) {
              square.classList.add('tetromino');
              square.style.backgroundColor = colors[random];
          }
      });
    }

    function undraw() {
      current.forEach(index => {
          const square = squares[currentPosition + index];
          if (square) {
              square.classList.remove('tetromino');
              square.style.backgroundColor = '';
          }
      });
    }

    function moveDown() {
      undraw();
      currentPosition += width;
      draw();
      freeze();
    }

    function freeze() {
      if (current.some(index => squares[currentPosition + index + width] && squares[currentPosition + index + width].classList.contains('taken'))) {
          current.forEach(index => squares[currentPosition + index].classList.add('taken'));
          random = nextRandom;
          nextRandom = Math.floor(Math.random() * theTetrominoes.length);
          current = theTetrominoes[random][currentRotation];
          currentPosition = 4;
          draw();
          displayNextTetromino();
          addScore();
          gameOver();
      }
    }

    function moveLeft() {
      undraw();
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
      if (!isAtLeftEdge && !current.some(index => squares[currentPosition + index - 1].classList.contains('taken'))) {
          currentPosition -= 1;
      }
      draw();
    }

    function moveRight() {
      undraw();
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
      if (!isAtRightEdge && !current.some(index => squares[currentPosition + index + 1].classList.contains('taken'))) {
          currentPosition += 1;
      }
      draw();
    }

    function rotate() {
      undraw();
      const currentRotationOld = currentRotation;
      currentRotation++;
      if (currentRotation === current.length) {
          currentRotation = 0;
      }
      current = theTetrominoes[random][currentRotation];
      
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
      
      if (isAtLeftEdge && isAtRightEdge) {
          currentRotation = currentRotationOld;
          current = theTetrominoes[random][currentRotation];
      }
      draw();
    }

    function moveDownFast() {
        undraw();
        while(!current.some(index => squares[currentPosition + index + width] && squares[currentPosition + index + width].classList.contains('taken'))) {
            currentPosition += width;
        }
        draw();
        freeze();
    }

    // Event listener untuk keyboard
    document.addEventListener('keyup', control);
    function control(e) {
      if (timerId) {
          if (e.keyCode === 37) { moveLeft(); }
          else if (e.keyCode === 38) { rotate(); }
          else if (e.keyCode === 39) { moveRight(); }
          else if (e.keyCode === 40) { moveDown(); }
          else if (e.keyCode === 32) { moveDownFast(); }
      }
    }

    // Event listener untuk tombol sentuh
    if (leftBtn) leftBtn.addEventListener('click', moveLeft);
    if (rightBtn) rightBtn.addEventListener('click', moveRight);
    if (rotateBtn) rotateBtn.addEventListener('click', rotate);
    if (downBtn) downBtn.addEventListener('click', moveDownFast);

    const displayNextTetromino = () => {
      if (nextDisplay.children.length === 0) {
        for(let i=0; i<16; i++) {
          const div = document.createElement('div');
          nextDisplay.appendChild(div);
        }
      }
      const displaySquares = Array.from(nextDisplay.querySelectorAll('div'));
      const displayWidth = 4;
      const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2],
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [0, 1, displayWidth, displayWidth + 1],
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
      ];
      displaySquares.forEach(square => {
        square.classList.remove('tetromino');
        square.style.backgroundColor = '';
      });
      upNextTetrominoes[nextRandom].forEach(index => {
        if (displaySquares[index]) {
          displaySquares[index].classList.add('tetromino');
          displaySquares[index].style.backgroundColor = colors[nextRandom];
        }
      });
    }

    function addScore() {
      for (let i = 0; i < width * height; i += width) {
        const row = [];
        for(let j = 0; j < width; j++) {
            row.push(i + j);
        }
        if (row.every(index => squares[index].classList.contains('taken'))) {
            score += 10;
            scoreDisplay.innerHTML = score;
            row.forEach(index => {
                squares[index].classList.remove('taken');
                squares[index].classList.remove('tetromino');
                squares[index].style.backgroundColor = '';
            });
            const squaresRemoved = squares.splice(i, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid.appendChild(cell));
        }
      }
    }

    function gameOver() {
      if (current.some(index => squares[currentPosition + index] && squares[currentPosition + index].classList.contains('taken'))) {
          scoreDisplay.innerHTML = 'END';
          startBtn.innerHTML = 'Mulai Lagi';
          clearInterval(timerId);
          document.removeEventListener('keyup', control);
          if (gameMusic) gameMusic.pause();
      }
    }

    startBtn.addEventListener('click', () => {
      if (timerId) {
          clearInterval(timerId);
          timerId = null;
          startBtn.innerHTML = 'Lanjutkan';
          document.removeEventListener('keyup', control);
          if (gameMusic) gameMusic.pause();
      } else {
          if (gameMusic) {
              const randomSongIndex = Math.floor(Math.random() * songList.length);
              gameMusic.src = songList[randomSongIndex];
              gameMusic.play();
          }

          draw();
          timerId = setInterval(moveDown, timerSpeed);
          nextRandom = Math.floor(Math.random() * theTetrominoes.length);
          displayNextTetromino();
          startBtn.innerHTML = 'Jeda';
          document.addEventListener('keyup', control);
      }
    });

});
