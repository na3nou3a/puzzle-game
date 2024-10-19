// ======================== VARIABLES ===========================
const inputFile = document.querySelector('#input-file');
const randomImgBtn = document.querySelector('.random-btn');
const chooseBtn = document.querySelector('.choose-btn');

let containerWidth = 0;
let containerHeight = 0;
const bgPositions = [];
let puzzleCells = [];
let dragableCells = [];
const images = [];
let puzzleImage = '';
let correctPoints = 0;
let wrongPoints = 0;

// ======================== EVENTS ==========================
window.addEventListener('load', start);
window.addEventListener('resize', () => location.reload());
inputFile.addEventListener('change', uploadNewImage);
randomImgBtn.addEventListener('click', getRandomImage);
chooseBtn.addEventListener('click', showGallery);

// ======================== FUNCTIONS ===========================
function start() {
  createGalleryImages();
  puzzleImage = getRandomImgFromGallery();
  createBgPositions();
  createElements();
  createDragDropEvents();
}
function createGalleryImages() {
  // initiate galley array
  for (let i = 0; i < 15; i++) {
    images.push(`images/img-${i + 1}.jpg`);
  }
}
function getRandomImgFromGallery() {
  return images[Math.floor(Math.random() * images.length)];
}
function createBgPositions() {
  const dragableCellsContainer = document.querySelector('.cells');
  const horizontalCellsNum = 5;
  const verticalCellsNum = 4;
  containerWidth = dragableCellsContainer.clientWidth;
  containerHeight = dragableCellsContainer.clientHeight;
  const XPositions = [];
  const YPositions = [];
  for (let i = 0; i < horizontalCellsNum; i++) {
    XPositions.push((i * containerWidth) / horizontalCellsNum);
  }
  for (let i = 0; i < verticalCellsNum; i++) {
    YPositions.push((i * containerHeight) / verticalCellsNum);
  }
  for (let i = 0; i < YPositions.length; i++) {
    const y = YPositions[i];
    for (let j = 0; j < XPositions.length; j++) {
      const x = XPositions[j];
      bgPositions.push([x, y]);
    }
  }
  // console.log(XPositions);
  // console.log(YPositions);
  // console.log(bgPositions);
}
function createElements() {
  createPuzzlePlatform();
  createDraggableCellsPlatform();
  createFinalImgPlatform();
  createGalleryPlatform();
}
function createPuzzlePlatform() {
  const puzzleCellsContainer = document.querySelector('.puzzle');
  const horizontalCellsNum = 5;
  const verticalCellsNum = 4;
  puzzleCells = [];
  const numberOfCells = horizontalCellsNum * verticalCellsNum;
  puzzleCellsContainer.innerHTML = '';
  for (let i = 0; i < numberOfCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.setAttribute('data-index', i);
    puzzleCells.push(cell);
    puzzleCellsContainer.appendChild(cell);
  }
}
function createDraggableCellsPlatform() {
  const dragableCellsContainer = document.querySelector('.cells');
  const horizontalCellsNum = 5;
  const verticalCellsNum = 4;
  dragableCells = [];
  const numberOfCells = horizontalCellsNum * verticalCellsNum;
  for (let i = 0; i < numberOfCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.setAttribute('data-index', i);
    cell.setAttribute('draggable', true);
    dragableCells.push(cell);
  }
  const shuffledDraggableCellsArr = shuffleDraggableCellsPositions();
  dragableCellsContainer.innerHTML = '';
  shuffledDraggableCellsArr.forEach((cell, i) => {
    const dataIndex = cell.dataset.index;
    cell.style.backgroundImage = `url(${puzzleImage})`;
    cell.style.backgroundPosition = `-${bgPositions[dataIndex][0]}px -${bgPositions[dataIndex][1]}px`;
    cell.style.backgroundSize = `${containerWidth}px ${containerHeight}px`;
    dragableCellsContainer.appendChild(cell);
  });
}
function createFinalImgPlatform() {
  const finalImage = document.querySelector('.final-img > img');
  finalImage.src = puzzleImage;
}
function createGalleryPlatform() {
  const gallery = document.querySelector('.gallery');
  const closeGallery = gallery.querySelector('.close-gallery');
  for (let i = 0; i < images.length; i++) {
    const img = document.createElement('img');
    img.src = images[i];
    img.addEventListener('click', () => {
      showLoader();
      hideGallery();
      playWithNewImage(images[i]);
      hideLoader();
    });
    gallery.appendChild(img);
  }
  closeGallery.addEventListener('click', hideGallery);
}

function createDragDropEvents() {
  let selected = '';
  dragableCells.forEach((cell, i) => {
    cell.addEventListener('dragstart', (e) => {
      selected = e.target;
    });
    puzzleCells[i].addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    puzzleCells[i].addEventListener('drop', () => {
      if (puzzleCells[i].children.length === 0) {
        selected.style.outline = 0;
        puzzleCells[i].append(selected);
        updateScore(selected, i);
      }
    });
    puzzleCells[i].addEventListener('dragenter', () => {
      puzzleCells[i].classList.add('active');
    });
    puzzleCells[i].addEventListener('dragleave', () => {
      puzzleCells[i].classList.remove('active');
    });
  });
}
function updateScore(selectedCell, i) {
  const horizontalCellsNum = 5;
  const verticalCellsNum = 4;
  const numberOfCells = horizontalCellsNum * verticalCellsNum;
  if (selectedCell.dataset.index === puzzleCells[i].dataset.index) {
    correctPoints = 0;
    puzzleCells.forEach((pCell) => {
      const fChild = pCell.firstElementChild;
      if (fChild && pCell.dataset.index === fChild.dataset.index) {
        correctPoints++;
      }
    });
  } else {
    wrongPoints++;
  }
  if (correctPoints === numberOfCells) {
    gameOver(true);
    return;
  }
  const emptyPCell = puzzleCells.find((pCell) => !pCell.firstElementChild);
  if (!emptyPCell && correctPoints < numberOfCells) {
    gameOver(false);
  }
  // console.log(correctPoints, wrongPoints);
}
function gameOver(bool) {
  const modal = document.querySelector('.modal');
  const modalText = modal.querySelector('.modal-text');
  const modalBtn = modal.querySelector('.modal-btn');
  modal.style.cssText = 'opacity: 1; display: grid;';
  if (bool) {
    const attempt = modal.querySelector('.attempt');
    attempt.textContent = wrongPoints;
  } else {
    modalText.innerHTML = '<span>You Lost 😢.</span> Please Try Again!';
  }
  modalBtn.onclick = () => location.reload();
}
function playWithNewImage(url) {
  correctPoints = 0;
  wrongPoints = 0;
  puzzleImage = url;
  showLoader();
  createPuzzlePlatform();
  createDraggableCellsPlatform();
  createFinalImgPlatform();
  createDragDropEvents();
  hideLoader();
}
function shuffleDraggableCellsPositions() {
  return [...dragableCells].sort(() => Math.random() - 0.5);
}
function uploadNewImage() {
  const imgUrl = URL.createObjectURL(inputFile.files[0]);
  showLoader();
  playWithNewImage(imgUrl);
  hideLoader();
}
async function getRandomImage() {
  showLoader();
  const url = await fetchImage();
  playWithNewImage(url);
  hideLoader();
}
function showGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.classList.add('active');
}
function hideGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.classList.remove('active');
}
function showLoader() {
  const loader = document.querySelector('.loader');
  loader.classList.add('active');
}
function hideLoader() {
  const loader = document.querySelector('.loader');
  loader.classList.remove('active');
}
async function fetchImage() {
  return fetch('https://random.imagecdn.app/800/600').then((res) => res.url);
}
